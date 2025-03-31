import React from 'react';
import PoliticianDetailClient from '@/app/politicians/[id]/PoliticianDetailClient';

export default function PoliticianDetail({ params }: { params: { id: string } }) {
  return <PoliticianDetailClient id={params.id} />;
}
