import type { Metadata } from 'next'
import { politicianAPI } from '@/utils/supabase/politicians';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getPoliticianData(id: string) {
  const { data: politician } = await politicianAPI.getDetail(id);
  return politician;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const politician = await getPoliticianData(resolvedParams.id);
  
  return {
    title: politician ? `${politician.last_name}${politician.first_name}の問題発言スクリーンショット | 問題発言ドットコム` : '問題発言ドットコム',
    description: politician ? `${politician.last_name}${politician.first_name}の問題発言やデマ、嘘、問題行動などの証拠スクショ一覧です。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
  }
}

export default async function Layout({
  params,
  children,
}: Props) {
  const resolvedParams = await params;
  const politician = await getPoliticianData(resolvedParams.id);
  const politicianName = politician ? `${politician.last_name}${politician.first_name}` : '';
  
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: '政治家一覧', item: '/politicians' },
          { name: politicianName, item: `/politicians/${resolvedParams.id}` },
        ]}
      />
      {children}
    </>
  );
} 