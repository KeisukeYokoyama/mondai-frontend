import React from 'react';

interface ArticleJsonLdProps {
  headline: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  description: string;
  url: string;
}

export default function ArticleJsonLd({
  headline,
  image,
  datePublished,
  dateModified,
  authorName,
  description,
  url,
}: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    image,
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: '問題発言ドットコム',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.mondai-hatsugen.com/images/Logo.svg'
      }
    },
    description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 