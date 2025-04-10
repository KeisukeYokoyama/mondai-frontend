'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Navs/Header'
import Footer from '@/components/Navs/Footer'
import Link from 'next/link'
import Image from 'next/image'

interface Statement {
  id: string;
  title: string;
  content: string | null;
  statement_date: string | null;
  image_path: string;
  evidence_url: string | null;
  created_at: string;
  speaker: {
    id: string;
    last_name: string;
    first_name: string;
    party: {
      name: string;
    };
    chamber: string | null;
    prefectures: {
      name: string;
    }[];
  };
}

type SupabaseStatement = {
  id: string;
  title: string;
  content: string | null;
  statement_date: string | null;
  image_path: string;
  evidence_url: string | null;
  created_at: string;
  speaker: {
    id: string;
    last_name: string;
    first_name: string;
    party: {
      name: string;
    };
    chamber: string | null;
    prefectures: {
      name: string;
    }[];
  };
}

export default function Home() {
  const supabase = createClientComponentClient()
  const [statements, setStatements] = useState<Statement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        const { data, error } = await supabase
          .from('statements')
          .select(`
            id,
            title,
            content,
            statement_date,
            image_path,
            evidence_url,
            created_at,
            speaker:speakers (
              id,
              last_name,
              first_name,
              party:parties (
                name
              ),
              chamber,
              prefectures (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setStatements((data as unknown as SupabaseStatement[]) || [])
      } catch (error) {
        console.error('Error fetching statements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatements()
  }, [supabase])

  // 画像パスを処理するヘルパー関数
  const getImagePath = (path: string) => {
    // SupabaseのストレージURLを構築
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseBucket = 'statements'
    return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${path}`
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>
      <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
        <div className="container px-5 py-8 mx-auto max-w-screen-md">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            問題発言一覧
          </h1>
          
          {isLoading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : statements.length > 0 ? (
            <div className="columns-1 md:columns-2 gap-4">
              {statements.map((statement) => (
                <div key={statement.id} className="break-inside-avoid mb-4">
                  <Link href={`/statements/${statement.id}`} className="block">
                    <div className="border border-gray-200 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow">
                      {statement.image_path && (
                        <div className="flex items-center justify-center">
                          <Image
                            src={getImagePath(statement.image_path)}
                            alt={statement.title}
                            width={600}
                            height={600}
                            className="w-full h-full object-cover object-center rounded-t-md"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900">
                            {statement.speaker.last_name} {statement.speaker.first_name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {statement.speaker.party?.name || '無所属'}
                          </span>
                        </div>
                        {statement.content && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                            {statement.content}
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          {statement.statement_date && (
                            <span className="mr-4">
                              {new Date(statement.statement_date).toLocaleDateString('ja-JP')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">問題発言はありません</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
