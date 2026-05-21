import React from 'react';
// Sitemap Structural Navigation Page - TuneIND Music
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Music, Map, ExternalLink, Globe, Shield, Headphones, User, Mail, FileText } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import SEO from '../components/SEO';
import { SEO_PAGES_CONTENT } from '../constants/seoContent';

const SitemapPage = () => {
  const categories = [
    {
      title: "Core Navigation",
      icon: Map,
      links: [
        { label: "Home Command Center", to: "/", icon: Music },
        { label: "Founder & Developer Profile", to: "/founder-developer", icon: User },
        { label: "Music Distribution Portal", to: "/dashboard/login", icon: Globe },
        { label: "Pricing & Elite Plans", to: "/#pricing", icon: Shield },
        { label: "Ecosystem Features", to: "/#features", icon: Headphones },
        { label: "Universal Support Desk", to: "/contact", icon: Mail },
        { label: "Industry Intelligence Blog", to: "/blog", icon: FileText },
      ]
    },
    {
      title: "Educational Resources (SEO)",
      icon: Globe,
      links: Object.keys(SEO_PAGES_CONTENT).map(slug => ({
        label: SEO_PAGES_CONTENT[slug].title.split('|')[0].trim(),
        to: `/${slug}`,
        icon: ExternalLink
      }))
    },
    {
      title: "Legal & Compliance",
      icon: Shield,
      links: [
        { label: "Terms of Service", to: "/terms", icon: FileText },
        { label: "Privacy Protocol", to: "/privacy", icon: FileText },
        { label: "Refund Architecture", to: "/refund", icon: FileText },
      ]
    },
    {
      title: "Dashboard Ecosystem",
      icon: Headphones,
      links: [
        { label: "Artist Portfolio Management", to: "/dashboard/artists", icon: User },
        { label: "Secure Financial Wallet", to: "/dashboard/wallet", icon: Shield },
        { label: "New Release Deployment", to: "/dashboard/upload", icon: Music },
        { label: "Automated Content ID Management", to: "/dashboard/content-id", icon: Shield },
        { label: "Official Artist Channel (OAC)", to: "/dashboard/oac", icon: User },
        { label: "Smart Marketing & Growth Tools", to: "/dashboard/growth", icon: Globe },
        { label: "Developer API Support", to: "/dashboard/support", icon: Mail },
      ]
    },
    {
      title: "Premium Services & APIs",
      icon: ExternalLink,
      links: [
        { label: "Spotify India Upload Engine", to: "/upload-song-on-spotify-india", icon: Music },
        { label: "JioSaavn Native Distribution", to: "/best-music-distribution-india", icon: Music },
        { label: "White Label Enterprise Distribution", to: "/b2b-music-distribution-india", icon: Globe },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-brand-blue/20 overflow-x-hidden relative">
      <SEO 
        title="Sitemap | Complete Platform Architecture | TuneIND Music"
        description="Navigate through TuneIND Music's complete platform ecosystem. Locate enterprise guides on Spotify India setup, JioSaavn native distribution, and secure wallet tools."
        url="https://tuneindmusic.in/sitemap"
      />
      <PublicNavbar />

      {/* Futuristic Ambient Top Background Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none opacity-10 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-brand-blue/30 blur-[130px] rounded-full"></div>
      </div>

      <main id="main-content" className="pt-40 pb-24 px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Description Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 md:mb-20 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              SITE MAP<span className="text-brand-blue">.</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-lg max-w-2xl leading-relaxed font-medium">
              Locate and browse every secure operational directory, informational portal, and integration guide mapped across the TuneIND Music distribution infrastructure.
            </p>
          </motion.div>

          {/* Grid Layout Categories Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            {categories.map((cat, idx) => (
              <motion.section 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="space-y-6"
              >
                {/* Section Header Indicator */}
                <div className="flex items-center gap-3.5 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 shrink-0">
                    <cat.icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <h2 className="text-sm md:text-base font-black uppercase tracking-widest text-slate-400 font-display">
                    {cat.title}
                  </h2>
                </div>

                {/* Sub Links Cards Iteration */}
                <div className="grid grid-cols-1 gap-3">
                  {cat.links.map((link, lIdx) => (
                    <Link
                      key={lIdx}
                      to={link.to}
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-brand-blue/5 hover:border-brand-blue/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden max-w-[90%]">
                        <link.icon className="w-4 h-4 text-slate-500 group-hover:text-brand-blue transition-colors shrink-0" />
                        <span className="font-bold text-xs md:text-sm text-slate-400 group-hover:text-white transition-colors truncate">
                          {link.label}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0 border border-white/10">
                        <ExternalLink className="w-3.5 h-3.5 text-brand-blue" />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Premium Bottom Call To Action Console Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-brand-blue/10 via-slate-950 to-slate-950 border border-white/5 relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-3xl font-black font-display uppercase tracking-tight mb-2">Ready to Deploy Your Music?</h3>
                <p className="text-slate-400 text-xs md:text-sm font-medium">Join over 50,000+ artists distributing high-fidelity tracks globally with absolute control.</p>
              </div>
              <Link 
                to="/dashboard/login"
                className="w-full md:w-auto px-8 py-4 bg-brand-blue text-white font-black uppercase tracking-widest text-[10px] rounded-xl text-center shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.5)] transition-all active:scale-98 shrink-0"
              >
                Launch Control Dashboard
              </Link>
            </div>
            {/* Ambient Corner Blur Element */}
            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-brand-blue/10 blur-[90px] rounded-full pointer-events-none" />
          </motion.div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default SitemapPage;
