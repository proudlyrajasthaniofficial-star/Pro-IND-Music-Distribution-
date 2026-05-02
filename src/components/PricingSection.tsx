import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Star, 
  Layout, 
  Users, 
  Globe, 
  Building2, 
  Headset, 
  MessageCircle,
  Youtube,
  Phone,
  Instagram,
  Music,
  Target,
  Hash,
  ExternalLink
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Plan } from "../constants/plans";

const ADDONS = [
  { name: "Fast Release (24 hrs)", price: "₹299", icon: "Zap" },
  { name: "YouTube Monetization", price: "₹199", icon: "Youtube" },
  { name: "Caller Tune Boost", price: "₹99", icon: "Phone" },
  { name: "Instagram Promotion", price: "₹499", icon: "Instagram" },
  { name: "Playlist Pitching", price: "₹999", icon: "Music" },
  { name: "YouTube Ads Campaign", price: "₹1999+", icon: "Target" },
  { name: "Custom ISRC", price: "₹49", icon: "Hash" },
  { name: "Smart Link Premium", price: "₹99", icon: "ExternalLink" }
];

export default function PricingSection() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const handleBuyNow = async (plan: any) => {
    if (!user) {
      toast.info("Please login to upgrade your plan");
      navigate("/auth?mode=login");
      return;
    }

    if (plan.id === 'free') {
       toast.success("You are already on the Free Plan or can start here.");
       navigate("/dashboard");
       return;
    }

    // For Cashfree, we need a phone number to create an order.
    // Try to get from profile, or fallback with a prompt if missing
    let customerPhone = profile?.phoneNumber?.replace(/\D/g, '') || "";
    
    if (customerPhone.length < 10) {
      // If we don't have a phone number, we can't create a Cashfree order properly.
      // For this demo, we use a fallback but warn the user.
      customerPhone = "9999999999";
      console.warn("Using placeholder phone number for Cashfree order creation.");
    } else {
      customerPhone = customerPhone.slice(-10);
    }

    try {
      toast.loading("Initiating secure payment...", { id: "checkout" });
      
      const response = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: Number(plan.price),
          userId: user.uid,
          customerEmail: user.email || profile?.email || 'user@musicdistributionindia.online',
          customerPhone: customerPhone,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || "Order creation failed");
      }

      if (!data.payment_session_id) {
        throw new Error("No payment session received from gateway");
      }

      toast.success("Order created! Opening gateway...", { id: "checkout" });

      // @ts-ignore
      const CashfreeSDK = window.Cashfree;
      if (CashfreeSDK) {
         const mode = data.environment || 'sandbox';
         const cf = CashfreeSDK({ mode });
         
         cf.checkout({
           paymentSessionId: data.payment_session_id,
           redirectTarget: "_self" 
         }).then((result: any) => {
           if (result.error) {
             console.error("Cashfree Checkout Error:", result.error);
             toast.error(result.error.message || "Payment initialization failed", { id: "checkout" });
           }
         });
      } else {
         throw new Error("Payment SDK failed to load. Please refresh.");
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error(error.message || "An error occurred during checkout", { id: "checkout" });
    }
  };

  const plans = [
    {
      name: "Free Plan",
      id: "free",
      price: 0,
      lifetime: true,
      tag: "Entry Funnel",
      features: [
        "1 Song Release (per month)",
        "70% Royalty Earnings",
        "Basic Distribution",
        "Standard Delivery (7–10 days)",
        "Basic Artist Dashboard",
        "Track Status Monitoring"
      ],
      cta: "Grab Trial",
      color: "slate"
    },
    {
      name: "Starter Pro Plan",
      id: "starter-pro",
      price: billingCycle === 'yearly' ? 999 : 99,
      popular: true,
      highlight: "MOST POPULAR",
      customGradient: "bg-gradient-to-r from-brand-blue to-purple-600",
      tag: "Best for Beginners",
      features: [
        "Up to 5 Song Releases",
        "80% Royalty Earnings",
        "Basic Distribution",
        "Standard Delivery (5-7 days)",
        "Basic Artist Dashboard",
        "Track Status Monitoring",
        "Email Support"
      ],
      cta: "Get Started",
      color: "blue"
    },
    {
      name: "Artist Plan",
      id: "artist",
      price: billingCycle === 'yearly' ? 1499 : 199,
      tag: "Core Plan",
      features: [
        "Unlimited Song Releases",
        "85% Royalty Earnings",
        "150+ Platforms",
        "YouTube Content ID (Basic)",
        "Caller Tune (India)",
        "ISRC & UPC Generation",
        "Basic Analytics",
        "Lyrics Distribution",
        "Cover Song Support"
      ],
      cta: "Start Now",
      color: "blue"
    },
    {
      name: "Pro Artist",
      id: "pro",
      price: billingCycle === 'yearly' ? 2499 : 349,
      tag: "Serious Artists",
      features: [
        "Everything in Artist Plan",
        "90% Royalty Earnings",
        "Fast Release (48 Hours)",
        "Instagram & Facebook Music",
        "YouTube OAC Support",
        "Advanced Analytics",
        "Smart Link / Pre-save",
        "Release Scheduling",
        "Priority Support (WhatsApp)"
      ],
      cta: "Unlock Pro",
      color: "purple"
    },
    {
      name: "Label Plan",
      id: "label",
      price: billingCycle === 'yearly' ? 4999 : 699,
      tag: "Business Starter",
      features: [
        "Manage up to 10 Artists",
        "Unlimited Releases",
        "90% Royalty Earnings",
        "Team Access Dashboard",
        "Revenue Split System",
        "Label Name Branding",
        "Bulk Upload System",
        "YouTube Content ID (Adv)"
      ],
      cta: "Start Label",
      color: "pink"
    },
    {
      name: "Unlimited Label",
      id: "unlimited-label",
      price: billingCycle === 'yearly' ? 9999 : 1299,
      tag: "Scale Plan",
      features: [
        "Unlimited Artists",
        "Unlimited Releases",
        "95% Royalty Earnings",
        "Advanced Bulk Upload",
        "Dedicated Account Manager",
        "Full Analytics Dashboard",
        "White-label Branding",
        "API Access (Optional)"
      ],
      cta: "Scale Now",
      color: "red"
    }
  ];

  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden bg-[#0a0a0b] text-white">
      {/* Background Animated Waves/Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[70rem] h-[70rem] bg-brand-blue/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[60rem] h-[60rem] bg-neon-purple/10 blur-[150px] rounded-full" 
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
          >
            <Star className="w-3.5 h-3.5 text-brand-blue fill-brand-blue drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">1000+ Indian Artists Trust Us</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-7xl font-black tracking-tighter leading-none uppercase mb-8"
          >
            Simple, Transparent Pricing <br />
            <span className="bg-gradient-to-r from-brand-blue via-purple-400 to-pink-500 text-transparent bg-clip-text animate-gradient drop-shadow-xl inline-block mt-2">for Indian Artists</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12"
          >
            Distribute your music worldwide with powerful tools made for India.
          </motion.p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={cn("text-sm font-bold uppercase tracking-widest transition-colors", billingCycle === 'monthly' ? "text-white drop-shadow-md" : "text-slate-500")}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="w-16 h-8 bg-white/10 rounded-full p-1 relative flex items-center transition-colors border border-white/20"
            >
              <motion.div 
                animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
                className="w-6 h-6 bg-gradient-to-r from-brand-blue to-purple-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-white/20"
              />
            </button>
            <span className={cn("text-sm font-bold uppercase tracking-widest transition-colors", billingCycle === 'yearly' ? "text-white drop-shadow-md" : "text-slate-500")}>
              Yearly <span className="ml-1 text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-black shadow-[0_0_10px_rgba(16,185,129,0.2)]">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ 
                y: -20,
                rotateX: 5,
                rotateY: 5,
                scale: 1.05,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              style={{ perspective: 2000 }}
              className={cn(
                "relative group flex flex-col transition-all duration-500 backdrop-blur-3xl",
                plan.popular 
                  ? "bg-[#0a0a0b] p-[2px] rounded-[3.2rem] z-10 shadow-[0_0_50px_rgba(37,99,235,0.15)] hover:shadow-[0_0_80px_rgba(37,99,235,0.3)]" 
                  : "bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:bg-white/[0.04]"
              )}
            >
              {/* Glowing Border for Popular Plan */}
              {plan.popular && (
                <div className={cn("absolute -inset-1 rounded-[3.2rem] blur-lg opacity-60 animate-pulse group-hover:opacity-100 transition-opacity", (plan as any).customGradient || "bg-gradient-to-r from-brand-blue via-purple-600 to-indigo-500")} />
              )}
              
              <div className={cn(
                "relative flex-1 flex flex-col h-full",
                plan.popular ? "bg-[#0d0d0f] rounded-[3rem] p-10" : "bg-transparent"
              )}>
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-blue to-purple-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.5)] z-20 whitespace-nowrap border border-white/10">
                    {plan.highlight}
                  </div>
                )}
                {plan.tag && !plan.popular && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{plan.tag}</div>
                )}

                <h3 className="text-2xl font-black font-display uppercase tracking-tight mb-2 text-white">{plan.name}</h3>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-black text-white">₹{plan.price}{(plan as any).priceSuffix || ""}</span>
                  <span className="text-[10px] font-black text-slate-500 ml-1.5 uppercase tracking-widest">
                    / {(plan as any).lifetime ? 'Lifetime' : (billingCycle === 'yearly' ? 'Year' : 'Month')}
                  </span>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex gap-3 items-start group/item relative">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5 transition-transform group-hover/item:scale-125 drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                      <span 
                        title={`Included: ${f}`}
                        className="text-sm font-medium text-slate-300 leading-tight cursor-help border-b border-transparent hover:border-white/20 transition-colors"
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleBuyNow(plan)}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center transition-all duration-500 relative overflow-hidden group/btn shadow-xl hover:shadow-2xl hover:scale-[1.02]",
                    plan.popular 
                      ? cn("text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]", (plan as any).customGradient || "bg-gradient-to-r from-brand-blue via-purple-600 to-indigo-500")
                      : "bg-white/5 border border-white/10 text-white hover:border-brand-blue hover:bg-brand-blue/10"
                  )}
                >
                  <span className="relative z-10">{plan.cta}</span>
                  {plan.popular && (
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-xl rounded-full" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="text-center">
          <h3 className="text-3xl font-black font-display uppercase tracking-tight mb-12 text-white">Boost Your Reach</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {ADDONS.map((addon, i) => (
              <motion.div
                key={addon.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 min-w-[180px] group transition-all hover:bg-white/[0.05] hover:border-brand-blue/50 backdrop-blur-3xl"
              >
                <div className="w-12 h-12 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-2xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                  {addon.icon === 'Youtube' && <Youtube className="w-6 h-6" />}
                  {addon.icon === 'Phone' && <Phone className="w-6 h-6" />}
                  {addon.icon === 'Zap' && <Zap className="w-6 h-6" />}
                  {addon.icon === 'Instagram' && <Instagram className="w-6 h-6" />}
                  {addon.icon === 'Music' && <Music className="w-6 h-6" />}
                  {addon.icon === 'Target' && <Target className="w-6 h-6" />}
                  {addon.icon === 'Hash' && <Hash className="w-6 h-6" />}
                  {addon.icon === 'ExternalLink' && <ExternalLink className="w-6 h-6" />}
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">{addon.name}</p>
                <p className="text-lg font-black text-white group-hover:text-brand-blue drop-shadow-md transition-colors">{addon.price}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Killer Line */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <p className="text-2xl md:text-4xl font-display font-black tracking-tight uppercase leading-tight italic bg-gradient-to-r from-brand-blue via-purple-400 to-pink-500 text-transparent bg-clip-text max-w-4xl mx-auto drop-shadow-xl animate-gradient">
            “Gaana banana talent hai… <br className="hidden md:block" />
            usko duniya tak pahuchana system hai — aur wo system yahi hai.”
          </p>
        </motion.div>

        {/* Floating Particles (Decorative) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-brand-blue/30 rounded-full blur-[2px]"
              animate={{
                y: [0, -100, 0],
                x: [0, 50, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                delay: i * 3
              }}
              style={{
                top: `${15 * i}%`,
                left: `${20 * i}%`
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
