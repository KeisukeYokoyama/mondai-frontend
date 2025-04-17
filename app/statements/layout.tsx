import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '問題発言を探す',
  description: '政治家や言論人の問題発言を証拠付きで検索できます。発言日や政党、関連トピックスで絞り込みができます。',
  metadataBase: new URL('https://www.mondai-hatsugen.com'),
  alternates: {
    canonical: '/statements'
  },
  openGraph: {
    title: '問題発言を探す',
    description: '政治家や言論人の問題発言を証拠付きで検索できます。発言日や政党、関連トピックスで絞り込みができます。',
    url: 'https://www.mondai-hatsugen.com/statements',
    type: 'website',
    locale: 'ja_JP',
    siteName: '問題発言ドットコム',
    images: [
      {
        url: 'https://www.mondai-hatsugen.com/images/ogp-image.png',
        width: 1200,
        height: 630,
        alt: '問題発言ドットコム',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '問題発言を探す',
    description: '政治家や言論人の問題発言を証拠付きで検索できます。発言日や政党、関連トピックスで絞り込みができます。',
    images: ['https://www.mondai-hatsugen.com/images/ogp-image.png'],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 