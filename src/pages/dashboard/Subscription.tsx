import React from "react";
import { useAuth } from "../../context/AuthContext";
import { PLANS } from "../../constants/plans";
import { 
  ShieldCheck, 
  Zap, 
  Crown, 
  CheckCircle2, 
  Star, 
  Clock, 
  Rocket, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Music,
  Globe
} from "lucide-react";
import { FadeIn } from "../../components/ui/FadeIn";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function Subscription() {
  const { user, profile } = useAuth();
  
  const currentPlanId = profile?.planId || 'free';
  const currentPlan = PLANS.find(p => p.id === currentPlanId) || PLANS[0];
  
  const handleUpgrade = (planId: string) => {
    if (planId === currentPlanId) {
      toast.info("You are already on this plan!");
      return;
    }
    
    // Redirect to home page pricing section
    window.location.href = "/#pricing";
  };

  const getPlanIcon = (variant: string) => {
    switch (variant) {
      case 'premium': return <Star className="w-8 h-8 text-amber-500" />;
      case 'enterprise': return <Crown className="w-8 h-8 text-brand-purple" />;
      default: return <ShieldCheck className="w-8 h-8 text-brand-blue" />;
    }
  };

  return (
    <FadeIn>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase mb-2">
              Membership <span className="text-brand-blue">& Rewards</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-medium tracking-wide italic">
              Empowering your artistic journey with elite-tier distribution technology.
            </p>
          </div>
        </div>

        {/* Current Plan Hero */}
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-slate-950 rounded-[3rem] shadow-2xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-lg">
              {getPlanIcon(currentPlan.variant)}
            </div>
            
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div>
                <span className="px-4 py-1.5 bg-brand-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4 inline-block">
                  Active Membership
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-white font-display uppercase tracking-tighter">
                  {currentPlan.name}
                </h2>
              </div>
              <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl">
                {currentPlan.description}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] min-w-[280px]">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">System Status: Active</span>
               </div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Billing Interval</p>
               <p className="text-xl font-black text-white uppercase tracking-tight mb-6 italic">{currentPlan.interval}</p>
               
               <button 
                onClick={() => window.location.href = "/#pricing"}
                className="w-full py-4 bg-white text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-blue hover:text-white transition-all transform hover:scale-105"
               >
                 Change Membership
               </button>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Active Features */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black font-display uppercase tracking-tight">Active Benefits</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {currentPlan.features.map((feature, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 leading-tight uppercase tracking-wide group-hover:text-slate-900 transition-colors">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Path */}
          <div className="bg-slate-950 text-white p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-purple/20 blur-[80px] translate-y-1/2 translate-x-1/2 rounded-full"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-brand-purple/20 text-brand-purple rounded-2xl flex items-center justify-center">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black font-display uppercase tracking-tight">Level Up Path</h3>
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.15em] mb-8 italic">Eligible for massive scaling upgrades</p>
              
              <div className="space-y-6 flex-1">
                {PLANS.filter(p => p.price > currentPlan.price).map((nextPlan, idx) => (
                  <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all cursor-pointer" onClick={() => handleUpgrade(nextPlan.id)}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-purple text-white rounded-xl flex items-center justify-center shadow-lg">
                          <Crown className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black uppercase tracking-tight text-white mb-0.5">{nextPlan.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Starting ₹{nextPlan.price}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-brand-purple transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 italic">Indian Artist Network Priority</p>
                 <div className="flex items-center justify-center gap-8 opacity-20">
                    <TrendingUp className="w-6 h-6" />
                    <Music className="w-6 h-6" />
                    <Globe className="w-6 h-6" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tip/Insights */}
        <div className="bg-brand-blue/5 border-2 border-dashed border-brand-blue/20 p-8 rounded-[3rem] flex flex-col md:flex-row items-center gap-8">
           <div className="w-16 h-16 bg-brand-blue rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center shrink-0">
             <Sparkles className="text-white w-8 h-8" />
           </div>
           <div className="flex-1 text-left">
             <h4 className="text-lg font-black font-display uppercase tracking-tight mb-1 text-slate-900">Artist Pro Tip</h4>
             <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-3xl italic uppercase tracking-wide">
               Upgrading to the <span className="font-black text-brand-blue">Pro Artist Plan</span> unlocks YouTube OAC (Official Artist Channel) request eligibility. This is the single most powerful tool for visual branding on the world's largest video platform.
             </p>
           </div>
           <Link to="/dashboard/oac" className="px-8 py-3 bg-slate-950 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue transition-colors">
              Check OAC Status
           </Link>
        </div>
      </div>
    </FadeIn>
  );
}

import { Link } from "react-router-dom";
