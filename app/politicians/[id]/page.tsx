import React from 'react';
import PoliticianDetailClient from '@/app/politicians/[id]/PoliticianDetailClient';

type PageProps = {
  params: { id: string };
};

export default function PoliticianDetail({ params }: PageProps) {
  return <PoliticianDetailClient id={params.id} />;
}
