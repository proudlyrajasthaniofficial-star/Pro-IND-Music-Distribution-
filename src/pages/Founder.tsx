import React from "react";
import { motion } from "motion/react";
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
  return (
    <div className="min-h-screen bg-white text-brand-dark overflow-hidden relative">
      <SEO 
        title="Founder & Developer | IND Music Distribution"
        description="Meet SK Ji, the visionary founder and developer behind India's most advanced music distribution platform."
      />

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-[1000px] h-[1000px] bg-linear-to-br from-brand-blue/20 via-brand-purple/20 to-transparent rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-[1000px] h-[1000px] bg-linear-to-tl from-soft-orange/20 via-neon-purple/20 to-transparent rounded-full blur-[120px]"
        />
        
        {/* Floating Icons */}
        <div className="absolute inset-0 opacity-[0.03]">
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
                y: [null, "-20px", "0px"],
                rotate: [null, i % 2 === 0 ? "10deg" : "-10deg", "0deg"]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              {i % 2 === 0 ? <Music size={48} /> : <Code size={48} />}
            </motion.div>
          ))}
        </div>
      </div>

      <PublicNavbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-6 relative">
              <span className="animate-text-shift">
                Meet the Founder <br className="hidden md:block" /> & Developer
              </span>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-brand-blue/10 blur-3xl -z-10"
              />
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto tracking-tight">
              Building the future of music distribution in India with cutting-edge technology and artistic vision.
            </p>
          </motion.div>
        </div>

        {/* Founder Card Container */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl group">
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiMuf6SPER_hZb8y0rIp-8attT5vAKsBXyyNhofyZ1HZdYQ4Mrz0A_3VRjsib1uSPqMFuqELCBbP7A5Ql2nbWJwhTXhz588dOnSGiaPsj3EEMMs1kIRcUPIVuYRlosU95w19HLlxiFF6Zd3UNILWTkNVXlqpfDXwgCmCOg_9CLhclnre3Ody-cAR7n0VaU/s4096/1000166093.jpg" 
                alt="SK Ji - Founder of IND Music Distribution"
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Background Glow */}
            <div className="absolute -inset-10 bg-brand-blue/5 blur-[100px] -z-10 rounded-full" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="bg-slate-50 p-12 rounded-[4rem] relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-3xl -z-10 group-hover:bg-brand-purple/10 transition-colors" />
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-black text-brand-blue uppercase tracking-[0.3em]">The Architect</p>
                  <h2 className="text-6xl md:text-7xl font-display font-black tracking-tighter text-slate-900 uppercase">
                    SK Ji
                  </h2>
                </div>
                
                <h3 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-brand-blue" />
                  Founder & Developer
                </h3>
                
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  SK Ji is the visionary founder behind IND Music Distribution, focused on empowering independent artists and labels across India with a powerful, scalable, and transparent music distribution ecosystem.
                </p>

                <div className="pt-8 grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-3xl font-black font-display text-brand-blue tracking-tighter">10k+</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Artists Empowered</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black font-display text-brand-purple tracking-tighter">1M+</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Streams Managed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
                  Connection Protocols <div className="flex-1 h-[1px] bg-slate-100" />
               </h3>
               
               <div className="flex flex-col sm:flex-row gap-6">
                 <a 
                   href="https://wa.me/917742789827" 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex-1 group relative h-20 rounded-3xl overflow-hidden shadow-xl shadow-whatsapp-green/20"
                 >
                    <div className="absolute inset-0 bg-whatsapp-green group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 flex items-center justify-center gap-4 text-white">
                      <MessageCircle className="w-6 h-6 fill-white/20" />
                      <span className="font-black text-xs uppercase tracking-widest">Contact on WhatsApp</span>
                    </div>
                 </a>

                 <div className="flex gap-4">
                   {[
                     { icon: Instagram, color: "hover:text-pink-500 hover:bg-pink-50" },
                     { icon: Youtube, color: "hover:text-red-500 hover:bg-red-50" },
                     { icon: Globe, color: "hover:text-brand-blue hover:bg-blue-50" }
                   ].map((social, i) => (
                     <button 
                       key={i} 
                       className={`w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center ${social.color} transition-all hover:-translate-y-2 hover:shadow-xl`}
                     >
                       <social.icon className="w-6 h-6" />
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Vision Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl relative">
             <div className="absolute inset-0 bg-brand-blue rounded-[2rem] blur-2xl opacity-20 animate-pulse" />
             <Sparkles className="text-brand-blue w-8 h-8 relative z-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter max-w-3xl mx-auto leading-tight">
            "Transforming the Indian music landscape through code and <span className="animate-text-shift">boundless creativity</span>."
          </h2>
          <div className="flex justify-center flex-wrap gap-8 pt-8">
            {['Strategic Vision', 'Full-Stack Excellence', 'Security First', 'User Centric'].map((tag, i) => (
              <span key={i} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border border-slate-100 px-6 py-2 rounded-full">
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
