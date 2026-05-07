import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import { SEO_PAGES_CONTENT } from '../constants/seoContent';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { ArrowRight, Music, Zap, Globe, ShieldCheck, ChevronRight } from 'lucide-react';

// SEO Content ki type define karna (Agar aapne constants file mein nahi ki hai)
type SEOContentKey = keyof typeof SEO_PAGES_CONTENT;

const SEOLandingPage: React.FC = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  
  // URL se slug nikalna aur type cast karna
  const slug = (paramSlug || location.pathname.split('/').pop() || '') as SEOContentKey;
  const pageContent = SEO_PAGES_CONTENT[slug];

  // Canonical URL for SEO
  const canonicalUrl = `https://musicdistributionindia.online/${slug}`;

  if (!pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center group">
          <div className="mb-8 relative inline-block">
             <div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full scale-150 animate-pulse" />
             <h1 className="text-9xl font-display font-black tracking-tighter text-slate-100 relative z-10">404</h1>
          </div>
          <p className="text-xl text-slate-500 font-medium mb-12 max-w-sm mx-auto">
            This strategic report is currently unavailable.
          </p>
          <Link to="/" className="inline-flex items-center gap-3 px-8 py-4 bg-[#020617] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-blue transition-all group">
            Return to Command Center <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // Google Search Console/SEO ke liye JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": pageContent.h1,
    "description": pageContent.description,
    "image": "https://musicdistributionindia.online/og-image.jpg", // Change to your actual OG image
    "author": { "@type": "Organization", "name": "Music Distribution India" },
    "publisher": { "@type": "Organization", "name": "Music Distribution India" },
    ...(pageContent.faqs && {
      "mainEntity": pageContent.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
      }))
    })
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-blue/10 selection:text-brand-blue">
      <SEO 
        title={pageContent.title}
        description={pageContent.description}
        keywords={pageContent.keywords.join(', ')}
        // @ts-ignore (Agar aapka SEO component canonical accept karta hai toh)
        canonical={canonicalUrl}
      />
      
      {/* Schema Injection */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <PublicNavbar />

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/5 border border-brand-blue/10 mb-10">
              <Zap className="w-3.5 h-3.5 text-brand-blue" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60">Strategic Insights // 2026</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tight leading-[0.88] uppercase mb-10 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-500">
              {pageContent.h1}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-14 leading-relaxed">
              {pageContent.description}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Content Section */}
      <main id="content" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16">
          <article className="lg:col-span-8">
            {/* Main Article Body */}
            <div 
              className="prose prose-slate prose-lg max-w-none 
                prose-h2:text-4xl prose-h2:font-black prose-h2:uppercase prose-h2:font-display 
                prose-p:text-slate-600 prose-p:leading-relaxed 
                prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: pageContent.content }}
            />

            {/* FAQs for SEO */}
            {pageContent.faqs && (
              <section className="mt-24 pt-24 border-t border-slate-100">
                <h2 className="text-4xl font-black font-display tracking-tighter uppercase mb-12">Common Questions</h2>
                <div className="space-y-6">
                  {pageContent.faqs.map((faq, i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                      <h3 className="text-xl font-black text-slate-900 mb-4">{faq.question}</h3>
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Distribution CTA */}
              <div className="p-10 rounded-[3.5rem] bg-[#020617] text-white relative overflow-hidden">
                <div className="relative z-10">
                  <Music className="w-12 h-12 text-brand-blue mb-6" />
                  <h3 className="text-3xl font-black font-display uppercase mb-4">Start Releasing</h3>
                  <p className="text-slate-400 text-sm mb-8">Get your music on Spotify, Apple Music, and Instagram today.</p>
                  <Link to="/auth?mode=signup" className="flex items-center justify-center gap-3 w-full py-5 bg-brand-blue text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
                    Submit Music <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Related SEO Links */}
              <nav className="p-10 rounded-[3.5rem] border border-slate-100 bg-white">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Explore Topics</p>
                <div className="space-y-4">
                  {(Object.keys(SEO_PAGES_CONTENT) as SEOContentKey[]).map((key) => (
                    <Link 
                      key={key} 
                      to={`/${key}`} 
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group"
                    >
                      <span className="text-sm font-bold group-hover:text-brand-blue transition-colors">
                        {SEO_PAGES_CONTENT[key].title.split('|')[0]}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue" />
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default SEOLandingPage;
