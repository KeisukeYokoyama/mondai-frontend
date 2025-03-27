'use client';

import React, { useState, useEffect } from 'react'
import Header from '@/components/Navs/Header'
import Footer from '@/components/Navs/Footer'
import Image from 'next/image'
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { IoLogoYoutube } from "react-icons/io5";
import { FaLine } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaTiktok } from "react-icons/fa";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Tag {
  id: string;
  name: string;
}

interface Statement {
  id: string;
  title: string;
  content: string;
  statement_date: string;
  image_path: string | null;
  tags: Tag[];
  evidence_url: string | null;
}

interface Politician {
  id: string;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  age: string;
  gender: string;
  party: {
    name: string;
  };
  prefecture: {
    name: string;
  };
  chamber: string;
  election_result: string;
  image_path: string;
  official_url: string;
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  line_url: string;
  instagram_url: string;
  tiktok_url: string;
  statements: Statement[];
}

async function getPolitician(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/api/v1/speakers/${id}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`政治家データの取得に失敗しました (ステータス: ${res.status})`);
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('政治家データの取得に失敗しました');
  }
}

export default function Home({ params }: { params: { id: string } }) {
  const [politician, setPolitician] = useState<Politician | null>(null);
  const [loading, setLoading] = useState(true);

  // データ取得を非同期で行う
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPolitician(params.id);
        setPolitician(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  if (loading) return <div></div>;
  if (!politician) return <div>データを読み込めませんでした</div>;

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header title={`${politician.last_name}${politician.first_name}`} />
        </div>
      </section>
      
      <section className="mt-5 p-4">
        <div className="w-full md:w-1/2 md:mx-auto flex flex-col md:flex-row items-center justify-center text-center">
          <Image 
            src={`/${politician.image_path}`}
            alt={`${politician.last_name}${politician.first_name}`}
            width={128}
            height={128}
            className="inline-flex object-cover border-4 border-indigo-500 rounded-full bg-gray-50 h-32 w-32 mb-4 md:mb-0 ml-0 md:mr-5"
          />
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
                  {politician.party.name} / {politician.chamber} ({politician.prefecture.name})
                </p>

                <ul className="mt-2 flex flex-row items-center justify-center md:justify-start">
                  {politician.official_url && (
                    <li className="mr-5">
                      <a href={politician.official_url} target="_blank" aria-label="Home">
                        <FaHome className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {politician.twitter_url && (
                    <li className="mr-5">
                      <a href={politician.twitter_url} target="_blank" aria-label="X（旧Twitter）">
                        <FaSquareXTwitter className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {politician.facebook_url && (
                    <li className="mr-5">
                      <a href={politician.facebook_url} target="_blank" aria-label="Facebook">
                        <FaFacebookSquare className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {politician.youtube_url && (
                    <li className="mr-5">
                      <a href={politician.youtube_url} target="_blank" aria-label="Youtube">
                        <IoLogoYoutube className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {politician.line_url && (
                    <li className="mr-5">
                      <a href={politician.line_url} target="_blank" aria-label="Line">
                        <FaLine className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {politician.instagram_url && (
                    <li className="mr-5">
                      <a href={politician.instagram_url} target="_blank" aria-label="Instagram">
                        <FaSquareInstagram className="h-6 text-gray-700 hover:text-gray-300" />
                      </a>
                    </li>
                  )}
                  {politician.tiktok_url && (
                    <li className="mr-5">
                      <a href={politician.tiktok_url} target="_blank" aria-label="TikTok">
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
      {/* 新規発言登録ボタンを追加 */}
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

      {/* 発言一覧セクション */}
      <section className="container px-5 py-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-3">
          問題発言一覧
        </h2>
        
        {politician.statements && politician.statements.length > 0 ? (
          <div className="flex flex-wrap -m-4">
            {politician.statements.map((statement: Statement) => (
              <div key={statement.id} className="p-2 md:w-1/3 w-full">
                <div className="border border-gray-200 rounded-md bg-white shadow-sm">
                  {statement.image_path && (
                    <div className="flex items-center justify-center p-4">
                      <Image 
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${statement.image_path}`}
                        alt={statement.title} 
                        width={400}
                        height={300}
                        className="w-full h-full object-cover object-center rounded"
                      />
                    </div>
                  )}
                  <div className="pb-4 px-4">
                    <h3 className="font-bold text-sm mb-2">{statement.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                      {statement.content}
                    </p>
                    {statement.tags && statement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {statement.tags.map((tag: Tag) => (
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
                      {new Date(statement.statement_date).toLocaleDateString('ja-JP')}
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
  )
}
