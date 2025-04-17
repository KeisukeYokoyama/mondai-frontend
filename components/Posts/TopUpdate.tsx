'use client';

import React, { useState, useEffect } from 'react';
import { FaArrowRightLong } from "react-icons/fa6";
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface TopUpdateProps {
  title: string;
}

interface Statement {
  id: string;
  title: string;
  content: string | null;
  statement_date: string | null;
  image_path: string | null;
  video_path: string | null;
  video_thumbnail_path: string | null;
  speaker: {
    id: string;
    last_name: string;
    first_name: string;
    speaker_type: number;
    party: {
      name: string;
    };
  };
}

interface SupabaseResponse {
  id: string;
  title: string;
  content: string | null;
  statement_date: string | null;
  image_path: string;
  speaker: {
    id: string;
    last_name: string;
    first_name: string;
    speaker_type: string;
    party: {
      name: string;
    };
  };
}

export default function TopUpdate({ title }: TopUpdateProps) {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

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
            video_path,
            video_thumbnail_path,
            speaker:speakers (
              id,
              last_name,
              first_name,
              speaker_type,
              party:parties (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setStatements(data as unknown as Statement[]);
      } catch (error) {
        console.error('Error fetching statements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatements();
  }, [supabase]);

  // 画像パスを処理するヘルパー関数
  const getMediaPath = (statement: Statement) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
      return statement.video_path ? '/images/video-thumbnail-no-image.jpg' : '/images/default-avatar.png';
    }

    // 画像パスがある場合は画像を表示
    if (statement.image_path) {
      return `${supabaseUrl}/storage/v1/object/public/statements/${statement.image_path}`;
    }
    
    // 動画サムネイルがある場合はサムネイルを表示
    if (statement.video_thumbnail_path) {
      return `${supabaseUrl}/storage/v1/object/public/video-thumbnails/${statement.video_thumbnail_path}`;
    }

    // 動画はあるがサムネイルがない場合は動画用のデフォルト画像を表示
    if (statement.video_path) {
      return '/images/video-thumbnail-no-image.jpg';
    }

    // どちらもない場合はデフォルト画像を表示
    return '/images/default-avatar.png';
  };

  const getSpeakerTypeText = (speaker_type?: number) => {
    if (!speaker_type) return '無所属';
    switch (speaker_type) {
      case 1:
        return '政治家';
      case 2:
        return 'ジャーナリスト';
      case 3:
        return '学者・専門家';
      case 4:
        return '評論家・言論人';
      case 5:
        return 'その他';
      default:
        return '無所属';
    }
  };

  return (
    <>
      <div className="container px-3 pt-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
      </div>
      <div className="container px-1 py-8 mx-auto">
        {loading ? (
          <div className="flex flex-wrap -m-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-2 md:w-1/2 w-full">
                <div className="animate-pulse border border-gray-200 rounded-md bg-white shadow-sm h-64">
                  <div className="bg-gray-200 h-40 rounded-t-md"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap -m-4">
            {statements.map((statement) => (
              <div key={statement.id} className="p-2 md:w-1/2 w-full">
                <Link 
                  href={`/statements/${statement.id}`}
                  prefetch={true}
                  className="block transition-transform hover:scale-[1.02] duration-200"
                >
                  <div className="border border-gray-200 rounded-md bg-white shadow-sm">
                    <div className="flex items-center justify-center relative aspect-video">
                      <Image
                        src={getMediaPath(statement)}
                        alt={statement.title || ''}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center rounded-t-md"
                        loading="lazy"
                        quality={75}
                      />
                      {statement.video_thumbnail_path && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-gray-900">
                          {statement.speaker?.last_name || ''} {statement.speaker?.first_name || ''}
                        </span>
                        <span className="text-xs text-gray-500">
                          {statement.speaker?.party?.name || getSpeakerTypeText(statement.speaker?.speaker_type)}
                        </span>
                      </div>
                      {statement.content && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {statement.content}
                        </p>
                      )}
                      {statement.statement_date && (
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(statement.statement_date).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="container mx-auto text-right">
        <Link href="/statements">
          <button className="bg-gray-800 text-xs text-white px-4 py-2 rounded-md hover:bg-gray-600">
            もっと見る
            <FaArrowRightLong className="inline-block ml-2" />
          </button>
        </Link>
      </div>
    </>
  );
}
