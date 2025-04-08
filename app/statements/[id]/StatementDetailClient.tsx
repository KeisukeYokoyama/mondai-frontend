'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { statementAPI } from '@/utils/supabase/statements';
import { commentAPI } from '@/utils/supabase/comments';
import type { StatementWithRelations, StatementTag } from '@/utils/supabase/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Comment {
  id: string;
  content: string;
  created_at: string;
}

export default function StatementDetailClient({ id }: { id: string }) {
  const supabase = createClientComponentClient();
  const [statement, setStatement] = useState<StatementWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data, error } = await statementAPI.getDetail(id);

        if (error) {
          console.error('問題発言データの取得エラー:', error);
          throw new Error(typeof error === 'object' && error !== null && 'message' in error
            ? error.message as string
            : '問題発言データの取得に失敗しました');
        }

        if (!data) {
          throw new Error('問題発言データが見つかりませんでした');
        }

        setStatement(data);
      } catch (err) {
        console.error('エラー詳細:', err);
        setError(err instanceof Error ? err.message : '問題発言データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // コメントの読み込み
  useEffect(() => {
    async function loadComments() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('statement_id', id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('コメントの取得エラー:', error);
          console.error('エラー詳細:', JSON.stringify(error, null, 2));
          return;
        }

        setComments(data || []);
      } catch (err) {
        console.error('コメント取得中の予期せぬエラー:', err);
      }
    }

    if (statement) {
      loadComments();
    }
  }, [statement, id, supabase]);

  // コメント投稿
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setCommentError(null);

    try {
      // IPアドレスとユーザーエージェントの取得
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      const userAgent = navigator.userAgent;

      // コメント投稿
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            statement_id: id,
            content: newComment.trim(),
            ip_address: ip,
            user_agent: userAgent,
          },
        ]);

      if (error) throw error;

      // コメントリストを更新
      const { data: newCommentData } = await supabase
        .from('comments')
        .select('*')
        .eq('statement_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (newCommentData) {
        setComments([newCommentData, ...comments]);
      }

      setNewComment('');
    } catch (err) {
      console.error('コメント投稿エラー:', err);
      setCommentError('コメントの投稿に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 画像パスを処理するヘルパー関数
  const getImagePath = (path: string | File | null) => {
    if (!path) return '/images/default-profile.jpg';

    if (path instanceof File) return URL.createObjectURL(path);

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Supabaseのストレージパスの場合
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
      return path;
    }

    // パスがUUID/ファイル名の形式かチェック
    const pathRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/.*$/i;
    if (pathRegex.test(path)) {
      return `${supabaseUrl}/storage/v1/object/public/statements/${path}`;
    }

    return path.startsWith('/') ? path : `/${path}`;
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!statement) return <div>データが見つかりませんでした</div>;

  console.log('Statement tags:', statement.tags);
  console.log('Statement tags type:', typeof statement.tags);
  console.log('Is Array?', Array.isArray(statement.tags));

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>

      <section className="mt-5 pt-2 px-4">
        <div className="w-full md:w-4/6 md:mx-auto flex flex-row items-center">
          {/* {statement.speaker.image_path && (
            <Image
              src={getImagePath(statement.speaker.image_path)}
              alt={`${statement.speaker.last_name}${statement.speaker.first_name}`}
              width={64}
              height={64}
              className="inline-flex object-cover border-2 border-indigo-500 rounded-full bg-gray-50 h-12 w-12 mr-3 aspect-square"
            />
          )} */}
          <div className="flex flex-col mb-4">
            <h1 className="font-bold">
              <Link href={`/politicians/${statement.speaker.id}`}>
                <span className=" text-3xl text-emerald-600">
                  {statement.speaker.last_name}{statement.speaker.first_name}
                </span>
              </Link>
              <span className="text-gray-900 text-sm ml-1">
                が
              </span>
              <span className="text-3xl ml-1 text-red-400">
                {statement.title}
              </span>
              <span className="text-gray-900 text-sm ml-1">
                という発言をしました！
              </span>
            </h1>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center">
        {statement.tags && statement.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {statement.tags.map((item: StatementTag, index: number) => {
              const tag = item.tags;
              return (
                <div key={index}>
                  <Link
                    href={`/statements?tag=${tag.id}`}
                    className="bg-gray-900 text-white text-xs px-2.5 py-1 rounded-lg"
                  >
                    {tag.name}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </section>

      <section className="container px-5 py-8 mx-auto">

        <div className="flex flex-wrap -m-4">
          <div className="p-2 w-full">
            <div className="border border-gray-200 rounded-md bg-white shadow-sm">
              {statement.image_path && (
                <div className="flex items-center justify-center pb-4">
                  <Image
                    src={getImagePath(statement.image_path)}
                    alt={statement.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover object-center rounded-t-md"
                  />
                </div>
              )}
              <div className="pb-4 px-4">
                <h3 className="font-bold mb-2 text-gray-900">{statement.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {statement.content}
                </p>
                <div className="text-xs text-gray-500">
                  {statement.statement_date
                    ? new Date(statement.statement_date).toLocaleDateString('ja-JP')
                    : '日付なし'
                  }
                </div>
                {statement.evidence_url && (
                  <div className="mt-2 truncate text-sm">
                    <a href={statement.evidence_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {statement.evidence_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* コメントセクション */}
      <section className="container px-5 py-8 mx-auto">
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">コメント</h2>
          
          {/* コメント投稿フォーム */}
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded-lg"
                rows={3}
                placeholder="コメントを入力してください"
                maxLength={1000}
              />
            </div>
            {commentError && (
              <p className="text-red-500 mb-2">{commentError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
            >
              {isSubmitting ? '投稿中...' : 'コメントを投稿'}
            </button>
          </form>

          {/* コメント一覧 */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-800">{comment.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(comment.created_at).toLocaleString('ja-JP')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
