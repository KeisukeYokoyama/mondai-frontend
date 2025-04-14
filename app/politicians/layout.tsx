import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata = {
  title: '政治家一覧 - 政治家を探す',
  description: '政治家を、名前、政党名、地域、議員種別などで絞り込みができます。政治家名のあいまい検索も可能です。',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const breadcrumbItems = [
    { name: 'ホーム', item: '/' },
    { name: '政治家一覧', item: '/politicians' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
} 