import React from "react";
import { motion } from "motion/react";
import PricingSection from "../../components/PricingSection";
import SEO from "../../components/SEO";
import { FadeIn } from "../../components/ui/FadeIn";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function Plans() {
  return (
    <FadeIn>
      <div className="space-y-12 pb-20">
        <SEO title="Subscription Plans" />
        
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/5 border border-brand-blue/10 mb-6">
            <Sparkles className="w-4 h-4 text-brand-blue" />
            <span className="text-xs font-black uppercase tracking-widest text-brand-blue">Nexus Tier Management</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-4 uppercase">
            UPGRADE YOUR <span className="text-brand-blue">DISTRIBUTION</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl uppercase text-[10px] tracking-[0.2em]">
            Select an elite tier to unlock higher royalty percentages, faster approval times, and advanced marketing instrumentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "100% Secure", icon: ShieldCheck, desc: "Bank-grade encryption for all transactions" },
            { label: "Instant Upgrade", icon: Zap, desc: "Features unlocked immediately after payment" },
            { label: "Cancel Anytime", icon: Sparkles, desc: "Full control over your subscription" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-blue">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-black uppercase text-xs tracking-tight">{item.label}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="-mx-4 md:-mx-8 lg:-mx-12 overflow-hidden rounded-[3rem] md:rounded-[4rem]">
          <PricingSection />
        </div>
      </div>
    </FadeIn>
  );
}
