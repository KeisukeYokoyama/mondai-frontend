export const metadata = {
  title: '言論人一覧 - 言論人を探す',
  description: '政治家以外の言論人（ジャーナリスト、学者・専門家、評論家・言論人など）一覧。名前で検索が可能です。',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 