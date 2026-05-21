import React, { useState } from 'react';
// BlogList Page - TuneIND Music
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { BLOG_POSTS } from '../constants/blogData';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { ArrowRight, Clock, User, CheckCircle2 } from 'lucide-react';

const BlogList = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  // Blog list specific structured data for better Google Indexing
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "TuneIND Music Industry Intelligence Blog",
    "description": "Expert insights, tutorials, and strategy reports for independent musicians in India.",
    "publisher": {
      "@type": "Organization",
      "name": "TuneIND Music",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tuneindmusic.in/logo.png"
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-brand-blue/20 overflow-x-hidden relative">
      <SEO 
        title="Music Industry Insights & Distribution Tips | TuneIND Blog"
        description="Stay ahead of the Indian music industry with the latest premium tutorials on digital music distribution, copyright claims, and streaming royalties."
        schema={blogListSchema}
      />
      <PublicNavbar />

      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-blue/30 blur-[150px] rounded-full"></div>
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-600/20 blur-[130px] rounded-full"></div>
      </div>

      <main className="pt-40 pb-24 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-brand-blue font-black uppercase tracking-[0.3em] text-[10px] mb-4 block italic">Knowledge Portal</span>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter uppercase mb-6 leading-none">
                Industry <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue via-indigo-400 to-purple-500">Intelligence</span>
              </h1>
              <p className="text-sm md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                Expert insights, growth strategies, and technical guides designed carefully for the modern independent musician in India.
              </p>
            </motion.div>
          </div>

          {/* Blog Grid Area */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {BLOG_POSTS && BLOG_POSTS.map((post, i) => (
              <motion.article 
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.5 }}
                className="group flex flex-col bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1.5"
              >
                {/* Featured Image wrapper */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4 md:top-6 md:left-6">
                    <span className="px-4 py-1.5 bg-[#020617]/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-brand-blue border border-white/10 shadow-lg">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                {/* Content Details */}
                <div className="p-6 md:p-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 md:gap-6 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    <div className="flex items-center gap-1.5">
                       <Clock size={11} className="text-brand-blue" /> {post.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                       <User size={11} className="text-slate-600" /> {post.author}
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-black font-display tracking-tight uppercase mb-3 leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-8 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue group/link mt-auto hover:text-white transition-colors"
                  >
                    Read Intelligence Report <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="py-24 px-4 md:px-6 bg-slate-950/60 border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-blue/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black font-display tracking-tighter uppercase mb-4">
               Join the <span className="text-brand-blue">Elite Network</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base mb-8 max-w-md mx-auto">
               Get monthly music distribution hacks, copyright guidelines, and organic streaming strategies directly inside your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
               <input 
                 type="email" 
                 placeholder="Enter email for strategy updates" 
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="flex-1 px-5 py-3.5 md:py-4 bg-[#020617] border border-white/10 rounded-xl outline-none focus:border-brand-blue transition-all font-bold text-xs text-white placeholder:text-slate-600 uppercase tracking-wider"
               />
               <button 
                 type="submit"
                 className="px-6 py-3.5 md:py-4 bg-brand-blue text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                  {subscribed ? (
                    <>
                      Subscribed <CheckCircle2 size={12} />
                    </>
                  ) : "Subscribe"}
               </button>
            </form>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default BlogList;
