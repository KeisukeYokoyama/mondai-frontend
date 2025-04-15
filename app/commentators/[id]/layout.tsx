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
  
  return {
    title: commentator ? `${commentator.last_name}${commentator.first_name}の発言 | 問題発言ドットコム` : '問題発言ドットコム',
    description: commentator ? `${commentator.last_name}${commentator.first_name}の発言やデマ、嘘、問題行動などの証拠スクショ一覧です。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
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