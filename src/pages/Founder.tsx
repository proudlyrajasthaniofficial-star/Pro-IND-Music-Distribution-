import React from "react";
// Founder & Developer Profile Page - TuneIND Music
import { motion } from "framer-motion";
import { 
  Instagram, 
  Youtube, 
  Globe, 
  MessageCircle, 
  ArrowRight,
  Music,
  Code,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

const Founder = () => {
  // Founder structured data profile for premium organic branding
  const founderSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "SK Ji",
    "jobTitle": "Founder & Lead Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "TuneIND Music"
    },
    "url": "https://tuneindmusic.in/founder-developer",
    "image": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiMuf6SPER_hZb8y0rIp-8attT5vAKsBXyyNhofyZ1HZdYQ4Mrz0A_3VRjsib1uSPqMFuqELCBbP7A5Ql2nbWJwhTXhz588dOnSGiaPsj3EEMMs1kIRcUPIVuYRlosU95w19HLlxiFF6Zd3UNILWTkNVXlqpfDXwgCmCOg_9CLhclnre3Ody-cAR7n0VaU/s4096/1000166093.jpg"
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative font-sans selection:bg-brand-blue/20">
      <SEO 
        title="Founder & Developer | TuneIND Music"
        description="Meet SK Ji, the visionary founder and lead developer behind India's most scalable, secure, and advanced music distribution platform."
        schema={founderSchema}
      />

      {/* Futuristic Layered Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 45, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-[800px] md:w-[1000px] h-[800px] md:h-[1000px] bg-gradient-to-br from-brand-blue/15 via-indigo-500/10 to-transparent rounded-full blur-[130px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.15, 1, 1.15],
            rotate: [0, -45, 0],
            opacity: [0.08, 0.12, 0.08]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-[800px] md:w-[1000px] h-[800px] md:h-[1000px] bg-gradient-to-tl from-purple-600/15 via-pink-500/5 to-transparent rounded-full blur-[130px]"
        />
        
        {/* Ambient Tech Icons Grid Floating */}
        <div className="absolute inset-0 opacity-[0.02]">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                rotate: Math.random() * 360
              }}
              animate={{ 
                y: [null, "-15px", "0px"],
                rotate: [null, i % 2 === 0 ? "8deg" : "-8deg", "0deg"]
              }}
              transition={{ 
                duration: 6 + Math.random() * 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              {i % 2 === 0 ? <Music size={40} /> : <Code size={40} />}
            </motion.div>
          ))}
        </div>
      </div>

      <PublicNavbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-40 pb-24">
        {/* Core Hero Branding Area */}
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter uppercase mb-6 leading-none">
              Meet the Founder <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue via-indigo-400 to-purple-500">
                & Developer
              </span>
            </h1>
            <p className="text-sm md:text-xl text-slate-400 font-medium max-w-2xl mx-auto tracking-tight leading-relaxed">
              Building the future of Indian independent music distribution with enterprise architecture, secure protocols, and artistic transparency.
            </p>
          </motion.div>
        </div>

        {/* Profile Details Container Grid */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 bg-slate-950/40 shadow-2xl group">
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiMuf6SPER_hZb8y0rIp-8attT5vAKsBXyyNhofyZ1HZdYQ4Mrz0A_3VRjsib1uSPqMFuqELCBbP7A5Ql2nbWJwhTXhz588dOnSGiaPsj3EEMMs1kIRcUPIVuYRlosU95w19HLlxiFF6Zd3UNILWTkNVXlqpfDXwgCmCOg_9CLhclnre3Ody-cAR7n0VaU/s4096/1000166093.jpg" 
                alt="SK Ji - Founder of TuneIND Music"
                className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -inset-6 bg-brand-blue/5 blur-[80px] -z-10 rounded-full" />
          </motion.div>

          {/* Core Content Portfolio Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-10 md:space-y-12"
          >
            {/* Main Bio Content Card */}
            <div className="bg-slate-900/30 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -z-10" />
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] italic">System Architect</p>
                  <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white uppercase leading-none">
                    SK Ji
                  </h2>
                </div>
                
                <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-3">
                  <div className="w-6 h-[2px] bg-brand-blue" />
                  Founder & Lead Developer
                </h3>
                
                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-normal">
                  SK Ji is the visionary mind driving TuneIND Music. His focus remains on engineered transparency, automating mechanical royalty streams, and setting up an airtight distribution ecosystem tailored carefully for Indian labels and independent talent.
                </p>

                {/* Analytical Numbers Section */}
                <div className="pt-6 grid grid-cols-2 gap-6 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-2xl md:text-4xl font-black font-display text-brand-blue tracking-tighter">10k+</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Artists Empowered</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl md:text-4xl font-black font-display text-purple-400 tracking-tighter">1M+</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Streams Managed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Protocol Block */}
            <div className="space-y-5">
               <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4">
                  Connection Protocols <div className="flex-1 h-[1px] bg-white/5" />
               </h3>
               
               <div className="flex flex-col sm:flex-row gap-4">
                 <a 
                   href="https://wa.me/917742789827" 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex-1 group relative h-16 rounded-2xl overflow-hidden shadow-lg border border-emerald-500/20 active:scale-98 transition-all"
                 >
                    <div className="absolute inset-0 bg-emerald-600 group-hover:bg-emerald-500 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 flex items-center justify-center gap-3 text-white">
                      <MessageCircle className="w-5 h-5 fill-white/10" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Secure Secure WhatsApp Connection</span>
                    </div>
                 </a>

                 <div className="flex gap-3">
                   {[
                     { icon: Instagram, color: "text-slate-400 hover:text-pink-500 hover:bg-pink-500/10 border-white/5" },
                     { icon: Youtube, color: "text-slate-400 hover:text-red-500 hover:bg-red-500/10 border-white/5" },
                     { icon: Globe, color: "text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 border-white/5" }
                   ].map((social, i) => (
                     <button 
                       key={i} 
                       aria-label="Social Link Connection"
                       className={`w-16 h-16 bg-white/[0.02] border rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-xl ${social.color}`}
                     >
                       <social.icon className="w-5 h-5" />
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Quote Block Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 md:mt-40 text-center space-y-6 md:space-y-8"
        >
          <div className="w-16 h-16 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-2xl relative">
             <div className="absolute inset-0 bg-brand-blue rounded-2xl blur-xl opacity-20" />
             <Sparkles className="text-brand-blue w-6 h-6 relative z-10 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-5xl font-display font-black tracking-tighter max-w-3xl mx-auto leading-tight uppercase">
            "Transforming the Indian music landscape through scalable code and <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-purple-400">boundless creativity</span>."
          </h2>
          <div className="flex justify-center flex-wrap gap-3 pt-4">
            {['Strategic Vision', 'Full-Stack Excellence', 'Security First', 'User Centric'].map((tag, i) => (
              <span key={i} className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 border border-white/5 px-5 py-2 rounded-full bg-white/[0.01]">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
      
      <PublicFooter />
    </div>
  );
};

export default Founder;
