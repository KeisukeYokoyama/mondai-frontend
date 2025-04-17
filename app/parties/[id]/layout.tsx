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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mondai-hatsugen.com';
  const currentUrl = `${baseUrl}/parties/${resolvedParams.id}`;
  
  const title = party ? `${party.name} | 問題発言ドットコム` : '問題発言ドットコム';
  const description = party ? `${party.name}に所属する議員一覧です。${party.name}議員の問題発言や暴言を検索できます。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。';
  
  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/parties/${resolvedParams.id}`
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