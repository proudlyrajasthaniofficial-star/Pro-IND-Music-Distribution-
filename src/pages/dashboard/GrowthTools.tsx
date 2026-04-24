import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PhoneCall, 
  Instagram, 
  MessageSquare, 
  Music, 
  Languages, 
  FileText, 
  ShieldCheck, 
  Wallet, 
  Video,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Plus
} from "lucide-react";
import { INDIAN_POWER_FEATURES, INDIAN_LANGUAGES } from "../../lib/constants";
import { cn } from "../../lib/utils";
import SEO from "../../components/SEO";

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

type Status = 'Active' | 'Pending' | 'In Review' | 'Rejected' | 'Not Enabled';

interface FeatureState {
  id: string;
  status: Status;
}

export default function GrowthTools() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [featureStates, setFeatureStates] = useState<Record<string, Status>>({
    crbt: 'Not Enabled',
    instagram: 'Pending',
    whatsapp: 'Not Enabled',
    regional: 'Active',
    languages: 'Active',
    lyrics: 'Not Enabled',
    verification: 'Not Enabled',
    upi: 'Active',
    shortvideo: 'Not Enabled',
  });

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'Active':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-whatsapp-green bg-whatsapp-green/10 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> ACTIVE</span>;
      case 'Pending':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-soft-orange bg-soft-orange/10 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> PENDING</span>;
      case 'In Review':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-electric-blue bg-electric-blue/10 px-2 py-0.5 rounded-full"><ChevronRight className="w-3 h-3" /> IN REVIEW</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> REJECTED</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-full">NOT ENABLED</span>;
    }
  };

  const handleAction = (id: string) => {
    setActiveFeature(id);
  };

  return (
    <div className="space-y-10 pb-20">
      <SEO title="Growth Tools | IND Distribution" />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20"
          >
            <Zap className="w-3 h-3 text-electric-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-electric-blue">Power Up Your Career</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Indian Growth Tools 🇮🇳</h1>
          <p className="text-white/40 font-medium max-w-xl">Supercharge your music journey with exclusive tools designed for the Indian digital ecosystem.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INDIAN_POWER_FEATURES.map((feature, index) => {
          const Icon = iconMap[feature.icon];
          const status = featureStates[feature.id as keyof typeof featureStates];
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative p-8 rounded-[2.5rem] glass-dark border border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500",
                    feature.accent === 'electric-blue' ? "bg-electric-blue/10 text-electric-blue" : 
                    feature.accent === 'neon-purple' ? "bg-neon-purple/10 text-neon-purple" : "bg-whatsapp-green/10 text-whatsapp-green"
                  )}>
                    {Icon && <Icon className="w-7 h-7" />}
                  </div>
                  {getStatusBadge(status)}
                </div>

                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{feature.title}</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed mb-8">
                  {feature.description}
                </p>
              </div>

              <button
                onClick={() => handleAction(feature.id)}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
                  status === 'Active' ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-electric-blue text-[#0D1B2A] hover:shadow-[0_10px_30px_rgba(0,212,255,0.3)]"
                )}
              >
                {status === 'Active' ? "Manage Settings" : "Enable Feature"}
                <Plus className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Action Modal (Mockup for now) */}
      <AnimatePresence>
        {activeFeature && (
          <div className="fixed inset-0 z-100 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setActiveFeature(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl glass-dark border border-white/10 rounded-[3rem] p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setActiveFeature(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-electric-blue/10 text-electric-blue rounded-xl flex items-center justify-center">
                  {activeFeature && iconMap[INDIAN_POWER_FEATURES.find(f => f.id === activeFeature)?.icon || 'Music'] && React.createElement(iconMap[INDIAN_POWER_FEATURES.find(f => f.id === activeFeature)?.icon || 'Music'], { className: "w-6 h-6" })}
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    {INDIAN_POWER_FEATURES.find(f => f.id === activeFeature)?.title}
                  </h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Configuration Panel</p>
                </div>
              </div>

              {/* Dynamic Form Content mapping to IDs */}
              <div className="space-y-6">
                 {activeFeature === 'crbt' && (
                  <>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Release</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-blue transition-colors">
                         <option>Choose a song...</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Telecom Partners</label>
                       <div className="grid grid-cols-2 gap-3">
                         {['Jio', 'Airtel', 'VI', 'BSNL'].map(tel => (
                           <label key={tel} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-not-allowed opacity-50">
                             <span className="text-sm font-bold">{tel}</span>
                             <div className="w-4 h-4 bg-white/10 rounded-full"></div>
                           </label>
                         ))}
                       </div>
                    </div>
                  </>
                 )}

                 {activeFeature === 'instagram' && (
                  <>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Instagram Username</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
                         <input placeholder="username" className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:border-electric-blue transition-colors" />
                       </div>
                    </div>
                    <div className="p-4 bg-neon-purple/5 border border-neon-purple/20 rounded-2xl flex gap-3">
                      <HelpCircle className="w-5 h-5 text-neon-purple shrink-0" />
                      <p className="text-xs text-white/60 leading-relaxed">Linking your profile ensures all Reels using your audio are attributed to your official artist account.</p>
                    </div>
                  </>
                 )}

                 {activeFeature === 'languages' && (
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Target Languages</label>
                     <div className="grid grid-cols-3 gap-2">
                       {INDIAN_LANGUAGES.map(lang => (
                         <div key={lang} className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-lg">
                           <input type="checkbox" className="accent-electric-blue" />
                           <span className="text-[10px] font-bold">{lang}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                 )}

                 {activeFeature === 'lyrics' && (
                  <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Paste Lyrics (Unicode Supported)</label>
                       <textarea rows={6} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-mono focus:outline-none focus:border-electric-blue transition-colors" placeholder="Type or paste your lyrics here..." />
                     </div>
                     <div className="flex gap-3">
                        <button className="flex-1 py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20">Upload Text File</button>
                        <button className="flex-1 py-3 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20">Sync Audio (LRC)</button>
                     </div>
                  </div>
                 )}

                 {activeFeature === 'whatsapp' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Release</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-blue transition-colors">
                         <option>Choose a song...</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Upload Status Clip (Max 30s)</label>
                       <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-whatsapp-green/40 transition-colors cursor-pointer group">
                          <Plus className="w-8 h-8 text-white/20 mx-auto mb-2 group-hover:text-whatsapp-green" />
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Drop audio file or click to browse</p>
                       </div>
                    </div>
                  </div>
                 )}

                 {activeFeature === 'regional' && (
                  <div className="space-y-6">
                    <p className="text-xs text-white/40 font-medium">Select additional Indian platforms for deep distribution.</p>
                    <div className="grid grid-cols-2 gap-3">
                       {['Gaana', 'Wynk Music', 'Hungama', 'JioSaavn'].map(p => (
                         <label key={p} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                           <span className="text-sm font-bold">{p}</span>
                           <input type="checkbox" className="w-5 h-5 accent-electric-blue" defaultChecked />
                         </label>
                       ))}
                    </div>
                  </div>
                 )}

                 {activeFeature === 'verification' && (
                  <div className="space-y-4">
                    <button className="w-full p-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between group hover:bg-electric-blue/10 hover:border-electric-blue/40 transition-all">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center"><ExternalLink className="w-5 h-5" /></div>
                         <div className="text-left">
                           <p className="text-sm font-black uppercase tracking-tight">Request YouTube OAC</p>
                           <p className="text-[10px] text-white/40">Official Artist Channel upgrade</p>
                         </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-electric-blue" />
                    </button>
                    <button className="w-full p-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between group hover:bg-whatsapp-green/10 hover:border-whatsapp-green/40 transition-all">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-whatsapp-green/10 text-whatsapp-green rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                         <div className="text-left">
                           <p className="text-sm font-black uppercase tracking-tight">Spotify Artist Verification</p>
                           <p className="text-[10px] text-white/40">View Blue-Tick Guide</p>
                         </div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-whatsapp-green" />
                    </button>
                  </div>
                 )}

                 {activeFeature === 'upi' && (
                  <div className="space-y-6">
                    <div className="flex gap-2">
                       <button className="flex-1 py-3 bg-whatsapp-green text-[#0D1B2A] rounded-xl text-[10px] font-black uppercase tracking-widest">UPI ID</button>
                       <button className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">Bank Transfer</button>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Enter UPI ID</label>
                       <input placeholder="vpa@bank" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-mono focus:outline-none focus:border-whatsapp-green transition-colors" />
                    </div>
                    <p className="text-[10px] text-white/20 text-center uppercase font-bold tracking-widest">Funds usually arrive within 4-6 hours</p>
                  </div>
                 )}

                 {activeFeature === 'shortvideo' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Base Track</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-electric-blue transition-colors">
                         <option>Choose from your discography...</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Hook Duration</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['15s', '30s', '60s'].map(d => (
                            <button key={d} className={cn("py-3 rounded-xl text-[10px] font-bold border transition-all", d === '30s' ? 'bg-electric-blue/10 border-electric-blue text-electric-blue' : 'bg-white/5 border-white/10 text-white/40')}>{d}</button>
                          ))}
                       </div>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 text-center">Trim Hook (0:45 - 1:15)</p>
                       <div className="h-12 bg-linear-to-r from-electric-blue/20 via-neon-purple/20 to-electric-blue/20 rounded-lg flex items-center justify-between px-1 overflow-hidden">
                          <div className="h-full w-2 bg-electric-blue rounded-full"></div>
                          <div className="flex-1 flex items-center justify-center gap-1 opacity-20">
                             {[...Array(20)].map((_, i) => <div key={i} className="h-6 w-0.5 bg-white rounded-full"></div>)}
                          </div>
                          <div className="h-full w-2 bg-electric-blue rounded-full"></div>
                       </div>
                    </div>
                  </div>
                 )}

                 {/* Fallback for anything not explicitly handled above */}
                 {(!['crbt', 'instagram', 'languages', 'lyrics', 'whatsapp', 'regional', 'verification', 'upi', 'shortvideo'].includes(activeFeature)) && (
                   <div className="py-12 text-center space-y-4">
                     <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-8 h-8 text-white/20" />
                     </div>
                     <p className="text-white/40 text-sm">Action panel for this feature is being synchronized. <br />Please check back in 24 hours.</p>
                   </div>
                 )}

                <div className="pt-6">
                  <button 
                    onClick={() => setActiveFeature(null)}
                    className="w-full py-5 bg-linear-to-r from-electric-blue to-neon-purple text-[#0D1B2A] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                  >
                    Confirm Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
