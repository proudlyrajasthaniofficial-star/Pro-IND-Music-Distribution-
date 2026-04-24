import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Building,
  Send,
  MessageSquare,
  Music,
  ChevronRight,
  Globe,
  Instagram,
  Youtube,
  ShieldCheck
} from "lucide-react";
import LegalNavbar from "../../components/legal/LegalNavbar";
import SEO from "../../components/SEO";
import { LoadingSpinner } from "../../components/ui/Loading";
import { cn } from "../../lib/utils";

export default function Contact() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    setTimeout(() => {
      setFormState('success');
      setTimeout(() => setFormState('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[60rem] h-[60rem] bg-blue-50/50 blur-[120px] rounded-full" />
        <div className="absolute top-3/4 -right-1/4 w-[50rem] h-[50rem] bg-indigo-50/40 blur-[120px] rounded-full" />
      </div>
      <SEO 
        title="Contact Us | IND Distribution"
        description="Get in touch with the IND Distribution team. We're here to help artists with music distribution, royalties, and support."
      />
      
      <LegalNavbar />

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-4xl mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 uppercase italic"
          >
            Contact <span className="text-indigo-600">Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl"
          >
            Have a question about your release or technical issues? Our support squad is standing by to amplify your voice.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-100 rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-indigo-100/20"
          >
            <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                 <MessageSquare className="w-6 h-6" />
               </div>
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Direct Transmission</h2>
            </div>

            {formState === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-green-50 rounded-[4rem] border border-green-100"
              >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-green-100">
                  <Send className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-green-900 uppercase italic">Message Synced!</h3>
                <p className="text-green-700/60 font-medium">We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Identity</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Sunil Kumar"
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-600/20 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Electronic Mail</label>
                    <input 
                      required
                      type="email" 
                      placeholder="sunil@music.com"
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-600/20 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Detailed Message</label>
                  <textarea 
                    required
                    rows={6} 
                    placeholder="Briefly describe your distribution query..."
                    className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2.5rem] focus:ring-2 focus:ring-indigo-600/20 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none"
                  />
                </div>
                
                <button 
                  disabled={formState === 'loading'}
                  type="submit" 
                  className="w-full py-6 bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  {formState === 'loading' ? (
                    <LoadingSpinner size="sm" className="!border-white/20 !border-t-white" />
                  ) : (
                    <>
                      Transmit Transmission
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Right Side: Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Main Info Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Legal Entity</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight italic uppercase">SUNIL KUMAR</h3>
                  <div className="space-y-4 text-slate-400">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-indigo-400 mt-1" />
                      <p className="font-medium text-lg leading-snug">Rajasthan, India – 335001</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Phone className="w-5 h-5 text-indigo-400" />
                      <p className="font-medium text-lg">+91 7742789827</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="w-5 h-5 text-indigo-400 mt-1" />
                      <p className="font-medium text-lg truncate">musicdistributionindia.in@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex flex-wrap gap-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Support Hours</span>
                    </div>
                    <p className="font-bold uppercase tracking-widest text-xs">Mon–Sat / 10 AM – 6 PM</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Region</span>
                    </div>
                    <p className="font-bold uppercase tracking-widest text-xs">Asia / India / Global</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social & Help Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 group hover:bg-indigo-600 transition-colors duration-500">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Instagram className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 group-hover:text-white transition-colors uppercase italic mb-2">Instagram</h4>
                <p className="text-sm text-slate-400 group-hover:text-indigo-100 transition-colors uppercase tracking-widest font-bold">@ind.distribution</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 group hover:bg-slate-900 transition-colors duration-500">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Youtube className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 group-hover:text-white transition-colors uppercase italic mb-2">YouTube</h4>
                <p className="text-sm text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">IND Artists Academy</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
          <p>© 2026 IND Distribution</p>
          <div className="flex gap-6 items-center">
            <Globe className="w-3 h-3" />
            <span>HQ / Rajasthan / India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
