'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { partiesAPI } from '@/utils/supabase/parties';
import { politicianAPI } from '@/utils/supabase/politicians';
import type { PartyDetail, SpeakerWithRelations } from '@/utils/supabase/types';
import { 
  FaSquareXTwitter,
  FaHouse,
  FaSquareInstagram,
  FaYoutube
} from "react-icons/fa6";

export default function PartyDetailClient({ id }: { id: string }) {
  const [party, setParty] = useState<PartyDetail | null>(null);
  const [politicians, setPoliticians] = useState<SpeakerWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await partiesAPI.getPartyDetail(Number(id));
        if (error) throw new Error(error);
        setParty(data);
        
        // 政党に所属する政治家を取得
        const { data: politiciansData, error: politiciansError } = await politicianAPI.search({
          party_id: id,
          per_page: 100
        });
        
        if (politiciansError) throw new Error(politiciansError);
        setPoliticians(politiciansData?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // URLが有効かどうかをチェックするヘルパー関数
  const isValidUrl = (url: string | null): boolean => {
    return url !== null && url !== "NULL" && url.trim() !== '';
  };

  // 画像パスを処理するヘルパー関数
  const getImagePath = (path: string | null) => {
    if (!path) return '/images/default-avatar.png';
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    return path.startsWith('/') ? path : `/${path}`;
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!party) return <div>データが見つかりませんでした</div>;

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>
      
      <section className="mt-5 pt-2 px-4">
        <div className="w-full md:w-1/2 md:mx-auto flex flex-col md:flex-row items-center justify-center text-center">
          <div className="flex flex-col">
            <div className="md:text-justify mb-3">
              <div className="flex flex-col mb-5">
                <p className="text-gray-900 font-bold text-2xl">
                  {party.name}
                </p>
                {party.abbreviation && (
                  <p className="text-gray-700 text-sm mt-2">
                    略称: {party.abbreviation}
                  </p>
                )}
                {party.leader_name && (
                  <p className="text-gray-700 text-sm mt-1">
                    代表: {party.leader_name}
                  </p>
                )}
                {party.description && (
                  <p className="text-gray-700 text-sm mt-2">
                    {party.description}
                  </p>
                )}

                <ul className="mt-2 flex flex-row items-center justify-center md:justify-start">
                  {isValidUrl(party.official_website) && (
                    <li className="mr-5">
                      <a href={party.official_website!} target="_blank" rel="noopener noreferrer" aria-label="公式サイト">
                        <FaHouse className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {isValidUrl(party.twitter_url) && (
                    <li className="mr-5">
                      <a href={party.twitter_url!} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <FaSquareXTwitter className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {isValidUrl(party.youtube_url) && (
                    <li className="mr-5">
                      <a href={party.youtube_url!} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <FaYoutube className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {isValidUrl(party.instagram_url) && (
                    <li className="mr-5">
                      <a href={party.instagram_url!} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FaSquareInstagram className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-5 py-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {party.name}の基本情報
        </h2>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {party.founded_date && (
              <div>
                <dt className="text-sm font-medium text-gray-500">設立日</dt>
                <dd className="mt-1 text-sm text-gray-900">{party.founded_date}</dd>
              </div>
            )}
            {party.dissolved_date && (
              <div>
                <dt className="text-sm font-medium text-gray-500">解散日</dt>
                <dd className="mt-1 text-sm text-gray-900">{party.dissolved_date}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">政党種別</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {party.parent_id ? '諸派' : '国政政党'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 所属政治家一覧 */}
      <section className="container px-5 py-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {party.name}に所属する政治家
        </h2>
        
        <div className="container px-0 py-4 mx-auto">
          <div className="flex flex-col divide-y divide-gray-200">
            {politicians.length > 0 ? (
              politicians.map((politician, index) => (
                <Link 
                  href={`/politicians/${politician.id}`}
                  key={politician.id || index} 
                  title={`${politician.last_name} ${politician.first_name}の問題発言`}
                  className="flex items-center justify-between py-3 px-4 bg-white w-full hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center">
                    <Image
                      src={getImagePath(politician.image_path)}
                      alt={`${politician.last_name} ${politician.first_name}`} 
                      className="w-16 h-16 object-cover rounded-full mr-4 shadow-md" 
                      width={64}
                      height={64}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900">
                        <span className="font-bold">
                          {politician.last_name} {politician.first_name}
                        </span>
                        <span className="text-gray-600 text-xs">
                          （{politician.age ? `${politician.age}歳` : '-'} / {politician.gender || '-'}）
                        </span>
                      </h3>
                      <p className="text-gray-600 text-xs">
                        {politician.chamber || '不明'} / 
                        {politician.prefectures?.name || '地域不明'} /
                        <span 
                          className={politician.election_result === "0" ? 'text-red-600 font-semibold' : 
                                   politician.election_result === "1" ? 'text-green-600 font-semibold' : ''}
                        >
                          {politician.election_result === "0" ? '😢 落選' : 
                           politician.election_result === "1" ? '当選' : '不明'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="min-w-[40px] text-right">
                    <span className="text-blue-500 text-sm font-bold">
                      詳細
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                所属する政治家が見つかりません
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 