'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { politicianAPI } from '@/utils/supabase/politicians';
import type { SpeakerWithRelations } from '@/utils/supabase/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  FaSquareXTwitter,
  FaHouse,
  FaLine,
  FaSquareInstagram,
  FaTiktok
} from "react-icons/fa6";
import { IoLogoYoutube } from "react-icons/io5";

export default function PoliticianDetailClient({ id }: { id: string }) {
  const supabase = createClientComponentClient();
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

  // URLが有効かどうかをチェックするヘルパー関数
  const isValidUrl = (url: string | null): boolean => {
    return url !== null && url !== "NULL" && url.trim() !== '';
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!politician) return <div>データが見つかりませんでした</div>;

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>
      
      <section className="mt-5 pt-2 px-4">
        <div className="w-full md:w-1/2 md:mx-auto flex flex-col md:flex-row items-center justify-center text-center">
          {politician.image_path && (
            <Image 
              src={getImagePath(politician.image_path)}
              alt={`${politician.last_name}${politician.first_name}`}
              width={128}
              height={128}
              className="inline-flex object-cover border-4 border-indigo-400 rounded-full bg-gray-50 h-32 w-32 mb-4 md:mb-0 ml-0 md:mr-5"
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
                  {isValidUrl(politician.official_url) && (
                    <li className="mr-5">
                      <a href={politician.official_url!} target="_blank" rel="noopener noreferrer" aria-label="Home">
                        <FaHouse className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {isValidUrl(politician.twitter_url) && (
                    <li className="mr-5">
                      <a href={politician.twitter_url!} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <FaSquareXTwitter className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {isValidUrl(politician.youtube_url) && (
                    <li className="mr-5">
                      <a href={politician.youtube_url!} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <IoLogoYoutube className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {isValidUrl(politician.line_url) && (
                    <li className="mr-5">
                      <a href={politician.line_url!} target="_blank" rel="noopener noreferrer" aria-label="LINE">
                        <FaLine className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {isValidUrl(politician.instagram_url) && (
                    <li className="mr-5">
                      <a href={politician.instagram_url!} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FaSquareInstagram className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {isValidUrl(politician.tiktok_url) && (
                    <li className="mr-5">
                      <a href={politician.tiktok_url!} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                        <FaTiktok className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center mb-4">
        <Link
          href={`/statements/create?speaker_id=${politician.id}`}
          className="px-6 py-3 border text-sm rounded-md text-white bg-gray-800 hover:bg-gray-700"
        >
          スクショを登録
        </Link>
      </div>

      <section className="container px-5 py-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {politician.last_name}{politician.first_name}の問題発言
        </h2>
        
        {politician.statements && politician.statements.length > 0 ? (
          <div className="flex flex-wrap -m-4">
            {politician.statements.map((statement) => (
              <div key={statement.id} className="p-2 md:w-1/3 w-full">
                <div className="border border-gray-200 rounded-md bg-white shadow-sm">
                  {statement.image_path && (
                    <div className="flex items-center justify-center p-4">
                      <Image 
                        src={getImagePath(statement.image_path)}
                        alt={statement.title} 
                        width={400}
                        height={300}
                        className="w-full h-full object-cover object-center rounded"
                      />
                    </div>
                  )}
                  <div className="pb-4 px-4">
                    <h3 className="font-bold mb-2 text-gray-900">{statement.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                      {statement.content}
                    </p>
                    {statement.tags && statement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {statement.tags.map((tag) => (
                          <Link 
                            href={`/statements?tag=${tag.id}`} 
                            key={tag.id} 
                            className="bg-gray-100 text-gray-500 text-xs px-2.5 py-0.5 rounded-md hover:bg-gray-200"
                          >
                            {tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {statement.statement_date 
                        ? new Date(statement.statement_date).toLocaleDateString('ja-JP')
                        : '日付なし'
                      }
                    </div>
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