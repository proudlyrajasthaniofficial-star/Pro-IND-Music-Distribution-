import { load } from "@cashfreepayments/cashfree-js";

let cashfreeInstance: any = null;

const getCashfree = async () => {
  if (cashfreeInstance) return cashfreeInstance;
  
  // Use VITE_CASHFREE_ENV if set, otherwise default based on hostname
  const isProd = (import.meta as any).env?.VITE_CASHFREE_ENV === "PRODUCTION" || 
                 window.location.hostname.includes("musicdistributionindia.online");
  
  cashfreeInstance = await load({
    mode: isProd ? "production" : "sandbox",
  });
  return cashfreeInstance;
};

export const initiatePayment = async (planData: {
  amount: number;
  planName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) => {
  try {
    const cashfree = await getCashfree();

    // 1. Create order on the server
    const response = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: planData.amount,
        orderNote: `Subscription for ${planData.planName}`,
        customerEmail: planData.customerEmail,
        customerPhone: planData.customerPhone,
      }),
    });

    const orderData = await response.json();

    if (!response.ok) {
      const errorMsg = orderData.details?.message || orderData.error || "Server failed to initiate transaction";
      throw new Error(errorMsg);
    }

    if (!orderData.payment_session_id) {
      console.error("Missing payment_session_id in response:", orderData);
      throw new Error("Payment session could not be established. Please check your credentials.");
    }

    // 2. Open Cashfree Checkout
    const checkoutOptions = {
      paymentSessionId: orderData.payment_session_id,
      redirectTarget: "_self", 
    };

    return cashfree.checkout(checkoutOptions);
  } catch (error) {
    console.error("Payment initiation failed:", error);
    throw error;
  }
};
