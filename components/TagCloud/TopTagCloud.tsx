'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function TopTagCloud() {
  const [tags, setTags] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');

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
      <div className="container px-5 py-8 mt-4 mx-auto bg-white">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-5 py-8 mt-4 mx-auto bg-white flex flex-wrap">
      {tags.map((tag) => (
        <span key={tag.id} className="text-blue-600 font-bold mx-2 block">
          <Link href={`/topics/${tag.id}`}>
            #{tag.name}
          </Link>
        </span>
      ))}
    </div>
  );
}
