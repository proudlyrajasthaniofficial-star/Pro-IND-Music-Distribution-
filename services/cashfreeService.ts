import { Cashfree, CFEnvironment } from 'cashfree-pg';

let cashfreeInstance: Cashfree | null = null;

function getCashfree() {
  if (!cashfreeInstance) {
    let appId = process.env.CASHFREE_APP_ID?.trim() || "";
    let secretKey = process.env.CASHFREE_SECRET_KEY?.trim() || "";
    let envVar = process.env.CASHFREE_ENV?.trim() || "SANDBOX";
    
    // Robust cleaning: remove surrounding quotes and any leading "="
    appId = appId.replace(/^=/, '').replace(/^["'](.+)["']$/, '$1').trim();
    secretKey = secretKey.replace(/^=/, '').replace(/^["'](.+)["']$/, '$1').trim();
    envVar = envVar.replace(/^["'](.+)["']$/, '$1').toUpperCase().trim();

    const env = envVar === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

    if (env === CFEnvironment.PRODUCTION) {
      console.log("[Cashfree] Initializing in PRODUCTION mode");
    } else {
      console.log("[Cashfree] Initializing in SANDBOX mode");
    }

    if (!appId || !secretKey) {
      throw new Error('CASHFREE_APP_ID and CASHFREE_SECRET_KEY are required');
    }

    // @ts-ignore
    cashfreeInstance = new Cashfree(
      env,
      appId,
      secretKey
    );
    // Remove manual XApiVersion override to use SDK default (2025-01-01)
  }
  return cashfreeInstance;
}

export async function createCashfreeOrder(userId: string, planId: string, amount: number, customerEmail: string, customerPhone: string, appUrl: string) {
  // @ts-ignore
  const cf = getCashfree();

  // Validate and sanitize phone number - must be 10 digits
  let phoneToUse = customerPhone || '9999999999';
  const sanitizedPhone = phoneToUse.replace(/\D/g, '').slice(-10);
  
  if (sanitizedPhone.length !== 10) {
    throw new Error('Please provide a valid 10-digit mobile number.');
  }

  // Ensure amount is at least 1.00 for Cashfree and has 2 decimals
  const formattedAmount = Number(amount.toFixed(2));
  if (formattedAmount < 1) {
    throw new Error('Minimum order amount should be ₹1');
  }

  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const request = {
    order_amount: formattedAmount,
    order_currency: 'INR',
    order_id: orderId,
    customer_details: {
      customer_id: `cust_${userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 45)}`,
      customer_email: customerEmail || 'no-email@musicdistributionindia.online',
      customer_phone: sanitizedPhone,
    },
    order_meta: {
      return_url: `${appUrl.replace(/\/$/, '')}/dashboard?order_id={order_id}`,
      notify_url: `${appUrl.replace(/\/$/, '')}/api/cashfree/webhook`,
    },
    order_note: `Subscription: ${planId.toUpperCase()}`,
    order_tags: {
      userId: userId,
      planId: planId
    }
  };

  try {
    console.log(`[Cashfree] Creating order ${orderId} for user ${userId} (${formattedAmount} INR)`);
    // @ts-ignore
    const response = await cf.PGCreateOrder(request);
    
    if (response && response.data) {
      console.log(`[Cashfree] Order ${orderId} created successfully. CF Order ID: ${response.data.cf_order_id}`);
      return response.data;
    }
    
    throw new Error('Received empty response from Cashfree');
  } catch (error: any) {
    const errorBody = error.response?.data;
    const errorMessage = errorBody?.message || error.message || 'Unknown error occurred';
    
    console.error('[Cashfree] Order Creation Error:', {
      message: errorMessage,
      code: errorBody?.code,
      type: errorBody?.type,
      requestId: error.response?.headers?.['x-request-id']
    });
    
    throw new Error(errorMessage);
  }
}

export function verifyCashfreeWebhook(payload: string, signature: string, timestamp: string) {
  const cf = getCashfree();
  try {
      // @ts-ignore
      // PGVerifyWebhookSignature(signature, rawBody, timestamp)
      return cf.PGVerifyWebhookSignature(signature, payload, timestamp);
  } catch (err: any) {
      console.error("[Cashfree] Webhook Verification Failed:", err.message);
      return false;
  }
}
