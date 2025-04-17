import type { Metadata } from 'next';

const baseUrl = 'https://www.mondai-hatsugen.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: '政党一覧 - 政党を探す',
  description: '政党名や代表者名から政党を検索できます。検索条件を入れなければ政党の一覧を確認することができます。',
  alternates: {
    canonical: '/parties'
  },
  openGraph: {
    title: '政党一覧 - 政党を探す',
    description: '政党名や代表者名から政党を検索できます。検索条件を入れなければ政党の一覧を確認することができます。',
    url: `${baseUrl}/parties`,
    type: 'website',
    locale: 'ja_JP',
    siteName: '問題発言ドットコム',
    images: [
      {
        url: `${baseUrl}/images/ogp-image.png`,
        width: 1200,
        height: 630,
        alt: '問題発言ドットコム',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '政党一覧 - 政党を探す',
    description: '政党名や代表者名から政党を検索できます。検索条件を入れなければ政党の一覧を確認することができます。',
    images: [`${baseUrl}/images/ogp-image.png`],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  );
} 