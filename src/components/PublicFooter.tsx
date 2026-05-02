import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Music, 
  Instagram, 
  Youtube, 
  MessageCircle, 
  Apple, 
  Globe, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';
import { cn } from '../lib/utils';

const PublicFooter = () => {
  return (
    <footer className="relative py-32 px-6 bg-[#0a0a0b] border-t border-white/5 overflow-hidden text-left">
      {/* Subtle Gradient Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-brand-blue/10 blur-[160px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-neon-purple/10 blur-[140px] rounded-full pointer-events-none mix-blend-screen"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 pb-24 border-b border-white/10">
          <div className="col-span-1 lg:col-span-2 space-y-12">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
                <Music className="text-white w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-4xl font-black tracking-tighter text-white uppercase leading-none">
                  IND Distribution
                </span>
                <span className="text-[11px] font-black tracking-[0.4em] text-brand-blue uppercase mt-2 italic flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]"></span>
                  Protocol v2.6 // 2026
                </span>
              </div>
            </Link>
            <p className="text-slate-400 max-w-md text-sm font-medium leading-relaxed italic opacity-80">
              IND Music Distribution India. Upload your music, we deliver your music on JioSaavn, Wynk Music, Gaana, Resso, Spotify and more 150+ music platforms. <br /><br />
              म्यूजिक डिस्ट्रीब्यूशन इंडिया पर अपना संगीत अपलोड करें, हम आपका संगीत JioSaavn, Wynk Music, Gaana, Resso, Spotify और अधिक 150+ संगीत प्लेटफार्मों पर वितरित करते हैं।
            </p>
            <div className="flex gap-4">
              {[
                { icon: Instagram, color: "hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-500/30", label: "Instagram" },
                { icon: Youtube, color: "hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30", label: "YouTube" },
                { icon: MessageCircle, color: "hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/30", label: "WhatsApp" },
                { icon: Apple, color: "hover:bg-white/10 hover:text-white hover:border-white/20", label: "Apple" }
              ].map((social, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -8, scale: 1.1, rotate: 5 }}
                  className={cn(
                    "w-14 h-14 rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 transition-all cursor-pointer backdrop-blur-2xl shadow-lg",
                    social.color
                  )}
                >
                  <social.icon className="w-6 h-6" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-12 text-left">
            <div className="relative">
              <h4 className="font-display font-black uppercase tracking-[0.4em] text-xs text-indigo-400 italic flex items-center gap-3 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]">
                <span className="w-4 h-[2px] bg-indigo-500 rounded-full shadow-[0_0_5px_currentColor]"></span>
                Ecosystem
              </h4>
            </div>
            <ul className="space-y-6">
              {[
                { label: "India Features", to: "/features" },
                { label: "Pricing Tiers", to: "/#pricing" },
                { label: "Global Presence", to: "/#distribution" },
                { label: "Music Distribution India", to: "/best-music-distribution-india" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="group flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500 transition-all scale-0 group-hover:scale-100 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-brand-blue transition-all uppercase tracking-widest group-hover:translate-x-1 duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-12 text-left md:pl-10 lg:border-l lg:border-white/10">
            <div className="relative">
              <h4 className="font-display font-black uppercase tracking-[0.4em] text-xs animate-pulse flex items-center gap-3">
                <span className="w-6 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-[0_0_5px_currentColor]"></span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">Resources</span>
              </h4>
            </div>
            <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-pink-500/20 scrollbar-track-white/5">
              {[
                { label: "Free Distribution", to: "/free-music-distribution-india" },
                { label: "Spotify Upload India", to: "/upload-song-on-spotify-india" },
                { label: "JioSaavn Guide", to: "/jio-saavn-music-distribution" },
                { label: "Gaana & Wynk", to: "/gaana-wynk-music-distribution" },
                { label: "Caller Tune Service", to: "/caller-tune-distribution-india" },
                { label: "Instagram Reels", to: "/instagram-reels-music-distribution" },
                { label: "YouTube Content ID", to: "/youtube-content-id-india" },
                { label: "Music Royalties", to: "/music-royalties-in-india" },
                { label: "Digital Distribution", to: "/digital-music-distribution-india" },
                { label: "Founder & Developer", to: "/founder" },
                { label: "Terms & Legal", to: "/terms" },
                { label: "Support & Contact", to: "/contact" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="group block py-1.5">
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-pink-400 transition-all uppercase tracking-[0.2em] group-hover:pl-2">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative pt-16 mt-16">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 text-[11px] font-mono tracking-widest uppercase text-slate-500 font-bold">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8">
              <div className="flex items-center gap-3 bg-indigo-500/10 px-4 py-2.5 rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_5px_rgba(99,102,241,0.8)]"></span>
                <span className="text-indigo-400 font-bold tracking-tighter drop-shadow-sm">SERVER_STATUS: OPTIMAL</span>
              </div>
              <div className="flex items-center gap-3 bg-pink-500/10 px-4 py-2.5 rounded-full border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                <Cpu className="w-4 h-4 text-pink-400 drop-shadow-[0_0_5px_currentColor]" />
                <span className="text-pink-400 font-bold tracking-tighter drop-shadow-sm">CPU_LOAD: 12%</span>
              </div>
              <p className="font-bold tracking-widest">© 2026 IND Distribution // ARTIST_AUTH: <span className="text-brand-blue drop-shadow-[0_0_8px_currentColor]">SK JI</span></p>
            </div>
            
            <div className="flex items-center gap-6 backdrop-blur-2xl bg-white/[0.02] p-2 rounded-[1.5rem] border border-white/10 shadow-2xl">
              <div className="flex items-center gap-8 md:gap-12 px-6 py-3">
                <div className="flex items-center gap-3 group cursor-help">
                  <Globe className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform drop-shadow-[0_0_8px_currentColor]" />
                  <span className="opacity-70 font-bold">LOC: ASIA_IN_GLOBAL</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="hidden lg:flex items-center gap-3 group cursor-help">
                  <ShieldCheck className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_currentColor]" />
                  <span className="opacity-70 font-bold">SEC: E2E_CRYPTO_V4</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10 hidden xl:block"></div>
                <div className="hidden xl:flex items-center gap-3 group cursor-help">
                  <div className="relative">
                    <span className="absolute inset-0 bg-emerald-500 blur-md rounded-full animate-ping opacity-60"></span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 relative z-10 shadow-[0_0_8px_currentColor]" />
                  </div>
                  <span className="text-emerald-400 font-bold drop-shadow-sm">ULTRALIGHT: 12MS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
