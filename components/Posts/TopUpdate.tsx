'use client';

import React, { useState, useEffect } from 'react';
import { MdTipsAndUpdates } from "react-icons/md";
import { FaRegThumbsDown, FaRegThumbsUp, FaArrowRightLong } from "react-icons/fa6";
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
  image_path: string;
  speaker: {
    id: string;
    last_name: string;
    first_name: string;
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
            speaker:speakers!inner (
              id,
              last_name,
              first_name,
              party:parties!inner (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        console.log('Supabase response:', JSON.stringify(data, null, 2));
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
  const getImagePath = (path: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseBucket = 'statements';
    return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${path}`;
  };

  return (
    <>
      <div className="container px-3 pt-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900">
          <MdTipsAndUpdates className="inline-block mr-2 text-yellow-500" />
          {title}
        </h2>
      </div>
      <div className="container px-1 py-8 mx-auto">
        {loading ? (
          <div className="flex flex-wrap -m-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-2 md:w-1/3 w-full">
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
              <div key={statement.id} className="p-2 md:w-1/4 w-full">
                <Link href={`/statements/${statement.id}`}>
                  <div className="border border-gray-200 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow">
                    {statement.image_path && (
                      <div className="flex items-center justify-center">
                        <Image
                          src={getImagePath(statement.image_path)}
                          alt={statement.title || ''}
                          width={300}
                          height={300}
                          className="w-full h-48 object-cover object-center rounded-t-md"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-gray-900">
                          {statement.speaker.last_name} {statement.speaker.first_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {statement.speaker.party.name}
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
