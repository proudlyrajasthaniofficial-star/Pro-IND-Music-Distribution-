import React from 'react';
import { motion } from 'motion/react';
import { Music } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = "Initializing Neural Network..." }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/20 blur-[120px] rounded-full"
        />
      </div>

      {/* Main Loader Content */}
      <div className="relative flex flex-col items-center">
        {/* Abstract Spinning Outer Ring */}
        <div className="relative w-24 h-24 mb-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-[2.5rem] border-2 border-white/5 border-t-brand-blue"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-[2rem] border border-white/5 border-b-brand-purple"
          />
          
          {/* Central Pulsing Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [0.8, 1.1, 0.8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.4)]"
            >
              <Music className="text-white w-5 h-5" />
            </motion.div>
          </div>
        </div>

        {/* Textual Logic */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-sm font-black font-display text-white uppercase tracking-[0.5em] mb-4">
            IND<span className="text-brand-blue">.</span> DISTRIBUTION
          </h2>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-0.5 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-brand-blue shadow-[0_0_10px_rgba(0,102,255,0.8)]"
              />
            </div>
            <p className="text-[#94A3B8] text-[9px] font-bold uppercase tracking-[0.3em] h-4">
              {message}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modern Status Lines */}
      <div className="absolute bottom-12 left-12 flex flex-col gap-2 opacity-20 pointer-events-none">
        <div className="w-24 h-1 bg-white/10 rounded-full" />
        <div className="w-16 h-1 bg-white/10 rounded-full" />
        <div className="w-20 h-1 bg-white/10 rounded-full" />
      </div>
      
      <div className="absolute top-12 right-12 opacity-20 pointer-events-none">
        <p className="text-[8px] font-mono text-white/50 tracking-widest uppercase">Buffer: Stable</p>
        <p className="text-[8px] font-mono text-white/50 tracking-widest uppercase">Signal: encrypted</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-brand-blue/10 border-t-brand-blue"
      />
    </div>
  );
}
