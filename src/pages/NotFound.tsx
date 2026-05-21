import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Music } from 'lucide-react';
import SEO from '../components/SEO';
import NeuralGrid from '../components/ui/NeuralGrid';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">
      <SEO title="Page Not Found | IND Music" description="The page you are looking for does not exist." />
      
      <NeuralGrid opacity={0.3} />
      
      {/* Extreme Background Gradients */}
      <div className="absolute top-0 -left-24 w-[40rem] h-[40rem] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 -right-24 w-[40rem] h-[40rem] bg-brand-purple/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="text-center z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl relative">
              <Music className="w-10 h-10 text-brand-blue" />
              <div className="absolute -top-2 -right-2 bg-rose-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
                Offline
              </div>
            </div>
          </div>

          <h1 className="text-7xl md:text-9xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mb-2 leading-none uppercase tracking-tighter">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-black mb-6 text-brand-blue uppercase tracking-[0.3em]">
            Lost in the Rhythm
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-10 text-sm font-medium uppercase tracking-widest leading-relaxed">
            We couldn't find the track you were looking for. The map coordinates might have shifted.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/"
              className="w-full sm:w-auto px-10 py-4 bg-brand-blue hover:bg-white hover:text-slate-950 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_15px_30px_rgba(0,102,255,0.3)] hover:shadow-white/10 flex items-center justify-center gap-2 group"
            >
              <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Back to Home
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floor Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">IND Nexus Navigation System</span>
      </div>
    </div>
  );
}
