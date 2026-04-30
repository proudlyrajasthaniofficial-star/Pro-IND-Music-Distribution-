import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { BLOG_POSTS } from '../constants/blogData';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { ArrowRight, Clock, User, ChevronRight } from 'lucide-react';

const BlogList = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Blog | Music Industry Insights & Distribution Tips"
        description="Stay ahead of the music industry with the latest tips on distribution, royalties, and marketing from IND Distribution."
      />
      <PublicNavbar />

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase mb-8">
                Industry <br />
                <span className="text-brand-blue">Intelligence</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Expert insights, tutorials, and strategy reports for the modern independent musician in India.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post, i) => (
              <motion.article 
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col bg-slate-50 rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-6 left-6">
                    <span className="px-5 py-2 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-brand-blue shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <div className="flex items-center gap-2">
                       <Clock size={12} /> {post.date}
                    </div>
                    <div className="flex items-center gap-2">
                       <User size={12} /> {post.author}
                    </div>
                  </div>

                  <h2 className="text-2xl font-black font-display tracking-tight uppercase mb-4 leading-tight group-hover:text-brand-blue transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-1">
                    {post.excerpt}
                  </p>

                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-blue group/link"
                  >
                    Read Intelligence Report <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="py-32 px-6 bg-[#020617] text-white">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black font-display tracking-tighter uppercase mb-8">
               Join the <span className="text-brand-blue">Elite Network</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
               Get monthly distribution strategies and industry data directly in your inbox. No spam, just intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
               <input 
                 type="email" 
                 placeholder="your@email.com" 
                 className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-brand-blue transition-all font-medium"
               />
               <button className="px-10 py-5 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-lg transition-all">
                  Subscribe
               </button>
            </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default BlogList;
