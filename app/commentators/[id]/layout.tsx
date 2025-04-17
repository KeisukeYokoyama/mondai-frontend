import type { Metadata } from 'next'
import { commentatorAPI } from '@/utils/supabase/commentators';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getCommentatorData(id: string) {
  const { data: commentator } = await commentatorAPI.getDetail(id);
  return commentator;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const commentator = await getCommentatorData(resolvedParams.id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mondai-hatsugen.com';
  const currentUrl = `${baseUrl}/commentators/${resolvedParams.id}`;
  
  const title = commentator ? `${commentator.last_name}${commentator.first_name}の発言 | 問題発言ドットコム` : '問題発言ドットコム';
  const description = commentator ? `${commentator.last_name}${commentator.first_name}の発言やデマ、嘘、問題行動などの証拠スクショ一覧です。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。';
  
  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/commentators/${resolvedParams.id}`
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
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
      title,
      description,
      images: [`${baseUrl}/images/ogp-image.png`],
    },
  }
}

export default async function Layout({
  params,
  children,
}: Props) {
  const resolvedParams = await params;
  const commentator = await getCommentatorData(resolvedParams.id);
  const commentatorName = commentator ? `${commentator.last_name}${commentator.first_name}` : '';
  
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: '言論人一覧', item: '/commentators' },
          { name: commentatorName, item: `/commentators/${resolvedParams.id}` },
        ]}
      />
      {children}
    </>
  );
} 