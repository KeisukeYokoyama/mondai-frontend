import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '問題発言を登録 | 問題発言ドットコム',
  description: '政治家や言論人の問題発言を登録できます。',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 