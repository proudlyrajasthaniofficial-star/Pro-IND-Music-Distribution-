import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterHandle?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "IND Distribution | Global Music Distribution for Artists",
  description = "Distribute your music worldwide to 250+ platforms like Spotify, Apple Music, and Instagram. Get 24-hour approval, detailed analytics, and 100% royalty transparency with IND Distribution.",
  canonical = "https://ind-distribution.example.com",
  ogType = "website",
  ogImage = "https://picsum.photos/seed/music-distribution/1200/630",
  twitterHandle = "@INDDistribution"
}) => {
  const siteTitle = title.includes("IND Distribution") ? title : `${title} | IND Distribution`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="IND Distribution" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "IND Distribution",
          "url": "https://ind-distribution.example.com",
          "logo": "https://ind-distribution.example.com/logo.png",
          "sameAs": [
            "https://www.instagram.com/inddistribution",
            "https://www.youtube.com/inddistribution"
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
            "email": "musicdistributionindia.in@gmail.com"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
