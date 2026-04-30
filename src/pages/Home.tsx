import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { 
  Music, 
  Zap, 
  MessageCircle,
  Play,
  Instagram,
  Youtube,
  Apple,
  Mail,
  Phone,
  MapPin,
  Globe,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cpu
} from "lucide-react";
import { cn } from "../lib/utils";
import { LoadingSpinner } from "../components/ui/Loading";
import { useAuth } from "../context/AuthContext";
import IndianFeatures from "../components/IndianFeatures";
import PricingSection from "../components/PricingSection";
import GalaxyBackground from "../components/GalaxyBackground";
import PublicFooter from "../components/PublicFooter";

const PLATFORMS = [
  { name: "Spotify", gradient: "from-[#1DB954] to-[#1ed760]" },
  { name: "Apple Music", gradient: "from-[#fc3c44] to-[#fa243c]" },
  { name: "YouTube", gradient: "from-[#ff0000] to-[#cc0000]" },
  { name: "Instagram", gradient: "from-[#833ab4] via-[#fd1d1d] to-[#fcb045]" },
  { name: "Amazon Music", gradient: "from-[#ff9900] to-[#ffb700]" },
  { name: "TikTok", gradient: "from-[#00f2ea] to-[#ff0050]" },
  { name: "JioSaavn", gradient: "from-[#00b0f0] to-[#0089bd]" },
  { name: "Gaana", gradient: "from-[#e72c33] to-[#ff5252]" },
  { name: "Wynk", gradient: "from-[#ff2d55] to-[#ff3b30]" },
  { name: "Hungama", gradient: "from-[#f16322] to-[#ffb347]" }
];

