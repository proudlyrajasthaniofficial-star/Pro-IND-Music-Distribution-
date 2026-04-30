import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'IND Distribution | Elite Music Distribution for Indian Artists',
  description = 'Distribute your music to Spotify, Apple Music, YouTube and 150+ stores. Keep 100% of your rights. Scale your music career with elite-tier technology.',
  keywords = 'music distribution, indian artists, spotify distribution, youtube content id, music marketing india, digital distribution',
  image = 'https://musicdistributionindia.in/og-image.jpg',
  url = 'https://musicdistributionindia.in',
  type = 'website',
  schema
}) => {
  const siteTitle = title.includes('IND Distribution') ? title : `${title} | IND Distribution`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="IND Distribution" />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Canonical Link */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
