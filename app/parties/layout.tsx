import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '政党一覧 - 政党を探す',
  description: '政党名や代表者名から政党を検索できます。検索条件を入れなければ政党の一覧を確認することができます。',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 