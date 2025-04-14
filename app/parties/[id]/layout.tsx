import type { Metadata } from 'next'
import { partiesAPI } from '@/utils/supabase/parties';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

async function getPartyData(id: string) {
  const { data: party } = await partiesAPI.getPartyDetail(Number(id));
  return party;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const party = await getPartyData(resolvedParams.id);
  
  return {
    title: party ? `${party.name} | 問題発言ドットコム` : '問題発言ドットコム',
    description: party ? `${party.name}に所属する議員一覧です。${party.name}議員の問題発言や暴言を検索できます。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
  }
}

export default async function Layout({
  params,
  children,
}: Props) {
  const resolvedParams = await params;
  const party = await getPartyData(resolvedParams.id);
  const partyName = party ? party.name : '';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: '政党一覧', item: '/parties' },
          { name: partyName, item: `/parties/${resolvedParams.id}` },
        ]}
      />
      {children}
    </>
  );
} 