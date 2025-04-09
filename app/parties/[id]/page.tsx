import React from 'react';
import PartyDetailClient from '@/app/parties/[id]/PartyDetailClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PartyDetail({ params }: PageProps) {
  const resolvedParams = await params;
  return <PartyDetailClient id={resolvedParams.id} />;
}
