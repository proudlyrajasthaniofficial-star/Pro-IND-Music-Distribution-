import { Cashfree, CFEnvironment } from "cashfree-pg";
import type { Request, Response } from "express";

// Initialize Cashfree
const getCashfree = () => {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
  const envValue = process.env.CASHFREE_ENV?.trim()?.toUpperCase();
  
  // Auto-detect environment if not explicitly set correctly
  // If appId starts with 'TEST', it's sandbox. 
  // Sandbox IDs usually start with TEST and keys start with cfsk_ma_test
  const isSandbox = appId?.startsWith("TEST") || appId?.startsWith("TEST_") || envValue !== "PRODUCTION";
  const env = isSandbox ? CFEnvironment.SANDBOX : CFEnvironment.PRODUCTION;

  if (!appId || !secretKey) {
    console.error("❌ Cashfree Configuration Missing:");
    if (!appId) console.error("   - CASHFREE_APP_ID is not set");
    if (!secretKey) console.error("   - CASHFREE_SECRET_KEY is not set");
    return null;
  }

  console.log(`ℹ️ Cashfree Info: Env=${isSandbox ? "SANDBOX" : "PRODUCTION"}, AppId starts with=${appId.substring(0, 4)}..., Env Value=${env}`);
  
  const cf = new Cashfree(env, appId, secretKey);
  
  // Explicitly set properties to be safe
  cf.XClientId = appId;
  cf.XClientSecret = secretKey;
  cf.XEnvironment = env;
  
  // High-priority fix: Use standard API version
  // 2023-08-01 is the most stable and widely supported version currently
  cf.XApiVersion = "2023-08-01";
  
  return cf;
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const cf = getCashfree();
    if (!cf) {
      console.error("❌ Cashfree not configured: Check Environment Variables (CASHFREE_APP_ID, CASHFREE_SECRET_KEY)");
      return res.status(500).json({ error: "Cashfree not configured on server. Please check environment variables." });
    }

    const { amount, customerId, customerPhone, customerEmail, orderId, orderNote } = req.body;

    // Sanitize amount to be a number with 2 decimal places (as string or number)
    const orderAmount = parseFloat(amount?.toString() || "0");
    
    console.log(`💳 Creating order for ${customerEmail || "anonymous"}, Amount: ${orderAmount}`);

    if (orderAmount <= 0) {
      return res.status(400).json({ error: "Order amount must be greater than 0" });
    }

    const request = {
      order_amount: orderAmount,
      order_currency: "INR",
      order_id: orderId || `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      customer_details: {
        customer_id: (customerId || `cust_${Date.now()}`).toString(),
        customer_phone: (customerPhone || "9999999999").toString(),
        customer_email: customerEmail || "test@example.com",
      },
      order_meta: {
        return_url: `${req.protocol}://${req.get("host")}/payment-status?order_id={order_id}`,
        notify_url: `${req.protocol}://${req.get("host")}/api/payments/webhook`,
      },
      order_note: orderNote || "Music Distribution Plan",
    };

    console.log("📦 Request Payload for Cashfree:", JSON.stringify(request, null, 2));

    const response = await cf.PGCreateOrder(request);
    
    if (response && response.data) {
      console.log(`✅ Cashfree Order Created: ${response.data.order_id}`);
      res.json(response.data);
    } else {
      throw new Error("Empty response from Cashfree");
    }
  } catch (error: any) {
    const errorData = error.response?.data || error.message;
    console.error("❌ Cashfree Authentication/Order Error:", JSON.stringify(errorData, null, 2));
    
    // Check for specific authentication error
    if (JSON.stringify(errorData).includes("authentication Failed")) {
      return res.status(401).json({
        error: "Cashfree Authentication Failed",
        details: "The credentials provided (App ID or Secret Key) are invalid for the detected environment. Please ensure you are not using Production keys in Sandbox mode or vice-versa.",
        raw: errorData
      });
    }

    res.status(500).json({ 
      error: "Failed to create payment order", 
      details: errorData
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const cf = getCashfree();
    if (!cf) {
      return res.status(500).json({ error: "Cashfree not configured" });
    }

    const { orderId } = req.body;

    const response = await cf.PGOrderFetchPayments(orderId);
    res.json(response.data);
  } catch (error: any) {
    console.error("Cashfree Verification Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = (req as any).rawBody;

    console.log("🔔 Webhook Received:", {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      bodyType: req.body?.type
    });

    // Handle Cashfree Dashboard Webhook Test
    // Some tests don't have signatures or have dummy ones
    if (!signature && req.body?.msg === "TEST_WEBHOOK") {
      console.log("🧪 Detected Cashfree Webhook Test - Responding OK");
      return res.status(200).send("OK");
    }

    const cf = getCashfree();
    if (!cf) {
      console.error("❌ Webhook failed: Cashfree not configured");
      return res.status(501).send("Not Configured");
    }

    // Verify signature using SDK
    if (signature && rawBody && timestamp) {
      try {
        cf.PGVerifyWebhookSignature(
          signature as string,
          rawBody,
          timestamp as string
        );
      } catch (err: any) {
        console.error("❌ Webhook Signature Verification Failed:", err.message);
        // During testing/onboarding, return 400 for bad signatures
        return res.status(400).send("Invalid Signature");
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production, we REQUIRE verification unless it was the specific TEST_WEBHOOK handled above
      console.warn("⚠️ Webhook missing verification headers in production");
      return res.status(400).send("Missing Headers");
    }

    const { data, type } = req.body;

    // Handle Payment Success
    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = data?.order?.order_id;
      const customerEmail = data?.customer_details?.customer_email;

      console.log(`💰 Payment SUCCESS processed via Webhook: Order=${orderId}, Customer=${customerEmail}`);
      
      // Update your DB here (e.g. upgrade user plan)
    }

    res.status(200).send("OK");
  } catch (error: any) {
    console.error("❌ Webhook Processing Error:", error.message);
    res.status(200).send("OK"); // Return 200 to stop Cashfree retries on logic errors
  }
};
