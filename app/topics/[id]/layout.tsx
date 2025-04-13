import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: topic } = await supabase
    .from('tags')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();
  
  return {
    title: topic ? `${topic.name}に関する問題発言一覧 | 問題発言ドットコム` : 'タグ詳細 | 問題発言ドットコム',
    description: topic ? `${topic.name}に関する政治家や言論人の問題発言一覧です。` : '特定のタグに関連する問題発言の一覧を表示します。',
  }
}

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 