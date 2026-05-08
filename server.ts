import dotenv from "dotenv";
dotenv.config();

import express from "express";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import helmet from "helmet";
import cors from "cors";
// @ts-ignore
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import logger from "./lib/logger.ts";
import { globalLimiter, authLimiter, uploadLimiter, paymentLimiter } from "./middleware/security.ts";
import * as userCtrl from "./controllers/userController.ts";
import * as songCtrl from "./controllers/songController.ts";
import * as financeCtrl from "./controllers/financeController.ts";
import * as reqCtrl from "./controllers/requestController.ts";
import * as cashfreeService from "./services/cashfreeService.ts";
import { admin, getAdminDb } from "./services/firebaseAdmin.ts";

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
    logger.info("Cloudinary Configured");
    return true;
  }
  logger.warn("Cloudinary Config Missing Keys - Signing might fail");
  return false;
}

async function startServer() {
  const app = express();
  
  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "'unsafe-eval'", 
          "https://checkout.cashfree.com", 
          "https://sdk.cashfree.com", 
          "https://*.firebase.com", 
          "https://*.googleapis.com", 
          "https://*.google.com",
          "https://*.gstatic.com",
          "https://*.cloudinary.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.firebaseusercontent.com", "https://*.googleusercontent.com", "https://*.cloudinary.com", "https://*.google.com", "https://*.gstatic.com"],
        connectSrc: [
          "'self'", 
          "https://*.cashfree.com", 
          "https://*.googleapis.com", 
          "https://firestore.googleapis.com", 
          "https://*.firebase.io", 
          "https://*.cloudinary.com", 
          "https://*.google-analytics.com", 
          "wss://*.run.app",
          "https://*.google.com"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        frameSrc: ["'self'", "https://checkout.cashfree.com", "https://sdk.cashfree.com", "https://*.google.com"],
        frameAncestors: ["'self'", "https://*.run.app", "https://*.google.com", "https://ai.studio", "https://*.googleusercontent.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    frameguard: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS Configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://musicdistributionindia.online', 'https://www.musicdistributionindia.online'] 
      : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-webhook-signature', 'x-webhook-timestamp'],
    credentials: true,
  }));

  // Compression and Proxy
  app.use(compression());
  app.set("trust proxy", 1);
  const PORT = 3000;

  // Global Rate Limiting (Skip for webhooks)
  app.use('/api/', (req, res, next) => {
    if (req.path.toLowerCase().includes('/cashfree/webhook')) {
      return next();
    }
    globalLimiter(req, res, next);
  });

  // Body Parsing & Sanitization
  app.use((req, res, next) => {
    const rawPath = req.path || "";
    const isWebhook = rawPath.toLowerCase().includes("/api/cashfree/webhook");
    
    if (isWebhook) {
      next();
    } else {
      express.json({ limit: '1mb' })(req, res, (err) => {
        if (err) return res.status(400).json({ error: "Invalid JSON payload" });
        next();
      });
    }
  });

  // Sanitization: Scope to API routes ONLY
  app.use('/api', mongoSanitize());
  app.use('/api', xss());

  // move logger to the top for better debugging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const isWebhook = req.url.includes('webhook');
      if (isWebhook || res.statusCode >= 400) {
        logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
      }
    });
    next();
  });

  setupCloudinary();
  // Redirect logic: Skip for development domains
  app.use((req, res, next) => {
    const isHttps = req.headers["x-forwarded-proto"] === "https";
    const hostname = req.hostname;
    // Only redirect if explicitly on our custom domain and not HTTPS, 
    // or if we are in production and not behind a local/dev domain
    const isCustomDomain = hostname.includes("musicdistributionindia.online");
    const isDevSubdomain = hostname.includes("ais-dev-") || hostname.includes("ais-pre-") || hostname.includes("localhost") || hostname.includes("127.0.0.1");
    
    if (isCustomDomain && !isDevSubdomain && !isHttps && process.env.NODE_ENV === "production") {
      const targetHost = process.env.APP_URL ? new URL(process.env.APP_URL).host : hostname;
      return res.redirect(301, `https://${targetHost}${req.url}`);
    }
    next();
  });

  // Explicit handlers for sitemap and robots to ensure correct content headers
  // We place these BEFORE express.static to ensure headers are correctly set
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
    const target = fs.existsSync(sitemapPath) ? sitemapPath : distSitemap;
    
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");

    if (fs.existsSync(target)) {
      return res.sendFile(target);
    } else {
      // Fallback simple sitemap if file missing
      const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://musicdistributionindia.online/</loc><priority>1.0</priority></url>
  <url><loc>https://musicdistributionindia.online/features</loc><priority>0.8</priority></url>
  <url><loc>https://musicdistributionindia.online/blog</loc><priority>0.8</priority></url>
</urlset>`;
      res.send(fallbackSitemap);
    }
  });

  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");

    // We hardcode the "Allow everything" rules to be 100% sure Google sees them
    const robotsContent = `User-agent: *
Allow: /
Disallow: /admin/login
Disallow: /dashboard/login

Sitemap: https://musicdistributionindia.online/sitemap.xml`;
    
    res.send(robotsContent);
  });

  // Server-side redirect for /about to founder page for better SEO
  app.get("/about", (req, res) => {
    res.redirect(301, "/founder-developer");
  });

  // Explicitly serve static files from public directory
  app.use(express.static(path.join(__dirname, "public")));

  // JSON Body Parser (except for webhooks)
  // Already handled above by the limited parser, but keeping a fallback if needed for other non-path specific checks
  // Removing redundant parser that was causing issues
  // app.use((req, res, next) => { ... })


  // Cashfree Order Creation Endpoint
  app.post("/api/cashfree/create-order", paymentLimiter, async (req, res) => {
    try {
      const { planId, amount, userId, customerEmail, customerPhone } = req.body;
      if (!planId || !amount || !userId) {
        return res.status(400).json({ error: "Missing required fields: planId, amount, and userId are mandatory." });
      }
      
      let appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      
      // Force custom domain for webhooks if we're not on localhost
      if (!appUrl.includes('localhost') && !appUrl.includes('127.0.0.1')) {
        appUrl = 'https://musicdistributionindia.online';
      }

      const orderData = await cashfreeService.createCashfreeOrder(userId, planId, amount, customerEmail, customerPhone, appUrl);
      
      // Include the environment so the frontend knows which mode to use for SDK initialization
      const environment = process.env.CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox';
      
      res.json({
        ...orderData,
        environment
      });
    } catch (error: any) {
      logger.error("Cashfree Order Error", { message: error.message });
      res.status(500).json({ 
        error: "Cashfree Order Creation Failed"
      });
    }
  });

  // Cashfree Webhook Endpoint (GET for pings/health checks)
  app.get("/api/cashfree/webhook", (req, res) => {
    logger.info("Cashfree Webhook Ping", { ip: req.ip });
    res.json({ 
      status: "active", 
      message: "Cashfree Webhook Endpoint is online.",
      domain: "musicdistributionindia.online",
      serverTime: new Date().toISOString()
    });
  });

  // Supporting both with and without trailing slash explicitly if needed
  app.get("/api/cashfree/webhook/", (req, res) => {
    res.redirect(301, "/api/cashfree/webhook");
  });

  // POST handler for actual Cashfree events
  app.post("/api/cashfree/webhook", express.raw({ type: "*/*" }), async (req, res) => {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;
    
    if (!signature || !timestamp) {
      logger.warn("Cashfree Webhook: Missing signature or timestamp header");
      return res.status(200).json({ status: "ok", message: "Endpoint active" });
    }

    try {
      const rawBody = req.body && req.body.length > 0 ? req.body.toString() : "";
      
      if (!rawBody) {
        logger.error("Cashfree Webhook: Empty body");
        return res.status(400).send("Empty body");
      }

      const isValid = cashfreeService.verifyCashfreeWebhook(rawBody, signature, timestamp);

      if (!isValid) {
          logger.error("Cashfree Webhook: Invalid Signature Match");
          return res.status(400).send("Invalid signature");
      }

      const event = JSON.parse(rawBody);
      logger.info("Cashfree Webhook Event", { type: event.type });
      
      if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
        const order = event.data.order;
        const userId = order.order_tags?.userId;
        const planId = order.order_tags?.planId;

        logger.info("Payment Success via Webhook", { 
          paymentId: event.data.payment.cf_payment_id, 
          userId, 
          planId 
        });

        if (userId && planId) {
          try {
            await getAdminDb().collection("users").doc(userId).update({
              planId: planId,
              lastPaymentId: event.data.payment.cf_payment_id,
              subscriptionStatus: 'active',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            await getAdminDb().collection("subscriptions").add({
              userId,
              planId,
              status: "active",
              cfOrderId: order.order_id,
              cfPaymentId: event.data.payment.cf_payment_id,
              amount: order.order_amount,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            logger.info("Webhook DB Update Success", { userId });
          } catch (dbError: any) {
            logger.error("Webhook DB Update Error", { message: dbError.message });
          }
        } else {
          logger.error("Webhook Data Missing tags", { tags: order.order_tags });
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      logger.error("Webhook Fatal Error", { message: err.message });
      return res.status(500).send("Webhook processing error");
    }
  });

  // Also handle POST with trailing slash
  app.post("/api/cashfree/webhook/", (req, res) => {
    res.redirect(307, "/api/cashfree/webhook");
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
  app.post("/api/cloudinary-sign", uploadLimiter, (req, res) => {
    try {
      const apiKey = (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY)?.trim();
      const apiSecret = (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET)?.trim();
      const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME)?.trim();
      const uploadPreset = (process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default")?.trim();
      
      if (!apiKey || !apiSecret || !cloudName) {
        logger.error("Cloudinary Config Missing", { cloudName });
        return res.status(500).json({ 
          error: "Cloudinary is not configured on the server." 
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
      logger.error("Cloudinary signing error", { message: error.message });
      res.status(500).json({ error: "Failed to generate upload signature." });
    }
  });

  // Example API route for generating ISRC (Mock logic for premium feel)
  app.post("/api/generate-isrc", (req, res) => {
    const isrc = "IN-D" + Math.random().toString(36).substring(2, 10).toUpperCase();
    res.json({ isrc });
  });

  // --- AUTOMATED NOTIFICATION ENDPOINTS ---
  app.post("/api/auth/signup", authLimiter, userCtrl.signup);
  app.post("/api/auth/verify", authLimiter, userCtrl.verifyEmail);
  app.post("/api/releases/upload-notify", uploadLimiter, songCtrl.uploadSong);
  app.post("/api/admin/releases/update-status-notify", authLimiter, songCtrl.updateStatus);
  app.post("/api/billing/process-payment", paymentLimiter, songCtrl.processPayment);
  
  // Finance Endpoints
  app.post("/api/finance/royalty-alert", financeCtrl.addRoyalty);
  app.post("/api/finance/withdrawal-request", financeCtrl.requestWithdrawal);
  app.post("/api/finance/withdrawal-status-update", financeCtrl.updateWithdrawalStatus);

  // Request Endpoints
  app.post("/api/requests/submit", reqCtrl.submitRequest);
  app.post("/api/requests/status-update", reqCtrl.updateRequestStatus);

  // API Catch-all (Before static assets) - EXPLICIT 404
  app.all("/api/*", (req, res) => {
    const rawPath = req.path || req.url;
    console.warn(`[404] No Route Matched: ${req.method} ${rawPath}`);
    console.warn(`Headers: ${JSON.stringify(req.headers)}`);
    res.status(404).json({ 
      error: `IND Distribution API: Endpoint ${req.method} ${rawPath} does not exist.`,
      debug: {
        method: req.method,
        path: rawPath,
        timestamp: new Date().toISOString()
      }
    });
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
    console.log(`📦 Serving production build from: ${distPath}`);
    
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
          // For JS, CSS, and other hashed assets
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));

    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`❌ Index file missing at: ${indexPath}`);
        res.status(500).send("Application build is missing or incomplete. Please rebuild.");
      }
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
