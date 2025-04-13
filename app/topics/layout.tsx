import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '問題発言のトピックス一覧 | 問題発言ドットコム',
  description: '問題発言のトピックス（タグ）一覧画面です。',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 