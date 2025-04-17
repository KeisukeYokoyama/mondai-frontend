'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import supabase from '@/utils/supabase/client';
import { FaArrowRightLong } from 'react-icons/fa6';

interface TopTagCloudProps {
  title: string;
}

interface Tag {
  id: number;
  name: string;
  usage_count: number;
}

// ローディングコンポーネントを分離
function LoadingSkeleton() {
  return (
    <div className="animate-pulse flex space-x-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  );
}

// タグクラウドの本体コンポーネント
function TagCloudContent({ tags }: { tags: Tag[] }) {
  // 使用回数の最大値と最小値を取得
  const maxCount = Math.max(...tags.map(tag => tag.usage_count));
  const minCount = Math.min(...tags.map(tag => tag.usage_count));

  // タグのサイズを計算する関数（1.0 ~ 3.0の範囲でスケーリング）
  const calculateSize = (count: number) => {
    if (maxCount === minCount) return 1.0;
    return 0.8 + ((count - minCount) / (maxCount - minCount)) * 2.4;
  };

  // タグをランダムに並び替え
  const shuffledTags = [...tags].sort(() => Math.random() - 0.5);

  return (
    <>
      {shuffledTags.map((tag) => {
        const size = calculateSize(tag.usage_count);
        return (
          <span 
            key={tag.id} 
            className="text-blue-700 font-bold mx-2 inline-block hover:text-blue-500"
            style={{ 
              fontSize: `${size}rem`,
              transition: 'all 0.3s ease'
            }}
          >
            <Link href={`/topics/${tag.id}`} prefetch={true}>
              {tag.name}
            </Link>
          </span>
        );
      })}
    </>
  );
}

export default function TopTagCloud({ title }: TopTagCloudProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      try {
        // 直近24時間で最も使用されたタグを取得
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentTags, error: recentError } = await supabase
          .rpc('get_popular_tags', {
            time_limit: twentyFourHoursAgo,
            tag_limit: 10
          });

        if (recentError) throw recentError;

        // 24時間以内のタグが10個未満の場合、全期間の最も使用されたタグで補完
        if (!recentTags || recentTags.length < 10) {
          const { data: allTimeTags, error: allTimeError } = await supabase
            .rpc('get_popular_tags_all_time', {
              tag_limit: 10
            });

          if (allTimeError) throw allTimeError;
          
          const formattedTags = allTimeTags?.map((tag: { id: number; name: string; usage_count: number }) => ({
            id: tag.id,
            name: tag.name,
            usage_count: tag.usage_count
          })) || [];
          
          setTags(formattedTags);
        } else {
          const formattedTags = recentTags?.map((tag: { id: number; name: string; usage_count: number }) => ({
            id: tag.id,
            name: tag.name,
            usage_count: tag.usage_count
          })) || [];
          
          setTags(formattedTags);
        }
      } catch (error) {
        console.error('タグの取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  return (
    <>
      <div className="container px-3 pt-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
      </div>
      <div className="container px-4 py-6 mt-4 mx-auto bg-white text-center">
        {loading ? <LoadingSkeleton /> : <TagCloudContent tags={tags} />}
      </div>
      <div className="container mx-auto text-right mt-4">
        <Link href="/topics" prefetch={true}>
          <button className="bg-gray-800 text-xs text-white px-4 py-2 rounded-md hover:bg-gray-600">
            もっと見る
            <FaArrowRightLong className="inline-block ml-2" />
          </button>
        </Link>
      </div>
    </>
  );
}
