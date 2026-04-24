import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Zap, Star, Layout, Users, Globe, Building2, Headset, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";

const ADDONS = [
  { name: "YouTube Content ID", price: "₹199", icon: "Youtube" },
  { name: "Caller Tune", price: "₹299/song", icon: "Phone" },
  { name: "Fast Release", price: "₹99", icon: "Zap" },
  { name: "Spotify Verification", price: "₹199", icon: "CheckCircle" },
  { name: "Playlist Pitching", price: "₹299", icon: "Music" }
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: "Starter Artist",
      price: billingCycle === 'yearly' ? 699 : 79,
      tag: "Beginner Friendly",
      features: [
        "1 Artist Profile",
        "Unlimited Audio Releases",
        "All Major Platforms",
        "Basic Analytics",
        "YouTube Distribution"
      ],
      cta: "Start Now",
      color: "blue"
    },
    {
      name: "Pro Artist",
      price: billingCycle === 'yearly' ? 999 : 129,
      popular: true,
      highlight: "🔥 Most Popular",
      features: [
        "1 Artist Profile",
        "Unlimited Audio + Video Releases",
        "YouTube Content ID",
        "Caller Tune (Jio, Airtel, Vi)",
        "Global Distribution",
        "90% Revenue Share",
        "Fast Release (2–3 Days)"
      ],
      cta: "Go Pro",
      color: "purple"
    },
    {
      name: "Premium Artist",
      price: billingCycle === 'yearly' ? 1999 : 249,
      tag: "Best Value",
      features: [
        "2 Artist Profiles",
        "Unlimited Releases",
        "Content ID + Social Platforms",
        "Caller Tune Priority",
        "Spotify Verification Help",
        "Playlist Pitch Support",
        "95% Revenue Share",
        "Advanced Analytics"
      ],
      cta: "Upgrade Now",
      color: "pink"
    },
    {
      name: "Label Plan",
      price: billingCycle === 'yearly' ? 4999 : 599,
      features: [
        "5 Artists",
        "Unlimited Releases",
        "Rights Management",
        "Team Access",
        "97% Revenue Share",
        "Priority Support"
      ],
      cta: "For Labels",
      color: "yellow"
    },
    {
      name: "Enterprise",
      price: billingCycle === 'yearly' ? 9999 : 1299,
      priceSuffix: "+",
      features: [
        "Unlimited Artists",
        "Dedicated Manager",
        "White Label",
        "API Access",
        "Custom Revenue"
      ],
      cta: "Contact Sales",
      color: "red"
    }
  ];

  return (
    <section id="pricing" className="py-32 px-6 relative overflow-hidden bg-transparent text-white">
      {/* Background Animated Waves/Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[70rem] h-[70rem] bg-indigo-600/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[60rem] h-[60rem] bg-purple-600/10 blur-[120px] rounded-full" 
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/10 mb-6"
          >
            <Star className="w-3.5 h-3.5 text-electric-blue fill-electric-blue" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">1000+ Indian Artists Trust Us</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-7xl font-black tracking-tighter leading-none uppercase mb-8"
          >
            Simple, Transparent Pricing <br />
            <span className="bg-linear-to-r from-electric-blue via-indigo-400 to-purple-500 text-transparent bg-clip-text">for Indian Artists</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12"
          >
            Distribute your music worldwide with powerful tools made for India.
          </motion.p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={cn("text-sm font-bold uppercase tracking-widest transition-colors", billingCycle === 'monthly' ? "text-white" : "text-white/40")}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="w-16 h-8 glass-dark rounded-full p-1 relative flex items-center transition-colors border-white/20"
            >
              <motion.div 
                animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
            <span className={cn("text-sm font-bold uppercase tracking-widest transition-colors", billingCycle === 'yearly' ? "text-white" : "text-white/40")}>
              Yearly <span className="ml-1 text-[10px] bg-electric-blue/20 text-electric-blue px-2 py-0.5 rounded-full font-black">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-32 items-stretch">
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
                "relative group flex flex-col transition-all duration-500",
                plan.popular 
                  ? "bg-white/5 p-[2px] rounded-[3.2rem] z-10" 
                  : "glass-dark rounded-[3rem] p-10 hover:bg-white/10"
              )}
            >
              {/* Glowing Border for Popular Plan */}
              {plan.popular && (
                <div className="absolute -inset-1 bg-linear-to-r from-electric-blue via-indigo-600 to-purple-600 rounded-[3.2rem] blur-lg opacity-40 animate-pulse group-hover:opacity-100 transition-opacity" />
              )}
              
              <div className={cn(
                "relative flex-1 flex flex-col h-full",
                plan.popular ? "bg-[#0A0F1E] rounded-[3rem] p-10" : ""
              )}>
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-electric-blue text-[#0A0F1E] px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl z-20 whitespace-nowrap">
                    {plan.highlight}
                  </div>
                )}
                {plan.tag && !plan.popular && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">{plan.tag}</div>
                )}

                <h3 className="text-2xl font-black font-display uppercase tracking-tight mb-2 text-white">{plan.name}</h3>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-black text-white">₹{plan.price}{(plan as any).priceSuffix || ""}</span>
                  <span className="text-[10px] font-black text-white/40 ml-1.5 uppercase tracking-widest">
                    / {billingCycle === 'yearly' ? 'Year' : 'Month'}
                  </span>
                </div>

                <ul className="space-y-4 mb-10 flex-1 text-left">
                  {plan.features.map(f => (
                    <li key={f} className="flex gap-3 items-start group/item relative">
                      <CheckCircle2 className="w-4 h-4 text-electric-blue shrink-0 mt-0.5 transition-transform group-hover/item:scale-125" />
                      <span 
                        title={`Included: ${f}`}
                        className="text-sm font-medium text-white/60 leading-tight cursor-help border-b border-transparent hover:border-white/20"
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/auth?mode=signup" 
                  className={cn(
                    "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center transition-all duration-500 relative overflow-hidden group/btn shadow-xl",
                    plan.popular 
                      ? "bg-linear-to-r from-electric-blue to-indigo-600 text-white hover:scale-[1.02]" 
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-electric-blue"
                  )}
                >
                  <span className="relative z-10">{plan.cta}</span>
                  {plan.popular && (
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity blur-xl rounded-full" />
                  )}
                  {/* Glow Pulse for Button */}
                  {plan.popular && (
                    <div className="absolute -inset-1 bg-linear-to-r from-electric-blue to-indigo-600 rounded-2xl blur-lg opacity-30 group-hover/btn:opacity-60 transition-opacity pointer-events-none" />
                  )}
                </Link>
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
                className="glass-dark border border-white/5 p-6 rounded-3xl shadow-lg flex flex-col items-center gap-3 min-w-[180px] group transition-all hover:border-electric-blue/30"
              >
                <div className="w-12 h-12 bg-white/5 text-electric-blue rounded-2xl flex items-center justify-center transition-colors group-hover:bg-electric-blue/10">
                  {addon.icon === 'Youtube' && <Zap className="w-6 h-6" />}
                  {addon.icon === 'Phone' && <Layout className="w-6 h-6" />}
                  {addon.icon === 'Zap' && <Zap className="w-6 h-6" />}
                  {addon.icon === 'CheckCircle' && <CheckCircle2 className="w-6 h-6" />}
                  {addon.icon === 'Music' && <Globe className="w-6 h-6" />}
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-white/30">{addon.name}</p>
                <p className="text-lg font-black text-electric-blue">{addon.price}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Particles (Decorative) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-electric-blue/20 rounded-full"
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
