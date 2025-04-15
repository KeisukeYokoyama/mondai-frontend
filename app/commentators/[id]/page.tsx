import React from 'react';
import CommentatorDetailClient from '@/app/commentators/[id]/CommentatorDetailClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

// Next.js 15ではparamsをPromise型に変更
export default async function CommentatorDetail({ params }: PageProps) {
  const resolvedParams = await params;
  return <CommentatorDetailClient id={resolvedParams.id} />;
}
