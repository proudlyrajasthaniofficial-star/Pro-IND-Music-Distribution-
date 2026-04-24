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
    <section className="py-32 px-6 relative overflow-hidden bg-linear-to-b from-[#0D1B2A] to-[#1A1A1A]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-blue/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/5 mb-6"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-electric-blue">Powering Indian Creativity 🇮🇳</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-7xl font-black tracking-tighter leading-none uppercase mb-6"
          >
            Built for <span className="bg-gradient-to-r from-electric-blue to-neon-purple text-transparent bg-clip-text">Indian Artists</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-light max-w-2xl mx-auto"
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
                  y: -15, 
                  rotateX: 5, 
                  rotateY: -5,
                  scale: 1.03,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                className="group relative p-10 rounded-[3rem] glass-dark border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-electric-blue/10"
              >
                {/* Glow Effect */}
                <div className={cn(
                  "absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full",
                  feature.accent === 'electric-blue' ? "bg-electric-blue" : 
                  feature.accent === 'neon-purple' ? "bg-neon-purple" : "bg-[#25D366]"
                )} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500",
                    feature.accent === 'electric-blue' ? "bg-electric-blue/10 text-electric-blue" : 
                    feature.accent === 'neon-purple' ? "bg-neon-purple/10 text-neon-purple" : "bg-whatsapp-green/10 text-[#25D366]"
                  )}>
                    {Icon && <Icon className="w-7 h-7" />}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-black uppercase tracking-tight">{feature.title}</h3>
                    {feature.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-electric-blue/20 text-electric-blue text-[8px] font-black uppercase tracking-widest">{feature.badge}</span>
                    )}
                  </div>

                  <p className="text-white/40 text-sm font-medium leading-relaxed">
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
            className="inline-flex items-center gap-4 px-10 py-5 bg-linear-to-r from-electric-blue to-neon-purple text-[#0D1B2A] rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:shadow-[0_20px_50px_rgba(0,212,255,0.3)] transition-all"
          >
            Start Growing Your Music Career 🇮🇳
          </a>
        </motion.div>
      </div>
    </section>
  );
}
