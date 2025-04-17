import type { Metadata } from 'next';

const baseUrl = 'https://www.mondai-hatsugen.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: '政治家一覧 - 政治家を探す',
  description: '政治家を、名前、政党名、地域、議員種別などで絞り込みができます。政治家名のあいまい検索も可能です。',
  alternates: {
    canonical: '/politicians'
  },
  openGraph: {
    title: '政治家一覧 - 政治家を探す',
    description: '政治家を、名前、政党名、地域、議員種別などで絞り込みができます。政治家名のあいまい検索も可能です。',
    url: `${baseUrl}/politicians`,
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
    title: '政治家一覧 - 政治家を探す',
    description: '政治家を、名前、政党名、地域、議員種別などで絞り込みができます。政治家名のあいまい検索も可能です。',
    images: [`${baseUrl}/images/ogp-image.png`],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 