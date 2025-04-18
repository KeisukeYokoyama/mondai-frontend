import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '問題発言を編集 | 問題発言ドットコム',
  description: '政治家や言論人の問題発言を編集できます。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 