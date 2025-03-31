'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { politicianAPI } from '@/utils/supabase/politicians';
import type { SpeakerWithRelations } from '@/utils/supabase/types';
import { 
  FaSquareXTwitter,
  FaHouse,
  FaLine,
  FaSquareInstagram,
  FaTiktok
} from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io5";

export default function PoliticianDetailClient({ id }: { id: string }) {
  const [politician, setPolitician] = useState<SpeakerWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await politicianAPI.getDetail(id);
        if (error) throw new Error(error);
        setPolitician(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '政治家データの取得に失敗しました');
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
    
    return path.startsWith('/') ? path : `/${path}`;
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!politician) return <div>データが見つかりませんでした</div>;

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header title={`${politician.last_name}${politician.first_name}`} />
        </div>
      </section>
      
      <section className="mt-5 p-4">
        <div className="w-full md:w-1/2 md:mx-auto flex flex-col md:flex-row items-center justify-center text-center">
          {politician.image_path && (
            <Image 
              src={getImagePath(politician.image_path)}
              alt={`${politician.last_name}${politician.first_name}`}
              width={128}
              height={128}
              className="inline-flex object-cover border-4 border-indigo-500 rounded-full bg-gray-50 h-32 w-32 mb-4 md:mb-0 ml-0 md:mr-5"
            />
          )}
          
          <div className="flex flex-col">
            <div className="md:text-justify mb-3">
              <div className="flex flex-col mb-5">
                <p className="text-gray-900 font-bold text-2xl">
                  {politician.last_name}{politician.first_name}
                </p>
                <p className="text-gray-700 text-sm mt-2">
                  {politician.last_name_kana}{politician.first_name_kana} / {politician.age}歳 / {politician.gender}
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  {politician.parties.name} / {politician.chamber} ({politician.prefectures.name})
                </p>

                <ul className="mt-2 flex flex-row items-center justify-center md:justify-start">
                  {politician.official_url && (
                    <li className="mr-5">
                      <a href={politician.official_url} target="_blank" rel="noopener noreferrer" aria-label="Home">
                        <FaHouse className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {/* 他のSNSアイコンも同様に */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center mb-8">
        <Link
          href={`/statements/create?speaker_id=${politician.id}`}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base
          font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2
          focus:ring-offset-2 focus:ring-gray-500"
        >
          スクショを登録
        </Link>
      </div>

      <section className="container px-5 py-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-3">
          問題発言一覧
        </h2>
        
        {politician.statements && politician.statements.length > 0 ? (
          <div className="flex flex-wrap -m-4">
            {politician.statements.map((statement) => (
              <div key={statement.id} className="p-2 md:w-1/3 w-full">
                <div className="border border-gray-200 rounded-md bg-white shadow-sm p-4">
                  {statement.image_path && (
                    <div className="flex items-center justify-center mb-4">
                      <Image 
                        src={getImagePath(statement.image_path)}
                        alt={statement.content}
                        width={400}
                        height={300}
                        className="w-full h-auto object-cover rounded"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-sm mb-2">{statement.content}</h3>
                  {statement.tags && statement.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {statement.tags.map((tag) => (
                        <Link 
                          href={`/statements?tag=${tag.id}`} 
                          key={tag.id} 
                          className="bg-gray-200 text-xs px-2 py-1 rounded-full hover:bg-gray-300"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(statement.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">問題発言が登録されていません</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
} 