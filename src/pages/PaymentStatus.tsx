import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const verify = async () => {
      if (!orderId) {
        setStatus('failed');
        return;
      }

      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const data = await response.json();
        setOrderDetails(data);

        // Check if any payment was successful for this order
        const isSuccess = data.some((p: any) => p.payment_status === "SUCCESS");
        
        if (isSuccess) {
          setStatus('success');
          toast.success("Payment successful! Your plan is activated.");
        } else {
          setStatus('failed');
          toast.error("Payment was not successful.");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus('failed');
      }
    };

    verify();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center"
      >
        {status === 'loading' && (
          <div className="py-12">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Verifying Payment...</h2>
            <p className="text-slate-500 mt-2">Please wait while we confirm your transaction.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Success!</h2>
            <p className="text-slate-500 mt-4 mb-10">
              Your payment of <span className="font-bold text-slate-900">₹{orderDetails?.[0]?.payment_amount}</span> was successful. Your account has been upgraded.
            </p>
            <Link 
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'failed' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Payment Failed</h2>
            <p className="text-slate-500 mt-4 mb-10">
              We couldn't confirm your transaction. If money was deducted, it will be refunded automatically or contact support.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                to="/#pricing"
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Try Again
              </Link>
              <Link 
                to="/contact"
                className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] hover:underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
