import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import * as userCtrl from "./controllers/userController";
import * as songCtrl from "./controllers/songController";
import * as financeCtrl from "./controllers/financeController";
import * as reqCtrl from "./controllers/requestController";
import "./events/emailEvents"; // Initialize listeners

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
  return false;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  setupCloudinary();

  // JSON Body Parser
  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      cloudinary: {
        configured: !!cloudinary.config().cloud_name,
        hasKey: !!(process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY),
        hasCloudName: !!(process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME),
        cloudName: (process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)
      }
    });
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

  // Cloudinary Signing Endpoint
  app.post("/api/cloudinary-sign", (req, res) => {
    console.log("📥 Signature Request Hit:", req.body);
    try {
      const apiKey = (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY)?.trim();
      const apiSecret = (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET)?.trim();
      const cloudName = (process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)?.trim();
      const uploadPreset = (process.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET)?.trim();
      
      if (!apiKey || !apiSecret || !cloudName) {
        console.error("❌ Cloudinary Config Missing:", { 
          hasKey: !!apiKey, 
          hasSecret: !!apiSecret, 
          cloudName: cloudName 
        });
        return res.status(500).json({ 
          error: "Cloudinary is not fully configured on the server. Please check your environment variables." 
        });
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const params = {
        folder: "ind-distribution",
        timestamp: timestamp,
        ...(uploadPreset ? { upload_preset: uploadPreset } : {}),
        ...req.body.params
      };

      console.log("📝 Generating Signature for params:", { ...params, api_key: apiKey });

      const signature = cloudinary.utils.api_sign_request(
        params,
        apiSecret
      );

      console.log("✅ Signature generated:", signature.substring(0, 8) + "...");

      res.json({
        signature,
        timestamp,
        apiKey: apiKey,
        cloudName: cloudName,
        uploadPreset: uploadPreset
      });
    } catch (error: any) {
      console.error("Cloudinary signing error:", error);
      res.status(500).json({ 
        error: "Internal server error during signature generation",
        message: error?.message || "Check server logs"
      });
    }
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

startServer();
