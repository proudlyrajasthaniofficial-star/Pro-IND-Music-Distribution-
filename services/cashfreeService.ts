import { Cashfree, CFEnvironment } from 'cashfree-pg';

let cashfreeInstance: Cashfree | null = null;

function getCashfree() {
  if (!cashfreeInstance) {
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

    if (!appId || !secretKey) {
      throw new Error('CASHFREE_APP_ID and CASHFREE_SECRET_KEY are required');
    }

    // @ts-ignore
    cashfreeInstance = new Cashfree(
      env,
      appId,
      secretKey
    );
    // Use the default version from the SDK or explicitly set if needed
    // The SDK defaults to "2025-01-01" as per our grep.
  }
  return cashfreeInstance;
}

export async function createCashfreeOrder(userId: string, planId: string, amount: number, customerEmail: string, customerPhone: string, appUrl: string) {
  // @ts-ignore
  const cf = getCashfree();

  const orderId = `order_${Date.now()}_${userId}`;

  const request = {
    order_amount: amount,
    order_currency: 'INR',
    order_id: orderId,
    customer_details: {
      customer_id: userId,
      customer_email: customerEmail,
      customer_phone: customerPhone,
    },
    order_meta: {
      return_url: `${appUrl}/checkout/success?order_id={order_id}`,
      notify_url: `${appUrl}/api/cashfree/webhook`,
    },
    order_note: `Subscription for ${planId}`,
    order_tags: {
      userId: userId,
      planId: planId
    }
  };

  try {
    // @ts-ignore
    const response = await cf.PGCreateOrder(request);
    return response.data;
  } catch (error: any) {
    console.error('Cashfree Order Creation Error:', error.response?.data || error.message);
    throw error;
  }
}

export function verifyCashfreeWebhook(payload: string, signature: string) {
  const cf = getCashfree();
  try {
      // @ts-ignore
      return cf.PGVerifyWebhookSignature(signature, payload, process.env.CASHFREE_WEBHOOK_SECRET!);
  } catch (err) {
      console.error("Webhook Verification Error:", err);
      return false;
  }
}
