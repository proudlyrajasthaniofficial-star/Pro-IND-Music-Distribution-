import React from 'react';
import { motion } from 'motion/react';
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
        { label: "Home Page", to: "/", icon: Music },
        { label: "Founder & Developer", to: "/founder-developer", icon: User },
        { label: "Music Distribution Dashboard", to: "/dashboard/login", icon: Globe },
        { label: "Pricing & Plans", to: "/#pricing", icon: Shield },
        { label: "Features Ecosystem", to: "/#features", icon: Headphones },
        { label: "Contact Support", to: "/contact", icon: Mail },
        { label: "Blog & Updates", to: "/blog", icon: FileText },
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
        { label: "Privacy Policy", to: "/privacy", icon: FileText },
        { label: "Refund Policy", to: "/refund", icon: FileText },
      ]
    },
    {
      title: "Dashboard Ecosystem",
      icon: Headphones,
      links: [
        { label: "Artist Management", to: "/dashboard/artists", icon: User },
        { label: "Financial Wallet", to: "/dashboard/wallet", icon: Shield },
        { label: "New Music Upload", to: "/dashboard/upload", icon: Music },
        { label: "Content ID Management", to: "/dashboard/content-id", icon: Shield },
        { label: "Official Artist Channel (OAC)", to: "/dashboard/oac", icon: User },
        { label: "Growth & Marketing Tools", to: "/dashboard/growth", icon: Globe },
        { label: "Universal Support Desk", to: "/dashboard/support", icon: Mail },
      ]
    },
    {
      title: "Services & API",
      icon: ExternalLink,
      links: [
        { label: "Spotify Upload Service", to: "/upload-song-on-spotify-india", icon: Music },
        { label: "JioSaavn Distribution", to: "/best-music-distribution-india", icon: Music },
        { label: "Developer API Access", to: "/dashboard/support", icon: FileText },
        { label: "White Label Distribution", to: "/b2b-music-distribution-india", icon: Globe },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <SEO 
        title="Sitemap | IND Music Distribution India"
        description="Navigate through IND Music Distribution India's complete platform. Find guides on Spotify upload, JioSaavn distribution, pricing, and artist support."
        url="https://musicdistributionindia.online/sitemap"
      />
      <PublicNavbar />

      <main id="main-content" className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-purple">
              SITE MAP<span className="text-white">.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Find every page, guide, and resource across the IND Distribution ecosystem. 
              Our platform is designed for independent artists, labels, and partners.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {categories.map((cat, idx) => (
              <motion.section 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
                    <cat.icon className="w-6 h-6 text-brand-blue" />
                  </div>
                  <h2 className="text-xl font-bold uppercase tracking-widest text-[#94A3B8]">
                    {cat.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {cat.links.map((link, lIdx) => (
                    <Link
                      key={lIdx}
                      to={link.to}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-brand-blue/5 hover:border-brand-blue/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <link.icon className="w-4 h-4 text-slate-500 group-hover:text-brand-blue transition-colors" />
                        <span className="font-bold text-slate-300 group-hover:text-white transition-colors">
                          {link.label}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        <ExternalLink className="w-4 h-4 text-brand-blue" />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-24 p-12 rounded-[2.5rem] bg-gradient-to-br from-brand-blue/10 to-transparent border border-white/5 relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-black mb-4">Ready to start?</h3>
                <p className="text-slate-400 font-medium">Join 50,000+ artists distributing their music worldwide.</p>
              </div>
              <Link 
                to="/dashboard/login"
                className="px-10 py-5 bg-brand-blue text-white font-black uppercase tracking-widest text-sm rounded-full shadow-[0_20px_40px_rgba(0,102,255,0.2)] hover:shadow-[0_25px_50px_rgba(0,102,255,0.4)] transition-all hover:-translate-y-1 active:scale-95"
              >
                Launch Dashboard
              </Link>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default SitemapPage;
