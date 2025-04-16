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
  
  return {
    title: topic ? `${topic.name}に関する問題発言一覧 | 問題発言ドットコム` : 'タグ詳細 | 問題発言ドットコム',
    description: topic ? `${topic.name}に関する政治家や言論人の問題発言一覧です。` : '特定のタグに関連する問題発言の一覧を表示します。',
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