import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '問題発言のトピックス一覧 | 問題発言ドットコム',
  description: '問題発言のトピックス（タグ）一覧画面です。',
  alternates: {
    canonical: 'https://www.mondai-hatsugen.com/topics'
  },
  openGraph: {
    title: '問題発言のトピックス一覧 | 問題発言ドットコム',
    description: '問題発言のトピックス（タグ）一覧画面です。',
    url: 'https://www.mondai-hatsugen.com/topics',
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
    title: '問題発言のトピックス一覧 | 問題発言ドットコム',
    description: '問題発言のトピックス（タグ）一覧画面です。',
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