import React from 'react';

interface ListItem {
  position: number;
  name: string;
  url: string;
  image: string;
}

interface ItemListJsonLdProps {
  items: ListItem[];
}

export default function ItemListJsonLd({ items }: ItemListJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
      image: {
        '@type': 'ImageObject',
        url: item.image,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 