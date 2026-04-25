import React from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { SEO_PAGES_CONTENT } from '../constants/seoContent';
import PublicNavbar from '../components/PublicNavbar';
import { ArrowRight, CheckCircle2, Music, Zap, Globe, ShieldCheck } from 'lucide-react';

const SEOLandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const pageContent = SEO_PAGES_CONTENT[slug as keyof typeof SEO_PAGES_CONTENT];

  if (!pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">404</h1>
          <p className="text-slate-500 mb-8">This intelligence report is currently unavailable.</p>
          <Link to="/" className="px-8 py-3 bg-brand-blue text-white rounded-full font-bold">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-blue/10 selection:text-brand-blue">
      <SEO 
        title={pageContent.title}
        description={pageContent.description}
        keywords={pageContent.keywords.join(', ')}
      />
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-purple/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-8">
              <Zap className="w-3.5 h-3.5 text-brand-blue" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Premier Insights // 2026</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter leading-[0.9] uppercase mb-8">
              {pageContent.h1}
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              {pageContent.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto px-10 py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 transition-all">
                Start Distribution Now
              </Link>
              <a href="#content" className="w-full sm:w-auto px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section id="content" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16">
          {/* Article Side */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="prose prose-slate prose-lg max-w-none 
                prose-h2:text-4xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:uppercase prose-h2:font-display prose-h2:mt-16
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
                prose-li:text-slate-600 prose-li:text-lg
                prose-strong:text-slate-900 prose-strong:font-black"
              dangerouslySetInnerHTML={{ __html: pageContent.content }}
            />

            {/* Quick Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-6 mt-20">
              {[
                { label: "Stores", val: "250+", icon: Globe, color: "text-brand-blue" },
                { label: "Approval", val: "24hrs", icon: Zap, color: "text-amber-500" },
                { label: "Royalty", val: "100%", icon: ShieldCheck, color: "text-emerald-500" }
              ].map((stat, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all group">
                   <div className={`p-4 rounded-2xl bg-white shadow-sm inline-block mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <p className="text-4xl font-black font-display tracking-tighter mb-1">{stat.val}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">
              {/* Promo Card */}
              <div className="p-10 rounded-[3.5rem] bg-[#020617] text-white overflow-hidden relative">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center mb-8 rotate-12">
                    <Music className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-black font-display tracking-tighter uppercase mb-4 leading-[1.1]">Elite Music Distribution</h3>
                  <p className="text-slate-400 text-sm font-medium mb-8">Join the platform trusted by India's fastest growing independent artists.</p>
                  <Link to="/auth?mode=signup" className="flex items-center justify-center gap-3 w-full py-5 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] group transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                    Upload Your Song <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
                {/* Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-3xl rounded-full"></div>
              </div>

              {/* Related Links */}
              <div className="p-10 rounded-[3.5rem] border border-slate-100 bg-white shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-4">
                   Knowledge Base <div className="flex-1 h-[1px] bg-slate-100" />
                </h4>
                <div className="space-y-4">
                  {Object.entries(SEO_PAGES_CONTENT).map(([key, val]) => (
                    <Link 
                      key={key} 
                      to={`/${key}`} 
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all text-sm font-bold group"
                    >
                      <span className="group-hover:text-brand-blue transition-colors">{val.title.split('|')[0]}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trust badges */}
              <div className="p-8 text-center space-y-6">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Integrated Ecosystem</p>
                 <div className="flex flex-wrap justify-center gap-6 opacity-30">
                    {['spotify', 'apple', 'youtube', 'instagram'].map(p => (
                      <img key={p} src={`https://www.google.com/s2/favicons?domain=${p}.com&sz=64`} alt={p} className="h-6 w-6 grayscale" />
                    ))}
                 </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-32 px-6 bg-slate-50 mt-20">
        <div className="max-w-5xl mx-auto text-center glass p-20 rounded-[5rem] bg-white border-white">
          <h2 className="text-4xl md:text-6xl font-black font-display tracking-tighter uppercase mb-6">
            Ready to <span className="text-brand-blue">Dominate</span> the Industry?
          </h2>
          <p className="text-lg text-slate-500 font-medium mb-12 max-w-2xl mx-auto italic">
            "IND Distribution gave me the transparency I needed to build my label. The Indian-specific tools were a game changer." — Punjab Records
          </p>
          <Link to="/auth?mode=signup" className="inline-flex items-center gap-4 px-12 py-6 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all hover:-translate-y-1">
            Get Started Free <ArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-20 px-8 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                 <Music className="text-white w-4 h-4" />
              </div>
              <span className="font-display font-black text-xl tracking-tighter uppercase">IND Distribution</span>
           </div>
           <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Link to="/terms" className="hover:text-brand-blue">Terms</Link>
              <Link to="/refunds" className="hover:text-brand-blue">Refunds</Link>
              <Link to="/contact" className="hover:text-brand-blue">Support</Link>
              <a href="/sitemap.xml" className="hover:text-brand-blue">Sitemap</a>
           </div>
           <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              © 2026 // ALL_RIGHTS_RESERVED
           </div>
        </div>
      </footer>
    </div>
  );
};

export default SEOLandingPage;

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
