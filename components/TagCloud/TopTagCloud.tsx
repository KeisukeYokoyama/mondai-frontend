'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import supabase from '@/utils/supabase/client';
import { FaArrowRightLong } from 'react-icons/fa6';

interface TopTagCloudProps {
  title: string;
}

export default function TopTagCloud({ title }: TopTagCloudProps) {
  const [tags, setTags] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name')
          .limit(10);

        if (error) throw error;
        setTags(data || []);
      } catch (error) {
        console.error('タグの取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) {
    return (
      <>
        <div className="container px-3 pt-8 mx-auto">
          <h2 className="text-xl font-bold text-gray-900">
            {title}
          </h2>
        </div>
        <div className="container px-5 py-8 mt-4 mx-auto bg-white">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container px-3 pt-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
      </div>
      <div className="container px-5 py-8 mt-4 mx-auto bg-white">
        {tags.map((tag) => (
          <span key={tag.id} className="text-blue-700 font-bold mx-2">
            <Link href={`/topics/${tag.id}`}>
              #{tag.name}
            </Link>
          </span>
        ))}
      </div>
      <div className="container mx-auto text-right mt-4">
        <Link href="/topics">
          <button className="bg-gray-800 text-xs text-white px-4 py-2 rounded-md hover:bg-gray-600">
            もっと見る
            <FaArrowRightLong className="inline-block ml-2" />
          </button>
        </Link>
      </div>
    </>
  );
}
