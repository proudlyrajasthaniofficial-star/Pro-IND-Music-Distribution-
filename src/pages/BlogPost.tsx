import React from 'react';
// Single BlogPost Detail Page - TuneIND Music
import { motion, useScroll, useSpring } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { BLOG_POSTS } from '../constants/blogData';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { ArrowLeft, Clock, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(p => p.slug === slug);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white font-sans">
        <div className="text-center px-4">
          <h1 className="text-6xl font-black mb-4 font-display text-brand-blue">404</h1>
          <p className="text-slate-400 mb-8 max-w-sm uppercase text-xs tracking-widest font-bold">This article has been declassified or moved.</p>
          <Link to="/blog" className="px-8 py-3.5 bg-brand-blue text-white rounded-xl text-xs uppercase tracking-widest font-black hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">Return to Blog</Link>
        </div>
      </div>
    );
  }

  // Generate automated structured schema for the Article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.excerpt,
    "image": [post.image],
    "datePublished": new Date().toISOString(), 
    "author": [{
        "@type": "Person",
        "name": post.author || "SK Ji",
        "url": "https://tuneindmusic.in/founder-developer"
    }]
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-brand-blue/20 overflow-x-hidden relative">
      <SEO 
        title={`${post.title} | TuneIND Intelligence`}
        description={post.excerpt}
        type="article"
        image={post.image}
        schema={articleSchema}
      />
      <PublicNavbar />

      {/* Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand-blue origin-left z-[60]" 
        style={{ scaleX }} 
      />

      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none opacity-10 z-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-brand-blue/30 blur-[130px] rounded-full"></div>
      </div>

      <main className="pt-40 pb-24 px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Back Action Trigger */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue transition-colors mb-10 md:mb-12">
            <ArrowLeft className="w-4 h-4" /> Back to Intelligence Feed
          </Link>

          <header className="mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <span className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-full border border-brand-blue/20">
                  {post.category}
                </span>
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {post.date}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-[1.0] mb-8">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4 border-t border-b border-white/5 py-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-sm shrink-0">
                   <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiMuf6SPER_hZb8y0rIp-8attT5vAKsBXyyNhofyZ1HZdYQ4Mrz0A_3VRjsib1uSPqMFuqELCBbP7A5Ql2nbWJwhTXhz588dOnSGiaPsj3EEMMs1kIRcUPIVuYRlosU95w19HLlxiFF6Zd3UNILWTkNVXlqpfDXwgCmCOg_9CLhclnre3Ody-cAR7n0VaU/s4096/1000166093.jpg" alt="SK Ji" className="w-full h-full object-cover" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none mb-1">SK Ji</p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Founder & Developer</p>
                </div>
              </div>
            </motion.div>
          </header>

          {/* Hero Showcase Image */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-16 border border-white/5 shadow-2xl group"
          >
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-102" 
            />
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Social Share Sticky sidebar */}
            <aside className="lg:col-span-1 hidden lg:block">
               <div className="sticky top-40 flex flex-col items-center gap-4">
                 {[
                   { icon: Share2, color: "text-slate-400" },
                   { icon: Facebook, color: "text-blue-500" },
                   { icon: Twitter, color: "text-sky-400" },
                   { icon: Linkedin, color: "text-blue-400" }
                 ].map((social, i) => (
                    <button key={i} aria-label="Share Post" className={`p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all ${social.color} hover:-translate-y-0.5`}>
                       <social.icon size={16} />
                    </button>
                 ))}
               </div>
            </aside>

            {/* HTML Article Content Container */}
            <div className="lg:col-span-11">
              <article 
                className="prose prose-invert prose-slate max-w-none 
                  prose-h2:text-2xl md:prose-h2:text-4xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:uppercase prose-h2:font-display prose-h2:mt-12 prose-h2:text-brand-blue
                  prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg prose-p:mb-6
                  prose-li:text-slate-300 prose-li:text-base md:prose-li:text-lg
                  prose-strong:text-white prose-strong:font-black prose-strong:bg-brand-blue/10 prose-strong:px-1 prose-strong:rounded"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                 <div className="flex flex-wrap gap-2">
                    {['Distribution', 'India', 'Streaming', 'Artist Guide'].map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-lg">{tag}</span>
                    ))}
                 </div>
                 <div className="flex items-center gap-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Share Info:</p>
                    <div className="flex gap-2">
                      <button aria-label="Share Content" className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all"><Share2 size={14} /></button>
                      <button aria-label="Share on Twitter" className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all"><Twitter size={14} /></button>
                    </div>
                 </div>
              </div>

              {/* Founder Profile Bio Card */}
              <div className="mt-16 p-6 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden">
                 <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10">
                    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiMuf6SPER_hZb8y0rIp-8attT5vAKsBXyyNhofyZ1HZdYQ4Mrz0A_3VRjsib1uSPqMFuqELCBbP7A5Ql2nbWJwhTXhz588dOnSGiaPsj3EEMMs1kIRcUPIVuYRlosU95w19HLlxiFF6Zd3UNILWTkNVXlqpfDXwgCmCOg_9CLhclnre3Ody-cAR7n0VaU/s4096/1000166093.jpg" alt="SK Ji" className="w-full h-full object-cover" />
                 </div>
                 <div className="text-center md:text-left relative z-10">
                    <h4 className="text-xl font-black font-display tracking-tighter uppercase mb-2 text-white">Developed by SK Ji</h4>
                    <p className="text-slate-400 text-xs md:text-sm font-normal mb-4 leading-relaxed">The visionary tech lead behind TuneIND Music. Crafting secure, enterprise-grade architecture to empower independent artists across India.</p>
                    <Link to="/founder-developer" className="text-[9px] font-black uppercase tracking-widest text-brand-blue border-b border-brand-blue/20 hover:border-brand-blue transition-all pb-0.5">Detailed Profile</Link>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Recommended Articles Loop */}
      <section className="py-24 px-4 md:px-6 bg-slate-950/60 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-2xl md:text-4xl font-black font-display tracking-tighter uppercase">Related <br /><span className="text-brand-blue">Intelligence</span></h2>
            <Link to="/blog" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-blue transition-colors">View All</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {BLOG_POSTS && BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2).map(post => (
              <Link to={`/blog/${post.slug}`} key={post.slug} className="group flex flex-col p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-4 italic">{post.category}</p>
                <h3 className="text-lg md:text-xl font-black font-display uppercase tracking-tight leading-tight group-hover:text-brand-blue transition-colors mb-3">{post.title}</h3>
                <p className="text-slate-400 text-xs md:text-sm mb-6 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-blue group-hover:translate-x-1.5 transition-transform">
                  Read Report <ArrowLeft size={12} className="rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default BlogPost;
