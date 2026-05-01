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
  description = 'Start your Indian Music Distribution journey today. Release songs on Gaana & JioSaavn for free. Keep 100% royalties and upload unlimited music. Start now!',
  keywords = 'music distribution India, free music distribution India, how to release song in India, Indian music distribution platform, free gaana release India, JioSaavn song release process, Spotify earnings India, upload song on Spotify India, caller tune release India, best music distributor India, release song online India, music distribution for independent artists India, cheap music distribution India, Wynk music upload India, Apple Music India distribution, gaana app song upload, earn money from music India, independent artist India music release, digital music distribution India, music release service India, musicdistributionindia, Musicdistributionindia.in, Music-Distribution-India, musicdistributionindia.com, musicdistributionindia.online',
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
