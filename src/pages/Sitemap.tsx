import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Music, Map, ExternalLink, Globe, Shield, 
  Headphones, User, Mail, FileText 
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import SEO from '../components/SEO';
import { SEO_PAGES_CONTENT } from '../constants/seoContent';

// Type for SEO Keys
type SEOKey = keyof typeof SEO_PAGES_CONTENT;

const SitemapPage: React.FC = () => {
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
      links: (Object.keys(SEO_PAGES_CONTENT) as SEOKey[]).map(slug => ({
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
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-brand-blue/30">
      <SEO 
        title="Sitemap | IND Music Distribution India"
        description="Complete directory of IND Music Distribution India. Navigate to Spotify distribution guides, JioSaavn upload services, pricing, and artist dashboard."
        // @ts-ignore (If your SEO component supports it)
        canonical="https://musicdistributionindia.online/sitemap"
      />
      <PublicNavbar />

      <main id="main-content" className="pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Platform Directory</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-display tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
              SITE MAP<span className="text-brand-blue">.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed font-medium">
              Find every page, guide, and resource across the IND Distribution ecosystem. 
              Our platform is architected for independent artists and modern record labels.
            </p>
          </motion.header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
            {categories.map((cat, idx) => (
              <motion.section 
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
                    <cat.icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                    {cat.title}
                  </h2>
                </div>

                <nav className="flex flex-col gap-3">
                  {cat.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-brand-blue/[0.08] hover:border-brand-blue/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <link.icon className="w-4 h-4 text-slate-600 group-hover:text-brand-blue transition-colors" />
                        <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
                          {link.label}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  ))}
                </nav>
              </motion.section>
            ))}
          </div>

          {/* Bottom CTA Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-brand-blue/20 via-brand-blue/5 to-transparent border border-brand-blue/20 relative overflow-hidden text-center md:text-left"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-md">
                <h3 className="text-3xl font-black mb-4">Start Your Global Journey</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Join India's fastest growing distribution network and get your music on 150+ stores instantly.
                </p>
              </div>
              <Link 
                to="/auth?mode=signup"
                className="whitespace-nowrap px-12 py-6 bg-brand-blue text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-brand-blue/20 hover:scale-105 transition-all active:scale-95"
              >
                Get Started Now
              </Link>
            </div>
            {/* Ambient Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-blue/20 blur-[120px] rounded-full" />
          </motion.div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default SitemapPage;
