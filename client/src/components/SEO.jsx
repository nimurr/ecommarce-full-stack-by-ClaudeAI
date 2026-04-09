import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  article = null,
  product = null,
  breadcrumbs = []
}) => {
  const siteName = 'Gadgets Lagbe';
  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
  const defaultImage = '/og-image.jpg';
  const defaultDescription = 'Shop the latest electronics, smartphones, laptops, headphones, and gadgets at unbeatable prices. Free shipping on orders over ৳1000. Fast delivery across Bangladesh.';
  const defaultKeywords = 'electronics, smartphones, laptops, headphones, gadgets, online shopping Bangladesh, best electronics store, mobile phones, computers, audio devices';

  const seoTitle = title ? `${title} | ${siteName}` : `${siteName} - Best Electronics & Gadgets Store in Bangladesh`;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image || defaultImage;
  const seoUrl = url ? `${siteUrl}${url}` : siteUrl;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : type === 'product' ? 'Product' : 'WebSite',
    name: seoTitle,
    description: seoDescription,
    url: seoUrl,
    image: seoImage.startsWith('http') ? seoImage : `${siteUrl}${seoImage}`,
  };

  // Add product schema
  if (product) {
    jsonLd['@type'] = 'Product';
    jsonLd.name = product.name;
    jsonLd.description = product.description || seoDescription;
    jsonLd.image = product.image?.startsWith('http') ? product.image : `${siteUrl}${product.image}`;
    jsonLd.brand = {
      '@type': 'Brand',
      name: product.brand || siteName,
    };
    jsonLd.offers = {
      '@type': 'Offer',
      url: seoUrl,
      priceCurrency: 'BDT',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: siteName,
      },
    };
    if (product.rating) {
      jsonLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      };
    }
  }

  // Add article schema
  if (article) {
    jsonLd['@type'] = 'Article';
    jsonLd.headline = article.title;
    jsonLd.datePublished = article.datePublished;
    jsonLd.dateModified = article.dateModified;
    jsonLd.author = {
      '@type': 'Person',
      name: article.author || siteName,
    };
  }

  // Breadcrumbs schema
  const breadcrumbsSchema = breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.url}`,
    })),
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={siteName} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'article' ? 'article' : type === 'product' ? 'product' : 'website'} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage.startsWith('http') ? seoImage : `${siteUrl}${seoImage}`} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      {type === 'article' && article && (
        <>
          <meta property="article:published_time" content={article.datePublished} />
          <meta property="article:modified_time" content={article.dateModified} />
          <meta property="article:author" content={article.author} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage.startsWith('http') ? seoImage : `${siteUrl}${seoImage}`} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Geo Tags for Bangladesh */}
      <meta name="geo.region" content="BD" />
      <meta name="geo.placename" content="Bangladesh" />
      <meta name="geo.position" content="23.8103;90.4125" />
      <meta name="ICBM" content="23.8103, 90.4125" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      {breadcrumbsSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbsSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
