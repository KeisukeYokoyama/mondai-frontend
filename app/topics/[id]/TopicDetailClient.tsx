'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface Tag {
  id: string;
  name: string;
}

interface TopicDetailClientProps {
  tagId: string;
}

export default function TopicDetailClient({ tagId }: TopicDetailClientProps) {
  const supabase = createClientComponentClient();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topicName, setTopicName] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // タグ名を取得
        const { data: topicData, error: topicError } = await supabase
          .from('tags')
          .select('name')
          .eq('id', tagId)
          .single();

        if (topicError) throw topicError;
        setTopicName(topicData.name);

        // タグに紐づく発言を取得
        const { data: statementsData, error: statementsError } = await supabase
          .from('statement_tag')
          .select(`
            statements (
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
            )
          `)
          .eq('tag_id', tagId)
          .order('created_at', { ascending: false });

        if (statementsError) throw statementsError;
        setStatements((statementsData.map(item => item.statements) as unknown as SupabaseStatement[]) || []);

        // 全てのタグを取得
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('id, name')
          .order('name');

        if (tagsError) throw tagsError;
        setTags(tagsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, tagId]);

  const getImagePath = (path: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseBucket = 'statements';
    return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${path}`;
  };

  // 表示するタグの数を計算
  const visibleTags = showAllTags ? tags : tags.slice(0, 8);
  const hasMoreTags = tags.length > 8;

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <div className="container px-5 py-8 mx-auto max-w-screen-md">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          #{topicName} に関連する問題発言
        </h1>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">タグ一覧</h2>
          <div className="relative">
            <div className={`flex flex-wrap gap-2 ${!showAllTags ? 'max-h-[4.5rem] overflow-hidden' : ''}`}>
              {visibleTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/topics/${tag.id}`}
                  className={`bg-white border text-sm px-3 py-1.5 rounded-full ${
                    tag.id === tagId
                      ? 'border-blue-500 text-blue-500'
                      : 'border-gray-200 text-gray-900 hover:border-gray-300'
                  }`}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
            {!showAllTags && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-100 to-transparent" />
            )}
          </div>
          {hasMoreTags && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="mt-4 text-sm text-blue-600 font-semibold hover:text-gray-900 flex items-center"
            >
              {showAllTags ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  タグを折りたたむ
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  すべてのタグを表示
                </>
              )}
            </button>
          )}
        </div>
        
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
            <p className="text-gray-500">関連する問題発言はありません</p>
          </div>
        )}
      </div>
    </main>
  );
} 