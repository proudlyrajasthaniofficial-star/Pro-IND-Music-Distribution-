Import dotenv from "dotenv";
dotenv.config();

import express from "express";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { rateLimit } from "express-rate-limit"; // Rate limiting import किया गया
import * as userCtrl from "./controllers/userController.ts";
import * as songCtrl from "./controllers/songController.ts";
import * as financeCtrl from "./controllers/financeController.ts";
import * as reqCtrl from "./controllers/requestController.ts";
import * as cashfreeService from "./services/cashfreeService.ts";
import { admin, getAdminDb } from "./services/firebaseAdmin.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rate Limiter Setup: यह सर्वर को स्पैम से बचाएगा
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 मिनट
  max: 100, // हर IP को 15 मिनट में सिर्फ 100 रिक्वेस्ट की इजाजत है
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Cloudinary Configuration
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
  app.use(compression());
  app.set("trust proxy", true);
  
  // Rate limiter को सभी API रूट्स पर लागू किया गया
  app.use("/api/", limiter);

  const PORT = 3000;

  // Logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const isWebhook = req.url.includes('webhook');
      if (isWebhook || res.statusCode >= 400) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
      }
    });
    next();
  });

  setupCloudinary();
  
  // HTTPS Redirect
  app.use((req, res, next) => {
    const isHttps = req.headers["x-forwarded-proto"] === "https";
    const isProd = process.env.NODE_ENV === "production" || req.hostname.includes("musicdistributionindia.online");
    const isLocalhost = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    
    if (isProd && !isHttps && !isLocalhost) {
      return res.redirect(301, `https://${req.get("host")}${req.url}`);
    }
    next();
  });

  // Sitemap
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
    const target = fs.existsSync(sitemapPath) ? sitemapPath : distSitemap;
    
    res.header("Content-Type", "application/xml");
    if (fs.existsSync(target)) {
      return res.sendFile(target);
    } else {
      const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://musicdistributionindia.online/</loc><priority>1.0</priority></url></urlset>`;
      res.send(fallbackSitemap);
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    const robotsContent = `User-agent: *\nAllow: /\nDisallow: /admin/login\nDisallow: /dashboard/login\n\nSitemap: https://musicdistributionindia.online/sitemap.xml`;
    res.send(robotsContent);
  });

  app.get("/about", (req, res) => {
    res.redirect(301, "/founder-developer");
  });

  app.use(express.static(path.join(__dirname, "public")));

  // JSON Body Parser
  app.use((req, res, next) => {
    const rawPath = req.path || "";
    const isWebhook = rawPath.toLowerCase().includes("/api/cashfree/webhook");
    if (isWebhook) {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  // Cashfree Create Order
  app.post("/api/cashfree/create-order", async (req, res) => {
    try {
      const { planId, amount, userId, customerEmail, customerPhone } = req.body;
      if (!planId || !amount || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      let appUrl = 'https://musicdistributionindia.online';
      const orderData = await cashfreeService.createCashfreeOrder(userId, planId, amount, customerEmail, customerPhone, appUrl);
      const environment = process.env.CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox';
      res.json({ ...orderData, environment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cashfree Webhook
  app.post("/api/cashfree/webhook", express.raw({ type: "*/*" }), async (req, res) => {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    
    try {
      const rawBody = req.body.toString();
      const isValid = cashfreeService.verifyCashfreeWebhook(rawBody, signature, timestamp);

      if (!isValid) return res.status(400).send("Invalid signature");

      const event = JSON.parse(rawBody);
      if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
        const order = event.data.order;
        const userId = order.order_tags?.userId;
        const planId = order.order_tags?.planId;

        if (userId && planId) {
          await getAdminDb().collection("users").doc(userId).update({
            planId: planId,
            subscriptionStatus: 'active',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      return res.status(500).send("Error");
    }
  });

  // Cloudinary Sign
  app.post("/api/cloudinary-sign", (req, res) => {
    try {
      const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = cloudinary.utils.api_sign_request({ timestamp, folder: "ind-distribution", ...req.body.params }, apiSecret!);
      res.json({ signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
    } catch (error) {
      res.status(500).json({ error: "Sign failed" });
    }
  });

  // Controllers
  app.post("/api/auth/signup", userCtrl.signup);
  app.post("/api/auth/verify", userCtrl.verifyEmail);
  app.post("/api/releases/upload-notify", songCtrl.uploadSong);
  app.post("/api/finance/withdrawal-request", financeCtrl.requestWithdrawal);

  // Vite or Production Static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  process.exit(1);
});
