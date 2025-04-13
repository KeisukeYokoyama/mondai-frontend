import type { Metadata, ResolvingMetadata } from 'next'
import { supabase } from '@/lib/supabase'

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('id', params.id)
    .single();
  
  return {
    title: party ? `${party.name} | 問題発言ドットコム` : '問題発言ドットコム',
    description: party ? `${party.name}に所属する議員一覧です。${party.name}議員の問題発言や暴言を検索できます。` : '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 