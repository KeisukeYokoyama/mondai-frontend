import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '政治家一覧 - 政治家を探す',
  description: '政治家を、名前、政党名、地域、議員種別などで絞り込みができます。政治家名のあいまい検索も可能です。',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 