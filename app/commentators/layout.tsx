import type { Metadata } from 'next';

const baseUrl = 'https://www.mondai-hatsugen.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: '言論人一覧 - 言論人を探す | 問題発言ドットコム',
  description: '政治家以外の言論人（ジャーナリスト、学者・専門家、評論家・言論人など）一覧。名前で検索が可能です。',
  alternates: {
    canonical: '/commentators'
  },
  openGraph: {
    title: '言論人一覧 - 言論人を探す | 問題発言ドットコム',
    description: '政治家以外の言論人（ジャーナリスト、学者・専門家、評論家・言論人など）一覧。名前で検索が可能です。',
    url: `${baseUrl}/commentators`,
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
    title: '言論人一覧 - 言論人を探す | 問題発言ドットコム',
    description: '政治家以外の言論人（ジャーナリスト、学者・専門家、評論家・言論人など）一覧。名前で検索が可能です。',
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