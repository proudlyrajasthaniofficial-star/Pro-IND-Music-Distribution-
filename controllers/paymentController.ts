import { Cashfree, CFEnvironment } from "cashfree-pg";
import type { Request, Response } from "express";

// Initialize Cashfree
const getCashfree = () => {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env = process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  if (!appId || !secretKey) {
    console.warn("⚠️ Cashfree Credentials Missing");
    return null;
  }

  return new Cashfree(env, appId, secretKey);
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const cf = getCashfree();
    if (!cf) {
      return res.status(500).json({ error: "Cashfree not configured" });
    }

    const { amount, customerId, customerPhone, customerEmail, orderId, orderNote } = req.body;

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId || `order_${Date.now()}`,
      customer_details: {
        customer_id: customerId || "guest_user",
        customer_phone: customerPhone || "9999999999",
        customer_email: customerEmail || "test@example.com",
      },
      order_meta: {
        return_url: `${req.protocol}://${req.get("host")}/payment-status?order_id={order_id}`,
        notify_url: `${req.protocol}://${req.get("host")}/api/payments/webhook`,
        payment_methods: "cc,dc,ccc,pp,wb,upi,nb",
      },
      order_note: orderNote || "Music Distribution Plan Purchase",
    };

    const response = await cf.PGCreateOrder(request);
    res.json(response.data);
  } catch (error: any) {
    console.error("Cashfree Order Creation Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to create payment order", 
      details: error.response?.data || error.message 
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

    const cf = getCashfree();
    if (!cf) {
      return res.status(500).json({ error: "Cashfree not configured" });
    }

    // Verify signature using SDK
    try {
      if (signature && rawBody && timestamp) {
        cf.PGVerifyWebhookSignature(
          signature as string,
          rawBody,
          timestamp as string
        );
      } else {
        throw new Error("Missing verification headers or body");
      }
    } catch (err) {
      console.error("❌ Webhook Signature Verification Failed:", err);
      return res.status(400).send("Invalid Signature");
    }

    const { data, type } = req.body;

    // We only care about successful payments
    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = data.order.order_id;
      const orderAmount = data.order.order_amount;
      const customerEmail = data.customer_details.customer_email;

      console.log(`✅ Payment Success: Order ${orderId} for ${customerEmail}`);

      // Here you would add logic to update your database
      // For example, finding the user by email and updating their 'plan' field
      // This ensures even if the user closes the browser before redirect, their plan is upgraded.
    }

    res.status(200).send("OK");
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
