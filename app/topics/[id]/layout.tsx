import { Metadata } from 'next';
import { getSupabaseClient } from '@/utils/supabase/client';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getTopicData(id: string) {
  const { data: topic } = await getSupabaseClient()
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();
  return topic;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const topic = await getTopicData(resolvedParams.id);
  
  const title = topic ? `${topic.name}に関する問題発言一覧 | 問題発言ドットコム` : 'タグ詳細 | 問題発言ドットコム';
  const description = topic ? `${topic.name}に関する政治家や言論人の問題発言一覧です。` : '特定のタグに関連する問題発言の一覧を表示します。';
  const url = `https://www.mondai-hatsugen.com/topics/${resolvedParams.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
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
      title,
      description,
      images: ['https://www.mondai-hatsugen.com/images/ogp-image.png'],
    },
  }
}

export default async function TopicLayout({
  params,
  children,
}: Props) {
  const resolvedParams = await params;
  const topic = await getTopicData(resolvedParams.id);
  const topicName = topic ? topic.name : '';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: 'トピックス一覧', item: '/topics' },
          { name: topicName, item: `/topics/${resolvedParams.id}` },
        ]}
      />
      {children}
    </>
  );
} 