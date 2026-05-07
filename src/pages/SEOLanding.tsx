import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import { SEO_PAGES_CONTENT } from '../constants/seoContent';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { ArrowRight, Music, Zap, Globe, ShieldCheck, ChevronRight } from 'lucide-react';

const SEOLandingPage: React.FC = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const slug = (paramSlug || location.pathname.split('/').pop() || '') as keyof typeof SEO_PAGES_CONTENT;
  const pageContent = SEO_PAGES_CONTENT[slug];

  if (!pageContent) return <div className="text-center py-20">Page Not Found</div>;

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={pageContent.title}
        description={pageContent.description}
        keywords={pageContent.keywords.join(', ')}
        canonical={`https://musicdistributionindia.online/${slug}`}
      />
      <PublicNavbar />
      <main className="pt-32 px-6">
        <h1 className="text-6xl font-black uppercase text-center mb-10">{pageContent.h1}</h1>
        <article 
          className="prose lg:prose-xl mx-auto"
          dangerouslySetInnerHTML={{ __html: pageContent.content }} 
        />
      </main>
      <PublicFooter />
    </div>
  );
};
export default SEOLandingPage;
