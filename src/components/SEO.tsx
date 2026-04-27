import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterHandle?: string;
  metaRobots?: string;
  schemas?: any[];
}

const SEO: React.FC<SEOProps> = ({
  title = "IND Distribution | Global Music Distribution for Artists",
  description = "Distribute your music worldwide to 250+ platforms like Spotify, Apple Music, and Instagram. Get 24-hour approval, detailed analytics, and 100% royalty transparency with IND Distribution.",
  keywords = "music distribution, release song, spotify india, jiosaavn distribution, indian music platform",
  canonical,
  ogType = "website",
  ogImage = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj8j4F7S_6_8_t5g_fX_U_p_1_0_0_0_s_1_2_0_0_6_3_0_1_2_0_0_6_3_0/s1200/music_distribution_india_og.jpg",
  twitterHandle = "@INDDistribution",
  metaRobots = "index, follow",
  schemas = []
}) => {
  const currentUrl = canonical || `https://musicdistributionindia.online${window.location.pathname}`;
  const siteTitle = title.includes("IND Distribution") ? title : `${title} | IND Distribution`;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IND Distribution",
    "alternateName": "Music Distribution India",
    "url": "https://musicdistributionindia.online",
    "logo": "https://musicdistributionindia.online/logo.png",
    "sameAs": [
      "https://www.instagram.com/inddistribution",
      "https://www.youtube.com/inddistribution",
      "https://twitter.com/INDDistribution"
    ],
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "India",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7742789827",
      "contactType": "customer service",
      "email": "musicdistributionindia.in@gmail.com",
      "availableLanguage": ["English", "Hindi"]
    }
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />
      <meta name="robots" content={metaRobots} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="IND Distribution" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify(defaultSchema)}
      </script>
      
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
