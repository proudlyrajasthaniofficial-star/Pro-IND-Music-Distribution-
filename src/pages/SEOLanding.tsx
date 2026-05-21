import React from 'react';
// SEO Landing Page - TuneIND Music
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { SEO_PAGES_CONTENT } from '../constants/seoContent';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { ArrowRight, Music, Zap, Globe, ShieldCheck } from 'lucide-react';

const SEOLandingPage = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = window.location.pathname;
  const slug = paramSlug || location.split('/').pop() || '';
  const pageContent = SEO_PAGES_CONTENT[slug as keyof typeof SEO_PAGES_CONTENT];

  if (!pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white font-sans">
        <div className="text-center group px-4">
          <div className="mb-6 relative inline-block">
             <div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full scale-150 animate-pulse" />
             <h1 className="text-8xl md:text-9xl font-display font-black tracking-tighter text-slate-800 relative z-10">404</h1>
          </div>
          <p className="text-sm md:text-base text-slate-400 font-bold uppercase tracking-widest mb-10 max-w-sm mx-auto">
            This intelligence report is currently unavailable or has been archived.
          </p>
          <Link to="/" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all group">
            Return to Command Center <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // Automated LocalBusiness & Product Schema for better indexing on SEO pages
  const seoPageSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": pageContent.h1,
    "description": pageContent.description,
    "provider": {
      "@type": "Organization",
      "name": "TuneIND Music",
      "url": "https://tuneindmusic.in"
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-brand-blue/20 overflow-x-hidden relative">
      <SEO 
        title={`${pageContent.title} | TuneIND`}
        description={pageContent.description}
        keywords={pageContent.keywords.join(', ')}
        schema={seoPageSchema}
      />
      <PublicNavbar />

      {/* Decorative Background Ambient Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-blue/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full"></div>
      </div>

      {/* Hero Header Area */}
      <section className="pt-40 pb-16 px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-8">
              <Zap className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-blue">Strategic Engine // Vol. 2026</span>
            </div>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-[0.95] uppercase mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              {pageContent.h1}
            </h1>
            <p className="text-sm md:text-xl text-slate-400 font-medium max-w-3xl mx-auto mb-10 leading-relaxed tracking-tight">
              {pageContent.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm sm:max-w-none mx-auto">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto px-8 py-4 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all text-center">
                Start Distribution Now
              </Link>
              <a href="#content" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all text-center">
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Structural Content Grid */}
      <section id="content" className="py-16 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Article Side */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="prose prose-invert prose-slate max-w-none 
                prose-h2:text-2xl md:prose-h2:text-4xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:uppercase prose-h2:font-display prose-h2:mt-12 prose-h2:text-brand-blue
                prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-black prose-h3:tracking-tight prose-h3:mt-8 prose-h3:text-white
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg prose-p:mb-6
                prose-li:text-slate-300 prose-li:text-base md:prose-li:text-lg
                prose-strong:text-white prose-strong:font-black prose-strong:bg-brand-blue/10 prose-strong:px-1 prose-strong:rounded"
              dangerouslySetInnerHTML={{ __html: pageContent.content }}
            />

            {/* Frequently Asked Questions Integration */}
            {pageContent.faqs && pageContent.faqs.length > 0 && (
              <div className="mt-20 pt-16 border-t border-white/5">
                <h2 className="text-2xl md:text-4xl font-black font-display tracking-tighter uppercase mb-10">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {pageContent.faqs.map((faq, i) => (
                    <div key={i} className="p-6 md:p-8 rounded-[2rem] bg-white/[0.01] border border-white/5">
                      <h3 className="text-base md:text-lg font-black text-white mb-3">{faq.question}</h3>
                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Micro-Stats Dashboard Indicators */}
            <div className="grid sm:grid-cols-3 gap-4 md:gap-6 mt-16">
              {[
                { label: "Stores Connected", val: "250+", icon: Globe, color: "text-brand-blue" },
                { label: "Speed Approval", val: "24hrs", icon: Zap, color: "text-amber-400" },
                { label: "Artist Payout", val: "100%", icon: ShieldCheck, color: "text-emerald-400" }
              ].map((stat, i) => (
                <div key={i} className="p-6 md:p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group">
                   <div className={`p-3.5 rounded-xl bg-white/5 border border-white/5 inline-block mb-6 group-hover:scale-105 transition-transform ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                   </div>
                   <p className="text-3xl md:text-4xl font-black font-display tracking-tighter mb-1 text-white">{stat.val}</p>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Conversion Sidebar */}
          <aside className="lg:col-span-4 space-y-6 md:space-y-8">
            <div className="sticky top-32 space-y-6 md:space-y-8">
              
              {/* Core Conversion Panel */}
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-slate-950/60 border border-white/5 overflow-hidden relative backdrop-blur-3xl">
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    <Music className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-black font-display tracking-tighter uppercase mb-3 leading-tight">Elite Music Distribution</h3>
                  <p className="text-slate-400 text-xs font-normal mb-8 leading-relaxed">Join the system trusted by India's fastest growing independent talent pools and creators.</p>
                  <Link to="/auth?mode=signup" className="flex items-center justify-center gap-2 w-full py-4 bg-brand-blue text-white rounded-xl font-black uppercase tracking-widest text-[9px] group transition-all hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-98">
                    Upload Your Track <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 blur-3xl rounded-full"></div>
              </div>

              {/* Dynamic Related Knowledge Loops */}
              <div className="p-8 md:p-10 rounded-[2.5rem] border border-white/5 bg-slate-950/20 backdrop-blur-3xl">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-4">
                   Knowledge Loops <div className="flex-1 h-[1px] bg-white/5" />
                </h4>
                <div className="space-y-2">
                  {SEO_PAGES_CONTENT && Object.entries(SEO_PAGES_CONTENT).map(([key, val]) => (
                    <Link 
                      key={key} 
                      to={`/${key}`} 
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-xs font-bold group border border-transparent hover:border-white/5"
                    >
                      <span className="text-slate-400 group-hover:text-brand-blue transition-colors truncate max-w-[90%]">{val.title.split('|')[0]}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trust Ecosystem Indicators */}
              <div className="p-6 text-center space-y-4">
                 <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">Integrated Ecosystem</p>
                 <div className="flex flex-wrap justify-center gap-5 opacity-20 hover:opacity-40 transition-opacity">
                    {['spotify', 'apple', 'youtube', 'instagram'].map(p => (
                      <img key={p} src={`https://www.google.com/s2/favicons?domain=${p}.com&sz=64`} alt={p} className="h-4 w-4 grayscale" />
                    ))}
                 </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Modern High-End Trust CTA Panel */}
      <section className="py-20 px-4 md:px-6 border-t border-white/5 bg-slate-950/40 relative">
        <div className="max-w-5xl mx-auto text-center p-8 md:p-16 rounded-[3rem] bg-white/[0.01] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-blue/5 blur-[120px] rounded-full -z-10"></div>
          <h2 className="text-2xl md:text-5xl font-black font-display tracking-tighter uppercase mb-4 leading-none">
            Ready to <span className="text-brand-blue">Dominate</span> the Industry?
          </h2>
          <p className="text-slate-400 text-xs md:text-base font-normal mb-8 max-w-xl mx-auto italic leading-relaxed">
            "TuneIND Distribution gave us the transparency we needed to scale our labels with pristine analytics." — Team TuneIND Creators
          </p>
          <Link to="/auth?mode=signup" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-98">
            Get Started Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default SEOLandingPage;

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
