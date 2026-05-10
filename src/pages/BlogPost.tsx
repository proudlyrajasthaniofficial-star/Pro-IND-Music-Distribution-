import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">404</h1>
          <p className="text-slate-500 mb-8">This article has been declassified or moved.</p>
          <Link to="/blog" className="px-8 py-3 bg-brand-blue text-white rounded-full font-bold">Return to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={post.title}
        description={post.excerpt}
        type="article"
        image={post.image}
      />
      <PublicNavbar />

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand-blue origin-left z-[60]" 
        style={{ scaleX }} 
      />

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" /> Back to Intelligence Feed
          </Link>

          <header className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-full">
                  {post.category}
                </span>
                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {post.date}
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.95] mb-8">
                {post.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                   <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiMuf6SPER_hZb8y0rIp-8attT5vAKsBXyyNhofyZ1HZdYQ4Mrz0A_3VRjsib1uSPqMFuqELCBbP7A5Ql2nbWJwhTXhz588dOnSGiaPsj3EEMMs1kIRcUPIVuYRlosU95w19HLlxiFF6Zd3UNILWTkNVXlqpfDXwgCmCOg_9CLhclnre3Ody-cAR7n0VaU/s4096/1000166093.jpg" alt="SK Ji" className="w-full h-full object-cover" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-1">SK Ji</p>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Founder & Developer</p>
                </div>
              </div>
            </motion.div>
          </header>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-video rounded-[3rem] md:rounded-[4rem] overflow-hidden mb-20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-50 group"
          >
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none opacity-60" />
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-16">
            {/* Social Share Sticky */}
            <aside className="lg:col-span-1 hidden lg:block">
               <div className="sticky top-40 flex flex-col items-center gap-6">
                 {[
                   { icon: Share2, color: "text-slate-400" },
                   { icon: Facebook, color: "text-blue-600" },
                   { icon: Twitter, color: "text-sky-500" },
                   { icon: Linkedin, color: "text-blue-700" }
                 ].map((social, i) => (
                    <button key={i} className={`p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all ${social.color} hover:-translate-y-1`}>
                       <social.icon size={20} />
                    </button>
                 ))}
               </div>
            </aside>

            {/* Content Container */}
            <div className="lg:col-span-11">
              <article 
                className="prose prose-slate prose-lg max-w-none 
                  prose-h2:text-4xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:uppercase prose-h2:font-display prose-h2:mt-16
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-xl
                  prose-li:text-slate-600 prose-li:text-xl
                  prose-strong:text-slate-900 prose-strong:font-black"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="flex flex-wrap gap-3">
                    {['Music Distribution', 'India', 'Streaming', 'Artist Guide'].map(tag => (
                      <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full">{tag}</span>
                    ))}
                 </div>
                 <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Share Intelligence:</p>
                    <div className="flex gap-4">
                      <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all"><Share2 size={16} /></button>
                      <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all"><Twitter size={16} /></button>
                    </div>
                 </div>
              </div>

              {/* Author Bio Card */}
              <div className="mt-20 p-12 rounded-[4rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center gap-10">
                 <div className="w-32 h-32 rounded-[2rem] overflow-hidden shrink-0 shadow-xl">
                    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiMuf6SPER_hZb8y0rIp-8attT5vAKsBXyyNhofyZ1HZdYQ4Mrz0A_3VRjsib1uSPqMFuqELCBbP7A5Ql2nbWJwhTXhz588dOnSGiaPsj3EEMMs1kIRcUPIVuYRlosU95w19HLlxiFF6Zd3UNILWTkNVXlqpfDXwgCmCOg_9CLhclnre3Ody-cAR7n0VaU/s4096/1000166093.jpg" alt="SK Ji" className="w-full h-full object-cover" />
                 </div>
                 <div className="text-center md:text-left">
                    <h4 className="text-2xl font-black font-display tracking-tighter uppercase mb-2">Developed by SK Ji</h4>
                    <p className="text-slate-500 font-medium mb-6 leading-relaxed">The visionary behind IND Distribution. Building tech to empower artists across India and ensuring every note is heard globally.</p>
                    <Link to="/founder-developer" className="text-[10px] font-black uppercase tracking-widest text-brand-blue border-b-2 border-brand-blue/20 hover:border-brand-blue transition-all pb-1">Detailed Profile</Link>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Recommended Reading */}
      <section className="py-32 px-6 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-6xl font-black font-display tracking-tighter uppercase">Related <br /><span className="text-brand-blue">Intelligence</span></h2>
            <Link to="/blog" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue">View All</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2).map(post => (
              <Link to={`/blog/${post.slug}`} key={post.slug} className="group flex flex-col p-8 rounded-[3rem] bg-white border border-slate-100 hover:shadow-2xl transition-all">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-6 italic">{post.category}</p>
                <h3 className="text-2xl font-black font-display uppercase tracking-tight leading-tight group-hover:text-brand-blue transition-colors mb-4">{post.title}</h3>
                <p className="text-slate-500 text-sm mb-8">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-blue group-hover:translate-x-2 transition-transform">
                  Read Report <ArrowLeft size={16} className="rotate-180" />
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
