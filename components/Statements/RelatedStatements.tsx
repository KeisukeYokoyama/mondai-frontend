'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StatementWithRelations } from '@/utils/supabase/types';

interface RelatedStatementsProps {
  currentStatement: StatementWithRelations;
  relatedStatements: StatementWithRelations[];
}

// 画像パスを処理するヘルパー関数
const getImagePath = (path: string | null, type: 'politician' | 'statement' = 'politician') => {
  if (!path) return '/images/default-avatar.png';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return '/images/default-avatar.png';
  }

  const bucket = type === 'politician' ? 'politicians' : 'statements';
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

export default function RelatedStatements({ currentStatement, relatedStatements }: RelatedStatementsProps) {
  if (!relatedStatements || relatedStatements.length === 0) return null;

  return (
    <section className="my-4 pb-4 mb-8 mx-auto">
      <div className="max-w-screen-md mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">関連する暴言</h2>
        <div className="relative">
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2">
            {relatedStatements.map((statement) => (
              <Link
                key={statement.id}
                href={`/statements/${statement.id}`}
                className="flex-none w-64 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 flex-grow">
                    <h3 className="text-lg font-semibold line-clamp-2 min-h-[3.5rem]">
                      {statement.title}
                    </h3>
                  </div>
                  <div className="p-4 pt-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        <Image
                          src={getImagePath(statement.speaker.image_path)}
                          alt={`${statement.speaker.last_name}${statement.speaker.first_name}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-gray-700 break-all">
                        {statement.speaker.last_name}{statement.speaker.first_name}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 