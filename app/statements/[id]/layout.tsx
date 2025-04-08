import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '問題発言ドットコム',
  description: '問題発言ドットコムは、政治家や言論人の問題発言や矛盾点などを検索できるサイトです。',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
