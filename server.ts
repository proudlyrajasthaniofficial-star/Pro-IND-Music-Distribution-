import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import * as userCtrl from "./controllers/userController.ts";
import * as songCtrl from "./controllers/songController.ts";
import * as financeCtrl from "./controllers/financeController.ts";
import * as reqCtrl from "./controllers/requestController.ts";
import "./events/emailEvents.ts"; // Initialize listeners

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Configuration (Lazy init to prevent crash on missing keys)
function setupCloudinary() {
  const cloudName = (process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)?.trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY)?.trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET)?.trim();

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    console.log("✅ Cloudinary Configured");
    return true;
  }
  console.warn("⚠️ Cloudinary Config Missing Keys - Signing might fail");
  return false;
}

async function startServer() {
  const app = express();
  app.set("trust proxy", true);
  const PORT = 3000;

  setupCloudinary();
  
  // Force HTTPS in production
  app.use((req, res, next) => {
    // Check for HTTPS using x-forwarded-proto (standard for Cloud Run/Nginx)
    const isHttps = req.headers["x-forwarded-proto"] === "https";
    const isProd = process.env.NODE_ENV === "production";
    
    if (isProd && !isHttps) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  // Explicit handlers for sitemap and robots to ensure correct content headers
  // We place these BEFORE express.static to ensure headers are correctly set
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    
    if (fs.existsSync(sitemapPath)) {
      res.header("Content-Type", "application/xml");
      res.header("X-Robots-Tag", "noindex, follow"); // Sitemap itself shouldn't be indexed, but followed
      res.header("Cache-Control", "public, max-age=3600");
      return res.sendFile(sitemapPath);
    }
    res.status(404).end();
  });

  app.get("/robots.txt", (req, res) => {
    const robotsPath = path.join(process.cwd(), "public", "robots.txt");
    
    if (fs.existsSync(robotsPath)) {
      res.header("Content-Type", "text/plain");
      res.header("Cache-Control", "public, max-age=3600");
      return res.sendFile(robotsPath);
    }
    res.status(404).end();
  });

  // Explicitly serve static files from public directory
  app.use(express.static(path.join(__dirname, "public")));

  // JSON Body Parser
  app.use(express.json());

  // Simple Request Logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      cloudinary: {
        configured: !!(process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME),
      }
    });
  });

  // Cloudinary Signing Endpoint (High Priority)
  app.post("/api/cloudinary-sign", (req, res) => {
    try {
      const apiKey = (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY)?.trim();
      const apiSecret = (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET)?.trim();
      const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME)?.trim();
      const uploadPreset = (process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default")?.trim();
      
      if (!apiKey || !apiSecret || !cloudName) {
        console.error("❌ Cloudinary Config Missing:", { hasKey: !!apiKey, hasSecret: !!apiSecret, cloudName });
        return res.status(500).json({ 
          error: "Cloudinary is not configured on the server. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in settings." 
        });
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        timestamp,
        folder: "ind-distribution",
        ...(uploadPreset ? { upload_preset: uploadPreset } : {}),
        ...(req.body.params || {})
      };

      const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

      res.json({
        signature,
        timestamp,
        apiKey,
        cloudName,
        uploadPreset
      });
    } catch (error: any) {
      console.error("Cloudinary signing error:", error);
      res.status(500).json({ error: "Failed to generate upload signature." });
    }
  });

  // Example API route for generating ISRC (Mock logic for premium feel)
  app.post("/api/generate-isrc", (req, res) => {
    const isrc = "IN-D" + Math.random().toString(36).substring(2, 10).toUpperCase();
    res.json({ isrc });
  });

  // --- AUTOMATED NOTIFICATION ENDPOINTS ---
  app.post("/api/auth/signup", userCtrl.signup);
  app.post("/api/auth/verify", userCtrl.verifyEmail);
  app.post("/api/releases/upload-notify", songCtrl.uploadSong);
  app.post("/api/admin/releases/update-status-notify", songCtrl.updateStatus);
  app.post("/api/billing/process-payment", songCtrl.processPayment);
  
  // Finance Endpoints
  app.post("/api/finance/royalty-alert", financeCtrl.addRoyalty);
  app.post("/api/finance/withdrawal-request", financeCtrl.requestWithdrawal);
  app.post("/api/finance/withdrawal-status-update", financeCtrl.updateWithdrawalStatus);

  // Request Endpoints
  app.post("/api/requests/submit", reqCtrl.submitRequest);
  app.post("/api/requests/status-update", reqCtrl.updateRequestStatus);

  // API Catch-all (Before static assets) - EXPLICIT 404
  app.all("/api/*", (req, res) => {
    console.warn(`[404] No Route Matched: ${req.method} ${req.url}`);
    res.status(404).json({ error: `IND Distribution API: Endpoint ${req.method} ${req.url} does not exist.` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 IND Distribution Server Running\n🔗 http://localhost:${PORT}\n`);
  });
}

startServer().catch(err => {
  console.error("❌ [CRITICAL] Failed to start server:", err);
  process.exit(1);
});
