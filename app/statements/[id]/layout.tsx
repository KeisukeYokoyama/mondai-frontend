import type { Metadata } from 'next'
import { statementAPI } from '@/utils/supabase/statements';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: statement } = await statementAPI.getDetail(resolvedParams.id);
  
  return {
    title: statement ? `${statement.speaker?.last_name}${statement.speaker?.first_name}が「${statement.title}」と発言しました | 問題発言ドットコム` : '問題発言ドットコム',
    description: statement ? `${statement.speaker?.last_name}${statement.speaker?.first_name}による問題発言「${statement.title}」の証拠スクリーンショットです。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
