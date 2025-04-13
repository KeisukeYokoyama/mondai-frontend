import type { Metadata } from 'next'
import { politicianAPI } from '@/utils/supabase/politicians';

interface GenerateMetadataProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params, searchParams }: GenerateMetadataProps,
): Promise<Metadata> {
  const { data: politician } = await politicianAPI.getDetail(params.id);
  
  return {
    title: politician ? `${politician.last_name}${politician.first_name}の問題発言スクリーンショット | 問題発言ドットコム` : '問題発言ドットコム',
    description: politician ? `${politician.last_name}${politician.first_name}の問題発言やデマ、嘘、問題行動などの証拠スクショ一覧です。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 