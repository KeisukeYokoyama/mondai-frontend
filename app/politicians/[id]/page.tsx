import React from 'react';
import PoliticianDetailClient from '@/app/politicians/[id]/PoliticianDetailClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

// Next.js 15ではparamsをPromise型に変更
export default async function PoliticianDetail({ params }: PageProps) {
  const resolvedParams = await params;
  return <PoliticianDetailClient id={resolvedParams.id} />;
}