export default function Home() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
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
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden selection:bg-electric-blue/30">
      <SEO 
        title="IND Distribution | Elite Global Music Distribution"
        description="Join 50k+ global artists. Distribute your music to 250+ stores like Spotify, Apple Music, and Instagram with IND Distribution. Get 24hr releases and 100% transparent royalty management."
      />
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/917742789827" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform active:scale-90 group"
      >
        <MessageCircle className="w-8 h-8 fill-white text-white group-hover:animate-pulse" />
      </a>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass-dark mt-4 mx-auto max-w-7xl left-0 right-0 rounded-full border-white/5">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center rotate-12 shadow-lg">
            <Music className="text-white w-6 h-6 -rotate-12" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tighter">IND<span className="text-electric-blue">.</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/60">
          <a href="#features" className="hover:text-electric-blue transition-colors">Features</a>
          <a href="#pricing" className="hover:text-electric-blue transition-colors">Pricing</a>
          <Link to="/founder-developer" className="hover:text-electric-blue transition-colors">Founder</Link>
          <Link to="/blog" className="hover:text-electric-blue transition-colors">Blog</Link>
          <Link to="/contact" className="hover:text-electric-blue transition-colors">Contact</Link>
          <Link to="/features" className="hover:text-electric-blue transition-colors uppercase">Support</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to={user ? "/dashboard" : "/auth?mode=login"} 
            className="text-sm font-medium hover:text-electric-blue transition-colors"
          >
            {user ? "Dashboard" : "Login"}
          </Link>
          <Link 
            to={user ? "/dashboard/upload" : "/auth?mode=signup"} 
            className="px-6 py-2.5 bg-electric-blue text-[#0D1B2A] rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
          >
            {user ? "Primary Release" : "Start Now"}
          </Link>
        </div>
      </nav>

      {/* Hero Section - Professional & Minimalist */}
      <section 
        className="relative w-full min-h-[95vh] flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden"
      >
        <GalaxyBackground />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 mb-10 shadow-2xl backdrop-blur-md">
              <div className="w-2 h-2 bg-electric-blue rounded-full animate-pulse shadow-[0_0_10px_rgba(0,212,255,1)]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Premium Global Infrastructure // 2026 Edition</span>
            </div>

            <h1 className="text-6xl md:text-[9.5rem] font-black font-display tracking-tighter leading-[0.8] uppercase mb-14 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <span className="block text-white">THE STANDARD</span>
              <span className="bg-gradient-to-r from-electric-blue via-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient pb-6 block">
                FOR GLOBAL ARTISTS
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 font-light max-w-4xl mx-auto mb-16 leading-relaxed backdrop-blur-sm px-4">
              India #1 Music Distribution Service "Music Distribution India". India #1 Music Distribution service Music Distributon India Company Co. is a digital music aggregator from India. Music Distribution India Company avail individual artists and music producers get their music on iTunes, JioSaavn, Wynk, Gaana, Spotify, Google Play Music, Shazam, other music streaming platforms, and digital music stores. <br /><br />
              <span className="text-white/60 text-lg md:text-xl block">
                भारत की #1 संगीत वितरण सेवाएँ संगीत वितरण इंडिया कंपनी कंपनी भारत की एक डिजिटल संगीत एग्रीगेटर है। म्यूजिक डिस्ट्रीब्यूशन इंडिया कंपनी व्यक्तिगत कलाकारों और संगीत निर्माताओं को उनका लाभ देती है
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link 
                to={user ? "/dashboard" : "/auth?mode=signup"} 
                className="group relative w-full sm:w-auto px-16 py-7 bg-white text-[#020617] rounded-full font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">{user ? "Enter Dashboard" : "Access Platform"}</span>
                <div className="absolute inset-0 bg-electric-blue translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto px-16 py-7 glass-dark border border-white/10 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                View Features
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Trusted Platforms Bar - Professional & Clearly Visible */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-32 relative group"
          >
            {/* Background Accent */}
            <div className="absolute inset-0 bg-linear-to-r from-electric-blue/5 via-indigo-500/5 to-purple-500/5 blur-3xl opacity-50 px-20"></div>

            <div className="relative z-10 bg-white border-2 border-slate-100 rounded-[3.5rem] px-12 py-14 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
              {/* Highlight Accents */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-electric-blue to-transparent"></div>
              
              <div className="flex items-center justify-center gap-4 mb-14">
                <div className="h-[1px] w-16 bg-linear-to-r from-transparent to-slate-200"></div>
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">Global Strategic Distribution Partners</p>
                <div className="h-[1px] w-16 bg-linear-to-l from-transparent to-slate-200"></div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-12 md:gap-x-16">
                {[
                  { name: "IND Global Partner 1", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhnuZFPw6hZKwAIIzYyL2T2TTR4zHw24qGkQ4J4vL2Rnyc3AMa5Q0MRDYY8v26-W7Sm4awu1M4o7D4BnvXtkYCMGxlo3XiN29rxtqhKZn78Nj68eEY7bLxSCfCg6MhnYCOuJq2epCreaqb9-hjNqRWwj3K6GnKsFAAkSz8TNfrbKsXdh5Ef2XIK2pAlufE/s356/1000611951.jpg" },
                  { name: "IND Global Partner 3", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmbVKcd85-8ZLE6r3q2gBnJ0cTAlgJDn7wuRyGX2mVIKCj7-3gVe-V30KqakxLKq4SSAbIjbfpwnqtBR2ekcKkVfTm_qd-R7UDHjP5ih1Vul8xVl1uQbIMluMJp-Nx3spN6X2u46Bwt9i3PtkEnpUkgSsphtB6If83ZeV6IDw5JFyNzIrMEht0Iql1yqc/s1286/1000611954.png" },
                  { name: "IND Global Partner 4", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjkyZTgedhZ15-1h-kFf2Oh4qXdYJ1illCgeOySZXydnqp-MdKv7JxHrNGLgBjfHpS_-BCkhIsr1-szpxDjpd1e9s3mf2jP5fPLWO3L9B86NHuqlJOV0IIEszdAszBwbiLewKaeB8-XVsdgc7objCjWVojMt8yhi68OBWs6P4Ow9TfP-q4HO7lVuLA3B94/s1512/1000611955.jpg" },
                  { name: "Strategic Partner 6", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiJk9ZXrkmXqyudZTFNatip2SQ2E9EElDTboKCB22D0V3ADLTHNnto4aIULiGCdvpYTnRhjpazmd8Em94t6dyo7yd6CYGnWKtIrQ4dO6EHZ99Jhvhj57VrXllzr2Do8_6bZsR5gQQca9dhdZ0x2P8pHsJy9td_j1yciGUqtUhKXp3zPpGQ3fNuYU8v5CM/s500/1000625201.png" },
                  { name: "Strategic Partner 7", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj6m9lMg8ywh63Bo4SDanOYWCyFuC7uiv87x__oDEn27ijt_zFjkGC477NW7HzooI3hTuc6ma5jAOH0wfmY6c6nqeGjTT4Gg8la22SspPHt2_cI_LzBaXWVLomq-2F_G-m8Ojp8PVD2M4MnHZmeqeW2j_gMbu_BG9GvbBSwoOieVZ7IKnXHTKCBBIBZXYg/s2100/1000625202.png" },
                  { name: "Strategic Partner 8", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSmzlvBVmN5lb9ZTHgVMHmEZQ3N4VFyJkQ2tBiAAjTlF5eWm0Tk6Gxt9PhZfVNMR2u3XhYslpUh4RVNuTRM14oCfU3U1aMPn3Uflzq0ijJKaAvaPnCtawKlOLJPk1612vYEwDaqfmoPJxB6CuuNMdH_t8sZ-WbOKYuofWgGhi9su0GToJkIujUttlCeUs/s259/1000625203.png" },
                  { name: "Strategic Partner 10", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhgjscqbCCZcf5zSirXlh1mQyLkJvdDA1HN3VHiBl73SVp0iL82fFMKIbRbbvNgNUO9PWMLE_9Ws_PoB0raedk5m01891NVsX7g42Ulwc_b0XR0E9GvEV_Vr6aUAU7xYO9DpoZz1PIDCuTmcfAsP4RUZ0SY9icvsoNGhB4rCFHSgKkeMtfqbx0dRBtgNmo/s410/1000625205.png" },
                  { name: "Strategic Partner 11", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhTYNbCbXqLTXLri2OTQVEdgk7aZ3-KG4NgQROz7VazPDffdA4vavCFvVR1MwJqnNFfVYPluxs2HEOn1FeqF6YBfarEJEWmSg6AkfpNT3rtUPxK9LXErERSGq_OaI8zH8GAerIjlE8bgWKEmDmT4AaNp1D1abUyWxroEIIWxDuuaot-So3fLNCiQbEQ-0k/s275/1000625236.png" },
                  { name: "Strategic Partner 12", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjLcWB-HFsu20dk8gf_0RIY27Ils7now3ILkM5s7NgDdeNdopdjzagQzLEERSwlUicLPmTGtcByCd5Gmvf3wPQCEpnZH3A7arzyhpc6AEIf-av4YyF0gDLXJr0_9dNw8KLcoCtusJLiayMpHHlHsxc2IarR75unTyhRmlxt78nJNqkvpwFWdXGSfvLvIbc/s390/1000625226.png" },
                  { name: "Strategic Partner 13", url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhancUG3ZDe-usJ0JrWxt_erpCXnj00fH_qv4uv_UW-7LT77nkYYu4uMmeiTO5Vit_F2ugF74S0b6Dx5iRd-DcPd_sIaOmHHxY7hOvDXtU8vRrRtas5e4iUx9b-g3mhdsJ7zoQ1ZURRjsM-1DtiMFA80RJ0nMt7Mfm0hqbVJsn6ZHPOxfsURUi0aiBzv0k/s439/1000625200.png" }
                ].map((platform, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="relative group/logo"
                  >
                    <img 
                      src={platform.url} 
                      alt={platform.name} 
                      className="h-10 md:h-16 w-auto object-contain transition-all duration-500 rounded-lg shadow-sm group-hover:shadow-md" 
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Indian Power Features Section */}
      <IndianFeatures />

      {/* Features - Bento Grid */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-electric-blue/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-neon-purple/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/5 mb-6"
              >
                <Zap className="w-4 h-4 text-electric-blue" />
                <span className="text-xs font-black uppercase tracking-widest text-electric-blue">Platform Features</span>
              </motion.div>
              <h2 className="font-display text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
                CRAFTED FOR <br />
                <span className="bg-clip-text text-transparent bg-linear-to-r from-electric-blue to-neon-purple">INDEPENDENT</span> <br />
                EXCELLENCE
              </h2>
            </div>
            <p className="text-white/40 max-w-md text-lg font-light leading-relaxed mb-4 text-left">
              We've built the most comprehensive toolkit for modern musicians. From pixel-perfect distribution to deep data insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
            {/* Feature 1: Worldwide Distribution (Large) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-6 lg:col-span-8 group relative overflow-hidden rounded-[4rem] glass-dark p-12 border-white/5 transition-all duration-500 hover:border-white/10"
            >
              <div className="flex flex-col h-full justify-between gap-12 text-left">
                <div>
                  <div className="w-16 h-16 bg-electric-blue text-[#0D1B2A] rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.3)] mb-8 rotate-3 transition-transform group-hover:rotate-12">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-black font-display mb-4 uppercase">250+ GLOBAL STORES</h3>
                  <p className="text-white/40 text-lg font-light max-w-md">Your music everywhere. From Spotify and Apple Music to TikTok, Instagram, and regional giants like JioSaavn.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {["Spotify", "Apple Music", "TikTok", "Amazon", "Deezer", "Tidal", "Pandora", "Boomplay"].map(s => (
                    <span key={s} className="px-5 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/60">{s}</span>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe className="w-64 h-64 rotate-12" />
              </div>
            </motion.div>

            {/* Feature 2: Analytics (Vertical Slim) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-6 lg:col-span-4 rounded-[4rem] bg-white text-[#0D1B2A] p-12 relative overflow-hidden group border-none"
            >
              <div className="relative z-10 flex flex-col h-full justify-between text-left">
                <div>
                  <div className="w-16 h-16 bg-[#0D1B2A] rounded-3xl flex items-center justify-center mb-8">
                    <BarChart3 className="w-8 h-8 text-electric-blue" />
                  </div>
                  <h3 className="text-4xl font-black font-display mb-4 uppercase">REAL-TIME DATA</h3>
                  <p className="text-[#0D1B2A]/60 font-medium leading-relaxed uppercase text-xs tracking-tight">Daily trend reports and deep analytics on who's listening and where they are located.</p>
                </div>
                <div className="mt-8 space-y-4">
                  {[45, 80, 60].map((w, i) => (
                    <div key={i} className="h-2 bg-[#0D1B2A]/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${w}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        className="h-full bg-linear-to-r from-electric-blue to-neon-purple"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Rights Management */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-3 lg:col-span-4 rounded-[4rem] glass-dark p-10 group border-white/5 text-left"
            >
              <div className="w-14 h-14 bg-neon-purple rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 shadow-neon-purple/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black font-display mb-4 uppercase tracking-tight">CONTENT ID & RIGHTS</h3>
              <p className="text-white/40 font-light text-sm leading-relaxed">Official protection for your audio on YouTube, Facebook, and Instagram. Never lose a cent on unauthorized usage.</p>
            </motion.div>

            {/* Feature 4: Fast Approval */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-3 lg:col-span-4 rounded-[4rem] glass-dark p-10 group border-white/5 bg-electric-blue/5 text-left"
            >
              <div className="w-14 h-14 bg-soft-orange rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 shadow-soft-orange/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black font-display mb-4 uppercase tracking-tight">24HR APPROVAL</h3>
              <p className="text-white/40 font-light text-sm leading-relaxed">Our dedicated review team ensures your release is perfect and approved for delivery within 24 hours.</p>
            </motion.div>

            {/* Feature 5: Artist Development */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-6 lg:col-span-4 rounded-[4rem] glass-dark p-10 group border-white/5 overflow-hidden relative text-left"
            >
              <div className="relative z-10 text-left">
                 <div className="w-14 h-14 bg-electric-blue text-[#0D1B2A] rounded-2xl flex items-center justify-center shadow-lg shadow-electric-blue/20 mb-6">
                  <Play className="w-6 h-6 fill-[#0D1B2A]" />
                </div>
                <h3 className="text-2xl font-black font-display mb-4 uppercase tracking-tight">OAC & VEVO</h3>
                <p className="text-white/40 font-light text-sm leading-relaxed">Upgrade to an Official Artist Channel on YouTube and get your music videos on Vevo worldwide.</p>
              </div>
              <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Youtube className="w-20 h-20 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-electric-blue/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neon-purple/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            {/* Left side: Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-dark p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-white/5"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/5 border border-electric-blue/10 mb-8">
                <MessageSquare className="w-3.5 h-3.5 text-electric-blue" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-electric-blue">Contact Support</span>
              </div>
              
              <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter leading-tight md:leading-[1] mb-8 uppercase text-white text-left">
                READY TO <br />
                <span className="text-electric-blue">CONNECT?</span>
              </h2>
              
              <p className="text-white/40 text-base font-light leading-relaxed mb-10 text-left uppercase text-xs tracking-widest">
                Our support team is active **Mon - Sat (10am - 7pm)** to help you with your distribution needs.
              </p>

              <div className="space-y-6 mb-10">
                {[
                  { icon: Mail, label: "Email Us", value: "musicdistributionindia.in@gmail.com", href: "mailto:musicdistributionindia.in@gmail.com", color: "text-electric-blue" },
                  { icon: Phone, label: "Official Line", value: "011-69652811", href: "tel:01169652811", color: "text-neon-purple" },
                  { icon: MessageCircle, label: "Direct WhatsApp", value: "+91 7742789827", href: "https://wa.me/917742789827", color: "text-[#25D366]" }
                ].map((item, i) => (
                  <a key={i} href={item.href} className="flex gap-5 items-center group text-left">
                    <div className={cn("w-11 h-11 rounded-xl glass-dark border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-sm", item.color)}>
                      <item.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-0.5">{item.label}</p>
                      <p className="text-base font-bold text-white group-hover:text-electric-blue transition-colors break-all md:break-normal">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <motion.a
                href="https://wa.me/917742789827"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                Chat on WhatsApp
              </motion.a>
            </motion.div>

            {/* Right side: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-dark p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] relative z-10 border-white/5 shadow-2xl text-left"
            >
              {formState === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-[400px] flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-20 h-20 bg-electric-blue/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-electric-blue" />
                  </div>
                  <h3 className="text-2xl font-black font-display text-white mb-4 uppercase italic tracking-tight">MESSAGE TRANSMITTED</h3>
                  <p className="text-white/40 font-medium uppercase text-xs tracking-widest leading-relaxed">Our neural network has received your inquiry. A specialist will touch base shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2 italic">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe" 
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-blue focus:bg-white/10 outline-none transition-all font-medium text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2 italic">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="john@example.com" 
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-blue focus:bg-white/10 outline-none transition-all font-medium text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2 italic">Subject Domain</label>
                      <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-blue focus:bg-white/10 outline-none transition-all font-medium text-white appearance-none">
                        <option className="bg-[#0D1B2A]">Account Support</option>
                        <option className="bg-[#0D1B2A]">Distribution Query</option>
                        <option className="bg-[#0D1B2A]">Royalties & Payments</option>
                        <option className="bg-[#0D1B2A]">Marketing Services</option>
                      </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2 italic">Vocalize Message</label>
                    <textarea 
                      required
                      rows={4} 
                      placeholder="How can we help you?" 
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-electric-blue focus:bg-white/10 outline-none transition-all font-medium text-white resize-none"
                    ></textarea>
                  </div>
                  <button 
                    disabled={formState === 'loading'}
                    type="submit" 
                    className="w-full py-6 bg-electric-blue text-[#0D1B2A] rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {formState === 'loading' ? (
                      <>
                        <LoadingSpinner size="sm" className="!border-white/20 !border-t-white" />
                        Synchronizing...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
