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
  title = 'IND Distribution | #1 Music Distribution India | Release & Earn',
  description = 'India\'s fastest music distribution platform for independent artists. Distribute music to JioSaavn, Wynk, Spotify & more. Keep 100% royalties. ISRC & UPC included.',
  keywords = 'music distribution India, ISRC code India, UPC registration, JioSaavn distribution, Wynk music upload, Spotify for artists India, caller tune setup CRBT, music aggregation India, digital streaming platform distribution, independent artist royalties India, best music distributor India, register song for CRBT, music distribution india online, music distribution india aggregation',
  image = 'https://musicdistributionindia.online/og-image.jpg',
  url = 'https://musicdistributionindia.online',
  type = 'website',
  schema
}) => {
  const siteTitle = title.includes('IND Distribution') ? title : `${title} | IND Distribution`;

  return (
    <Helmet
      htmlAttributes={{ lang: 'en' }}
    >
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
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
