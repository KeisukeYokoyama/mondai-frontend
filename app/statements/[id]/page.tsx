import React from 'react';
import StatementDetailClient from '@/app/statements/[id]/StatementDetailClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

// Next.js 15ではparamsをPromise型に変更
export default async function StatementDetail({ params }: PageProps) {
  const resolvedParams = await params;
  return <StatementDetailClient id={resolvedParams.id} />;
}
