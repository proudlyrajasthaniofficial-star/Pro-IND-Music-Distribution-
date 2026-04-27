import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { SEO_PAGES_CONTENT } from '../constants/seoContent';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { 
  ArrowRight, 
  CheckCircle2, 
  Music, 
  Zap, 
  Globe, 
  ShieldCheck, 
  ChevronRight, 
  Calendar,
  Layers,
  BarChart3,
  TrendingUp,
  XCircle,
  HelpCircle,
  Award
} from 'lucide-react';

const SEOLandingPage = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = window.location.pathname;
  const slug = paramSlug || location.split('/').pop() || '';
  const pageContent = SEO_PAGES_CONTENT[slug as keyof typeof SEO_PAGES_CONTENT];

  const faqSchema = useMemo(() => {
    if (!pageContent?.faqs) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": pageContent.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }, [pageContent]);

  if (!pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center group">
          <div className="mb-8 relative inline-block">
             <div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full scale-150 animate-pulse" />
             <h1 className="text-9xl font-display font-black tracking-tighter text-slate-100 relative z-10">404</h1>
          </div>
          <p className="text-xl text-slate-500 font-medium mb-12 max-w-sm mx-auto">This intelligence report is currently unavailable or has been archived.</p>
          <Link to="/" className="inline-flex items-center gap-3 px-8 py-4 bg-[#020617] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-blue transition-all group">
            Return to Command Center <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-blue/10 selection:text-brand-blue">
      <SEO 
        title={pageContent.title}
        description={pageContent.description}
        keywords={pageContent.keywords.join(', ')}
        schemas={faqSchema ? [faqSchema] : []}
      />
      <PublicNavbar />

      {/* Latest Update Banner */}
      <div className="fixed top-24 left-0 right-0 z-40 px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-brand-blue/10 backdrop-blur-md border border-brand-blue/20 px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-sm pointer-events-auto"
           >
             <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Latest Update: {currentDate}</span>
           </motion.div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-purple/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white mb-10 shadow-xl shadow-brand-blue/10">
              <Award className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Industry Standard // Official Intel</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tight leading-[0.88] uppercase mb-10 bg-clip-text text-transparent bg-linear-to-b from-slate-950 to-slate-600 drop-shadow-[0_0_25px_rgba(37,99,235,0.08)]">
              {pageContent.h1}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-14 leading-relaxed tracking-tight">
              {pageContent.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto px-10 py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/40 hover:-translate-y-1 transition-all">
                Start Distribution Now
              </Link>
              <a href="#comparison" className="w-full sm:w-auto px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                View Comparison
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section id="content" className="py-12 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16">
          {/* Article Side */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="prose prose-slate prose-lg max-w-none 
                prose-h2:text-4xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:uppercase prose-h2:font-display prose-h2:mt-24 prose-h2:mb-8
                prose-h3:text-2xl prose-h3:font-black prose-h3:tracking-tight prose-h3:mt-12 prose-h3:text-slate-800
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-8
                prose-li:text-slate-600 prose-li:text-lg
                prose-strong:text-slate-950 prose-strong:font-black
                prose-img:rounded-3xl prose-img:shadow-2xl"
              dangerouslySetInnerHTML={{ __html: pageContent.content }}
            />

            {/* Comparison Table Section */}
            <div id="comparison" className="mt-32 pt-24 border-t border-slate-100">
               <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-5xl font-black font-display tracking-tighter uppercase mb-6">Unrivaled <span className="text-brand-blue">Performance</span> Analysis</h2>
                 <p className="text-slate-500 font-medium max-w-2xl mx-auto">See how IND Distribution dominates the competition in technical infrastructure and artist payouts.</p>
               </div>

               <div className="overflow-hidden rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-8 text-[11px] font-black uppercase tracking-widest">Key Metries</th>
                        <th className="p-8 text-[11px] font-black uppercase tracking-widest text-brand-blue">IND Distribution</th>
                        <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Global Aggregators</th>
                        <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Local Agents</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {[
                        { feature: "Store Reach", ind: "250+ (Global + Regional)", global: "150+ (Global Only)", local: "50+ (Basic)" },
                        { feature: "Royalty Share", ind: "100% (Premium)", global: "70% - 90%", local: "50% - 85%" },
                        { feature: "Approval Speed", ind: "24 Hours Guaranteed", global: "4-7 Working Days", local: "Variable" },
                        { feature: "Content ID", ind: "Direct Integration", global: "Third Party", local: "Restricted" },
                        { feature: "Payment Gateway", ind: "UPI, Bank, Crypto", global: "PayPal / Wire (Expensive)", local: "Manual" }
                      ].map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="p-8 font-bold text-slate-800">{item.feature}</td>
                          <td className="p-8"><div className="flex items-center gap-2 text-brand-blue font-black animate-pulse"><CheckCircle2 className="w-5 h-5" /> {item.ind}</div></td>
                          <td className="p-8 text-slate-500 font-medium">{item.global}</td>
                          <td className="p-8 text-slate-500 font-medium">{item.local}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* FAQ Section */}
            {pageContent.faqs && pageContent.faqs.length > 0 && (
              <div id="faq" className="mt-32 pt-24 border-t border-slate-100">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black font-display tracking-tighter uppercase mb-6">Common inquiries</h2>
                    <p className="text-slate-500 font-medium">Resolving your technical and strategic doubts with absolute transparency.</p>
                  </div>
                  <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-6">
                  {pageContent.faqs.map((faq, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-brand-blue/30 transition-all group"
                    >
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-start gap-4">
                        <span className="text-brand-blue opacity-30 font-display text-2xl group-hover:opacity-100 transition-opacity">0{i+1}</span>
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 leading-relaxed pl-12 text-lg">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Linking Cloud */}
            <div className="mt-32 p-12 rounded-[4rem] bg-[#020617] text-white overflow-hidden relative group">
               <div className="relative z-10">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue mb-10">Strategic Network Map</h4>
                 <div className="flex flex-wrap gap-4">
                    {Object.entries(SEO_PAGES_CONTENT).filter(([k]) => k !== slug).map(([key, val]) => (
                      <Link 
                        key={key} 
                        to={`/${key}`} 
                        className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-brand-blue hover:border-brand-blue transition-all text-xs font-black uppercase tracking-widest"
                      >
                        {val.h1.split('–')[0].trim()}
                      </Link>
                    ))}
                    <Link to="/pricing" className="px-6 py-3 rounded-2xl bg-brand-blue border border-brand-blue text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                       Pricing Plans
                    </Link>
                    <Link to="/blog" className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                       Industry Blog
                    </Link>
                 </div>
               </div>
               <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8 pt-24">
            <div className="sticky top-32 space-y-8">
              {/* Promo Card */}
              <div className="p-10 rounded-[3.5rem] bg-brand-blue text-white overflow-hidden relative group">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-black font-display tracking-tighter uppercase mb-6 leading-[1.1]">Accelerate <br />Your Reach</h3>
                  <p className="text-white/80 text-sm font-medium mb-10 leading-relaxed uppercase tracking-widest">Integrating Creative Data with Global Metadata Mesh Since 2020.</p>
                  <Link to="/auth?mode=signup" className="flex items-center justify-center gap-3 w-full py-6 bg-white text-brand-blue rounded-2xl font-black uppercase tracking-widest text-[11px] group transition-all hover:shadow-2xl active:scale-95">
                    Start Now <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
                {/* Decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
              </div>

              {/* Latest Reports (Blog) */}
              <div className="p-10 rounded-[3.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden relative">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-4">
                    Latest Intel <div className="flex-1 h-[1px] bg-slate-100" />
                 </h4>
                 <div className="space-y-6">
                    {['Earn from Spotify', 'JioSaavn Marketing', 'Metadata Hacks'].map((topic, i) => (
                      <Link key={i} to="/blog" className="block group">
                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-2 italic">Report 0{i+1}</p>
                        <h5 className="font-black text-slate-800 group-hover:text-brand-blue transition-colors leading-[1.3] text-sm uppercase tracking-tight">{topic} (2026 Edition)</h5>
                      </Link>
                    ))}
                 </div>
              </div>

              {/* Trust badges */}
              <div className="p-8 text-center space-y-8 glass rounded-[3rem] border-white bg-slate-50/50">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Integrated Store Mesh</p>
                 <div className="flex flex-wrap justify-center gap-8 opacity-40">
                    {['spotify', 'apple', 'youtube', 'instagram', 'amazon', 'tiktok'].map(p => (
                      <img key={p} src={`https://www.google.com/s2/favicons?domain=${p}.com&sz=64`} alt={p} className="h-6 w-6 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                    ))}
                 </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Extreme CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-brand-blue/5 blur-[120px] rounded-full"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center bg-[#020617] text-white p-24 rounded-[5rem] relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(2,6,23,0.3)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center mx-auto mb-10 rotate-12 group-hover:rotate-[24deg] transition-transform duration-500 shadow-2xl shadow-brand-blue/40">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-8xl font-black font-display tracking-tight uppercase mb-8 leading-[0.9]">
              STOP <span className="text-brand-blue">WAITING</span>, START <br />RELEASING.
            </h2>
            <p className="text-xl text-slate-400 font-medium mb-16 max-w-2xl mx-auto leading-relaxed italic">
              "The most transparent distribution infrastructure developed for the Indian independent scene. Period."
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-12 py-7 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all hover:-translate-y-2 active:scale-95">
                Onboard Now <ArrowRight />
              </Link>
              <Link to="/contact" className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-12 py-7 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                Talk to Expert
              </Link>
            </div>
          </motion.div>
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 blur-[80px] rounded-full pointer-events-none"></div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default SEOLandingPage;
