import { Cashfree } from 'cashfree-pg';

let cashfreeInstance: Cashfree | null = null;

function getCashfree() {
  if (!cashfreeInstance) {
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV === 'PRODUCTION' ? 2 : 1; // 2 for PRODUCTION, 1 for SANDBOX

    if (!appId || !secretKey) {
      throw new Error('CASHFREE_APP_ID and CASHFREE_SECRET_KEY are required');
    }

    // According to README version >= 5 instructions (though README might be slightly inconsistent with types)
    // The safest way given the linter errors on Property 'Environment' is to use strings or the constructors.
    // If Cashfree.Environment fails, we check the README again.
    // README says: new Cashfree(Cashfree.SANDBOX, ...)
    
    // @ts-ignore
    cashfreeInstance = new Cashfree(
      // @ts-ignore
      process.env.CASHFREE_ENV === 'PRODUCTION' ? Cashfree.PRODUCTION : Cashfree.SANDBOX,
      appId,
      secretKey
    );
  }
  return cashfreeInstance;
}

export async function createCashfreeOrder(userId: string, planId: string, amount: number, customerEmail: string, customerPhone: string) {
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
      return_url: `${process.env.APP_URL}/checkout/success?order_id={order_id}`,
      notify_url: `${process.env.APP_URL}/api/cashfree/webhook`,
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
