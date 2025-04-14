import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | 問題発言ドットコム',
    default: '問題発言ドットコム',
  },
  description: '政治家の暴言やデマ、言行不一致などのスクショを登録して、過去の問題発言を検索できるサービスです。',
  alternates: {
    canonical: 'https://www.mondai-hatsugen.com',
  },
  openGraph: {
    title: '問題発言ドットコム',
    description: '政治家の暴言やデマ、言行不一致などのスクショを登録して、過去の問題発言を検索できるサービスです。',
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
    title: '問題発言ドットコム',
    description: '政治家の暴言やデマ、言行不一致などのスクショを登録して、過去の問題発言を検索できるサービスです。',
    images: ['https://www.mondai-hatsugen.com/images/ogp-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
