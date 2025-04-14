import type { Metadata } from 'next'
import { statementAPI } from '@/utils/supabase/statements';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getStatementData(id: string) {
  const { data: statement } = await statementAPI.getDetail(id);
  return statement;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const statement = await getStatementData(resolvedParams.id);
  
  return {
    title: statement ? `${statement.speaker?.last_name}${statement.speaker?.first_name}が「${statement.title}」と発言しました | 問題発言ドットコム` : '問題発言ドットコム',
    description: statement ? `${statement.speaker?.last_name}${statement.speaker?.first_name}による問題発言「${statement.title}」の証拠スクリーンショットです。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
  }
}

export default async function Layout({
  params,
  children,
}: Props) {
  const resolvedParams = await params;
  const statement = await getStatementData(resolvedParams.id);
  const statementTitle = statement ? statement.title : '';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: '問題発言一覧', item: '/statements' },
          { name: statementTitle, item: `/statements/${resolvedParams.id}` },
        ]}
      />
      {children}
    </>
  );
}
