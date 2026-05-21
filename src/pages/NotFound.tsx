import React from 'react';
// NotFound (404) Page - TuneIND Music
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Music } from 'lucide-react';
import SEO from '../components/SEO';
import NeuralGrid from '../components/ui/NeuralGrid';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden font-sans selection:bg-brand-blue/20">
      <SEO 
        title="Page Not Found | TuneIND Music" 
        description="The music track or page you are looking for does not exist on TuneIND Music." 
      />
      
      {/* Background Grid Layer */}
      <NeuralGrid opacity={0.2} />
      
      {/* Extreme Background Blur Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/30 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/20 blur-[130px] rounded-full"></div>
      </div>

      <div className="text-center z-10 px-4 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Status Indicator Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative backdrop-blur-md">
              <Music className="w-8 h-8 text-brand-blue animate-pulse" />
              <div className="absolute -top-1.5 -right-1.5 bg-rose-500 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-lg border border-white/10">
                Offline
              </div>
            </div>
          </div>

          {/* Error Text Headings */}
          <h1 className="text-8xl md:text-9xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 mb-2 leading-none uppercase tracking-tighter">
            404
          </h1>
          <h2 className="text-sm md:text-base font-black mb-6 text-brand-blue uppercase tracking-[0.3em] italic">
            Lost in the Rhythm
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto mb-10 text-xs font-bold uppercase tracking-widest leading-relaxed">
            We couldn't find the track or intelligence report you were looking for. The coordinates might have shifted.
          </p>
          
          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link 
              to="/"
              className="w-full sm:w-auto px-8 py-4 bg-brand-blue hover:bg-white hover:text-[#020617] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_10px_25px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 group active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              Back to Command Center
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floor Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-30">
        <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">TuneIND Nexus Navigation System</span>
      </div>
    </div>
  );
}
