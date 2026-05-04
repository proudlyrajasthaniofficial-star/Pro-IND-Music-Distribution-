import React from "react";
import { motion } from "motion/react";

export default function NeuralGrid() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.03]">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle, #0066FF 1px, transparent 1px),
            linear-gradient(to right, rgba(0, 102, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 102, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 40px 40px'
        }}
      />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ 
          top: ["0%", "100%"],
          opacity: [0, 1, 0] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-brand-blue to-transparent shadow-[0_0_15px_rgba(0,102,255,0.8)]"
      />

      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-white/10" />
    </div>
  );
}
