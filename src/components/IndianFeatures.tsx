import React from "react";
import { motion } from "motion/react";
import { 
  PhoneCall, 
  Instagram, 
  MessageSquare, 
  Music, 
  Languages, 
  FileText, 
  ShieldCheck, 
  Wallet, 
  Video 
} from "lucide-react";
import { INDIAN_POWER_FEATURES } from "../lib/constants";
import { cn } from "../lib/utils";

const iconMap: Record<string, any> = {
  PhoneCall,
  Instagram,
  MessageSquare,
  Music,
  Languages,
  FileText,
  ShieldCheck,
  Wallet,
  Video
};

export default function IndianFeatures() {
  return (
    <section className="py-32 px-6 relative overflow-hidden bg-[#0a0a0b]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 text-left md:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue drop-shadow-[0_0_8px_currentColor]">Powering Indian Creativity 🇮🇳</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-7xl font-black tracking-tighter leading-none uppercase mb-6 text-white"
          >
            Built for <span className="bg-gradient-to-r from-brand-blue to-neon-purple text-transparent bg-clip-text animate-gradient drop-shadow-xl inline-block mt-2">Indian Artists</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto"
          >
            Everything you need to grow your music career in India’s digital ecosystem.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-2000">
          {INDIAN_POWER_FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 hover:border-brand-blue/30 hover:shadow-[0_0_40px_rgba(37,99,235,0.15)] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden backdrop-blur-3xl"
              >
                {/* Glow Effect */}
                <div className={cn(
                  "absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-[0.15] transition-opacity duration-700 rounded-full mix-blend-screen",
                  feature.accent === 'electric-blue' ? "bg-brand-blue" : 
                  feature.accent === 'neon-purple' ? "bg-neon-purple" : "bg-[#25D366]"
                )} />

                <div className="relative z-10 flex flex-col h-full text-left">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 bg-white/5 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
                    feature.accent === 'electric-blue' ? "text-brand-blue drop-shadow-[0_0_10px_rgba(37,99,235,0.6)]" : 
                    feature.accent === 'neon-purple' ? "text-neon-purple drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" : "text-[#25D366] drop-shadow-[0_0_10px_rgba(37,211,102,0.6)]"
                  )}>
                    {Icon && <Icon className="w-6 h-6" />}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">{feature.title}</h3>
                    {feature.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[8px] font-black uppercase tracking-widest border border-brand-blue/20">{feature.badge}</span>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <a 
            href="/auth?mode=signup"
            className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-brand-blue to-indigo-600 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            Start Growing Your Music Career 🇮🇳
          </a>
        </motion.div>
      </div>
    </section>
  );
}
