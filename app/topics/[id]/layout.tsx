import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'タグ詳細 | 問題発言データベース',
  description: '特定のタグに関連する問題発言の一覧を表示します。',
};

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 