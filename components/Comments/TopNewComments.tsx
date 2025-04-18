'use client';

import { useEffect, useState } from 'react';
import { commentAPI } from '@/utils/supabase/comments';
import Link from 'next/link';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  statements: {
    id: string;
    title: string;
    content: string;
  };
};

export default function TopNewComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentAPI.getLatestComments(5);
        setComments(data);
      } catch (error) {
        console.error('コメントの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-4">最新のコメント</h2>
      <div className="grid gap-4">
        {comments.map((comment) => (
          <div key={comment.id}>
            <Link href={`/statements/${comment.statements.id}`}>
              <div className="bg-white rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 bg-white rounded">{comment.content}</p>
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-blue-700">
                    「{comment.statements.title.substring(0, 30)}...」
                    <span className="text-gray-500">
                    へのコメント
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
