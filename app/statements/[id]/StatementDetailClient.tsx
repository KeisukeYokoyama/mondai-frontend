'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { statementAPI } from '@/utils/supabase/statements';
import { commentAPI } from '@/utils/supabase/comments';
import type { StatementWithRelations, StatementTag, SpeakerWithRelations } from '@/utils/supabase/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { recordStatementView } from '@/utils/statementViews';
import RelatedStatements from '@/components/Statements/RelatedStatements';
import { useAuth } from '@/contexts/AuthContext';
import { FiShare } from "react-icons/fi";
import { RiLink } from "react-icons/ri";


interface Comment {
  id: string;
  content: string;
  created_at: string;
}

// URLをリンクに変換する関数
const convertUrlsToLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={index} className="break-all">{part}</span>;
  });
};

// 確認モーダルのコンポーネント
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  content
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-28">
      <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 z-10 shadow-xl/30">
        <h3 className="font-semibold mb-4">コメント投稿の確認</h3>
        <div className="whitespace-pre-wrap bg-gray-100 p-3 rounded mb-4 text-sm">
          {convertUrlsToLinks(content)}
        </div>
        <p className="mb-4 text-sm">
          <small>誹謗中傷、脅迫といった他人を傷つけるコメントを書き込もうとしていないか、ご確認ください。</small>
        </p>
        <p className="mb-4 text-sm">本当にこの内容で投稿しますか？</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="min-w-28 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-indigo-500 rounded-lg border border-gray-200 hover:bg-indigo-600"
          >
            投稿する
          </button>
        </div>
      </div>
    </div>
  );
}

// データの整形部分を修正
interface RelatedSpeakerData {
  speakers: SpeakerWithRelations;
}

// シェアボタンのコンポーネント
const ShareButton = ({ statementId, title, speaker }: { statementId: string; title: string; speaker: { last_name: string; first_name: string } }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const supabase = createClientComponentClient();
  const { user } = useAuth();
  const [statement, setStatement] = useState<StatementWithRelations | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('statements')
          .select(`
            *,
            speaker:speakers (*),
            tags:statement_tag (
              tags (*)
            ),
            related_speakers:statement_speaker (
              speakers (
                *,
                parties (
                  name
                )
              )
            )
          `)
          .eq('id', statementId)
          .single();

        if (error) {
          throw new Error(typeof error === 'object' && error !== null && 'message' in error
            ? error.message as string
            : '問題発言データの取得に失敗しました');
        }

        if (!data) {
          throw new Error('問題発言データが見つかりませんでした');
        }

        // データの整形
        const formattedData = {
          ...data,
          related_speakers: data.related_speakers.map((rel: RelatedSpeakerData) => rel.speakers)
        };

        setStatement(formattedData);
      } catch (err) {
        console.error('問題発言データの取得に失敗しました', err);
      }
    }
    loadData();
  }, [statementId, supabase]);

  const shareUrl = `${window.location.origin}/statements/${statementId}`;
  const tweetText = `${speaker.last_name}${speaker.first_name} が ${title} という発言をしました。`;

  const handleShare = async (type: 'twitter' | 'copy') => {
    if (type === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank');
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowShareOptions(false);
  };

  return (
    <div className="relative -mb-4 -mt-4">
      <button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <FiShare className="w-5 h-5" />
      </button>

      {showShareOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            シェア
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <RiLink className="w-4 h-4 mr-2" />
            {copied ? 'コピーしました！' : 'リンクをコピー'}
          </button>
        </div>
      )}
    </div>
  );
};

