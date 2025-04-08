'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { statementAPI } from '@/utils/supabase/statements';
import type { StatementWithRelations, StatementTag } from '@/utils/supabase/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function StatementDetailClient({ id }: { id: string }) {
  const supabase = createClientComponentClient();
  const [statement, setStatement] = useState<StatementWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data, error } = await statementAPI.getDetail(id);
        
        if (error) {
          console.error('問題発言データの取得エラー:', error);
          throw new Error(typeof error === 'object' && error !== null && 'message' in error 
            ? error.message as string 
            : '問題発言データの取得に失敗しました');
        }
        
        if (!data) {
          throw new Error('問題発言データが見つかりませんでした');
        }
        
        setStatement(data);
      } catch (err) {
        console.error('エラー詳細:', err);
        setError(err instanceof Error ? err.message : '問題発言データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // 画像パスを処理するヘルパー関数
  const getImagePath = (path: string | File | null) => {
    if (!path) return '/images/default-profile.jpg';
    
    if (path instanceof File) return URL.createObjectURL(path);
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Supabaseのストレージパスの場合
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
      return path;
    }

    // パスがUUID/ファイル名の形式かチェック
    const pathRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/.*$/i;
    if (pathRegex.test(path)) {
      return `${supabaseUrl}/storage/v1/object/public/statements/${path}`;
    }
    
    return path.startsWith('/') ? path : `/${path}`;
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!statement) return <div>データが見つかりませんでした</div>;

  console.log('Statement tags:', statement.tags);
  console.log('Statement tags type:', typeof statement.tags);
  console.log('Is Array?', Array.isArray(statement.tags));

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>
      
      <section className="mt-5 pt-2 px-4">
        <div className="w-full md:w-1/2 md:mx-auto flex flex-col md:flex-row items-center justify-center text-center">
          {statement.speaker.image_path && (
            <Image 
              src={getImagePath(statement.speaker.image_path)}
              alt={`${statement.speaker.last_name}${statement.speaker.first_name}`}
              width={128}
              height={128}
              className="inline-flex object-cover border-4 border-indigo-400 rounded-full bg-gray-50 h-32 w-32 mb-4 md:mb-0 ml-0 md:mr-5"
            />
          )}
          
          <div className="flex flex-col">
            <div className="md:text-justify mb-3">
              <div className="flex flex-col mb-5">
                <p className="text-gray-900 font-bold text-2xl">
                  {statement.speaker.last_name}{statement.speaker.first_name}
                </p>
                <p className="text-gray-700 text-sm mt-2">
                  {statement.parties?.name || '政党なし'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-5 py-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          問題発言情報
        </h2>
        
        <div className="flex flex-wrap -m-4">
          <div className="p-2 w-full">
            <div className="border border-gray-200 rounded-md bg-white shadow-sm">
              {statement.image_path && (
                <div className="flex items-center justify-center pb-4">
                  <Image 
                    src={getImagePath(statement.image_path)}
                    alt={statement.title} 
                    width={400}
                    height={300}
                    className="w-full h-full object-cover object-center rounded-t-md"
                  />
                </div>
              )}
              <div className="pb-4 px-4">
                <h3 className="font-bold mb-2 text-gray-900">{statement.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {statement.content}
                </p>
                {statement.tags && statement.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {statement.tags.map((item: StatementTag, index: number) => {
                      const tag = item.tags;
                      return (
                        <div key={index}>
                          <Link 
                            href={`/statements?tag=${tag.id}`} 
                            className="bg-gray-100 text-gray-500 text-xs px-2.5 py-0.5 rounded-md hover:bg-gray-200"
                          >
                            {tag.name}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {statement.statement_date 
                    ? new Date(statement.statement_date).toLocaleDateString('ja-JP')
                    : '日付なし'
                  }
                </div>
                {statement.evidence_url && (
                  <div className="mt-2">
                    <a href={statement.evidence_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      エビデンスURL
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
