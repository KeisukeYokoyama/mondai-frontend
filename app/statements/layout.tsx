import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '問題発言を探す',
  description: '政治家や言論人の問題発言を証拠付きで検索できます。発言日や政党、関連トピックスで絞り込みができます。',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 