export default function StatementDetailClient({ id }: { id: string }) {
  const supabase = createClientComponentClient();
  const { user } = useAuth();
  const [statement, setStatement] = useState<StatementWithRelations | null>(null);
  const [relatedStatements, setRelatedStatements] = useState<StatementWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [commentToSubmit, setCommentToSubmit] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const commentsPerPage = 10;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('statements')
          .select(`
            *,
            speaker:speakers (*),
            tags:statement_tag (
              tags (*)
            ),
            related_speakers:statement_speaker (
              speakers (
                *,
                parties (
                  name
                )
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw new Error(typeof error === 'object' && error !== null && 'message' in error
            ? error.message as string
            : '問題発言データの取得に失敗しました');
        }

        if (!data) {
          throw new Error('問題発言データが見つかりませんでした');
        }

        // データの整形
        const formattedData = {
          ...data,
          related_speakers: data.related_speakers.map((rel: RelatedSpeakerData) => rel.speakers)
        };

        setStatement(formattedData);

        // 関連発言を取得
        const relatedStatementsData = await statementAPI.getRelated(formattedData);
        setRelatedStatements(relatedStatementsData);

        // 表示回数を記録
        await recordStatementView(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : '問題発言データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, supabase]);

  // コメントの読み込み
  useEffect(() => {
    async function loadComments() {
      try {
        // 総コメント数を取得
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('statement_id', id);

        if (count !== null) {
          setTotalComments(count);
          setTotalPages(Math.ceil(count / commentsPerPage));
        }

        // コメントを取得
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('statement_id', id)
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage - 1);

        if (error) throw error;

        setComments(data || []);
      } catch (err) {
        // エラーは無視して空の配列を設定
        setComments([]);
      }
    }

    if (statement) {
      loadComments();
    }
  }, [statement, id, supabase, currentPage]);

  // コメント投稿
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentToSubmit(newComment.trim());
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
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
            content: commentToSubmit,
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
      setShowConfirmDialog(false);

      // 投稿完了後にコメントセクションのトップにスクロール
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        const top = commentsSection.getBoundingClientRect().top + window.scrollY - 28;
        window.scrollTo({
          top,
          behavior: 'smooth'
        });
      }
    } catch (err) {
      setCommentError('コメントの投稿に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 画像パスを処理するヘルパー関数を修正
  const getImagePath = (path: string | null, type: 'politician' | 'statement' = 'politician') => {
    if (!path) return '/images/default-avatar.png';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return '/images/default-avatar.png';
    }

    // パスからファイル名を抽出
    const bucket = type === 'politician' ? 'politicians' : 'statements';
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  };

  // 動画パスを処理するヘルパー関数を修正
  const getVideoPath = (path: string | null, type: 'video' | 'thumbnail' = 'video') => {
    if (!path) return undefined;

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return undefined;
    }

    // バケットを選択
    const bucket = type === 'video' ? 'videos' : 'video-thumbnails';
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  };

  // ページネーションのコンポーネント
  const Pagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const maxVisiblePages = 4;
    let visiblePages = pages;

    if (totalPages > maxVisiblePages) {
      const start = Math.max(0, Math.min(currentPage - 3, totalPages - maxVisiblePages));
      visiblePages = pages.slice(start, start + maxVisiblePages);
    }

    const handlePageClick = (page: number) => {
      setCurrentPage(page);
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        const top = commentsSection.getBoundingClientRect().top + window.scrollY - 28;
        window.scrollTo({
          top,
          behavior: 'smooth'
        });
      }
    };

    return (
      <div className="flex justify-center items-center space-x-2 my-4">
        {visiblePages[0] > 1 && (
          <>
            <button
              onClick={() => handlePageClick(1)}
              className="w-8 h-8 text-sm flex items-center justify-center border border-gray-200 bg-white"
            >
              1
            </button>
            {visiblePages[0] > 2 && <span className="px-2">...</span>}
          </>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`w-8 h-8 text-sm flex items-center justify-center border border-gray-200 ${currentPage === page ? 'bg-indigo-500 text-white' : 'bg-white'
              }`}
          >
            {page}
          </button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2">...</span>
            )}
            <button
              onClick={() => handlePageClick(totalPages)}
              className="w-8 h-8 text-sm flex items-center justify-center border border-gray-200 bg-white"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
    );
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  if (!statement) return <div>データが見つかりませんでした</div>;

  const renderTags = () => {
    if (!statement.tags || statement.tags.length === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-4 mx-auto items-center justify-center">
        {(statement.tags as StatementTag[]).map((item: StatementTag) => {
          const tag = item.tags;
          return (
            <div key={tag.id}>
              <Link
                href={`/topics/${tag.id}`}
                className="bg-white border border-gray-200 text-gray-900 text-sm px-3 py-1.5 rounded-full"
              >
                {tag.name}
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100 scroll-smooth">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto max-w-screen-lg">
          <Header />
        </div>
      </section>

      <section className="mt-5 pt-2 px-4">
        <div className="max-w-screen-md mx-auto flex flex-row items-center">
          <div className="flex flex-col mb-4 w-full">
            <h1 className="text-center">
              <Link href={`/politicians/${statement.speaker.id}`}>
                <span className="font-bold text-4xl text-emerald-600 leading-tight">
                  {statement.speaker.last_name}{statement.speaker.first_name}
                </span>
              </Link>
              <span className="text-gray-900 ml-1">
                が
              </span>
              <span className="font-bold text-4xl ml-1 text-red-400 leading-tight">
                {statement.title}
              </span>
              <span className="text-gray-900 ml-1">
                という発言をしました！
              </span>
            </h1>
          </div>
        </div>
        {renderTags()}
      </section>

      <section className="my-8 py-8 mx-auto bg-white">
        <div className="flex flex-wrap -m-4 justify-center">
          <div className="w-full">
            <div className="bg-white max-w-screen-md mx-auto">
              {/* 画像または動画の表示 */}
              {statement.image_path && (
                <div className="flex items-center justify-center">
                  <Image
                    src={getImagePath(statement.image_path, 'statement')}
                    alt={statement.title}
                    width={400}
                    height={300}
                    className="w-full h-full px-8"
                    priority={true}
                  />
                </div>
              )}
              {statement.video_path && (
                <div className="flex items-center justify-center px-8">
                  <video
                    src={getVideoPath(statement.video_path)}
                    poster={statement.video_thumbnail_path ? getVideoPath(statement.video_thumbnail_path, 'thumbnail') : undefined}
                    controls
                    className="w-full rounded-lg"
                    preload="metadata"
                    controlsList="nodownload"
                    playsInline
                  >
                    <p>お使いのブラウザは動画の再生に対応していません。</p>
                  </video>
                </div>
              )}
              <div className="px-8 my-4">
                <p className="text-gray-900 whitespace-pre-wrap mb-2 pt-2">
                  {statement.content}
                </p>
                {statement.statement_date && (
                  <div className="text-xs text-gray-500">
                    {new Date(statement.statement_date).toLocaleDateString('ja-JP')}の発言
                  </div>
                )}
                {statement.evidence_url && (
                  <div className="mt-2 truncate text-sm">
                    {convertUrlsToLinks(statement.evidence_url)}
                  </div>
                )}
                {user && (
                  <div className="flex justify-center mt-4">
                    <Link
                      href={`/statements/${statement.id}/edit`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      編集する
                    </Link>
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <ShareButton statementId={statement.id} title={statement.title} speaker={statement.speaker} />
                </div>
              </div>
              {statement?.related_speakers && statement.related_speakers.length > 0 && (
                <div className="px-8 pt-4">
                  <h2 className="text-xl font-bold mb-4">関連人物</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {statement.related_speakers.map((speaker: SpeakerWithRelations) => (
                      <Link 
                        key={speaker.id} 
                        href={`/politicians/${speaker.id}`}
                        className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        {speaker.image_path && (
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-gray-100">
                            <Image
                              src={getImagePath(speaker.image_path, 'politician')}
                              alt={`${speaker.last_name}${speaker.first_name}`}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-gray-900">{speaker.last_name}{speaker.first_name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 関連発言セクション */}
      {statement && (
        <RelatedStatements
          currentStatement={statement}
          relatedStatements={relatedStatements}
        />
      )}

      {/* コメントセクション */}
      <section className="container px-4 pb-4 mx-auto">
        <div id="comments-section" className="w-full max-w-screen-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">みんなのコメント</h2>
          <div className="flex justify-between items-center mb-4">
            <Link href="#comment-form" className="text-sm text-blue-700 hover:text-blue-600">
              コメントを書く
            </Link>
            <span className="text-sm text-gray-600">
              {totalComments}件
            </span>
          </div>
          {/* コメント一覧 */}
          <div className="space-y-3 mb-4">
            {comments.map((comment, index) => {
              const commentNumber = totalComments - ((currentPage - 1) * commentsPerPage + index);
              return (
                <div key={comment.id} className="bg-white py-4 px-4 rounded-sm shadow-sm">
                  <p className="text-xs text-gray-500">
                    #{commentNumber} {new Date(comment.created_at).toLocaleString('ja-JP')}
                    {/* <button className="text-xs ml-2 text-blue-700">
                      [通報]
                    </button>
                    <button className="text-xs ml-2 text-blue-700">
                      [返信]
                    </button> */}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap mt-2">
                    {convertUrlsToLinks(comment.content)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ページネーション */}
          <Pagination />

          {/* コメント投稿フォーム */}
          <div id="comment-form" className="mb-8 bg-white p-4 rounded-sm shadow-sm scroll-mt-20">
            <h2 className="text-xl font-bold mb-4">コメントを投稿</h2>
            <form onSubmit={handleSubmitComment}>
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  placeholder="コメントを入力してください"
                  maxLength={1000}
                />
              </div>
              {commentError && (
                <p className="text-red-500 mb-2">{commentError}</p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="min-w-28 py-2.5 px-5 mb-2 text-sm font-medium text-white focus:outline-none bg-indigo-500 rounded-lg border border-gray-200 hover:bg-indigo-600"
                >
                  {isSubmitting ? '投稿中...' : 'コメントを投稿'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 確認モーダル */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        content={commentToSubmit}
      />

      <Footer />
    </main>
  );
}
