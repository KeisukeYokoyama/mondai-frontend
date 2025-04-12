'use client';

import { Suspense } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { statementAPI } from '@/utils/supabase/statements';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Statement } from '@/utils/supabase/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { politicianAPI } from '@/utils/supabase/politicians';
import type { SpeakerWithRelations } from '@/utils/supabase/types';
import imageCompression from 'browser-image-compression';
import Link from 'next/link';

// 確認ダイアログのコンポーネント
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[45%]">
      <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 z-10 shadow-xl/30">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-red-500 mb-6 text-sm">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="min-w-28 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-indigo-500 rounded-lg border border-gray-200 hover:bg-indigo-600"
          >
            追加する
          </button>
        </div>
      </div>
    </div>
  );
}

// サンプル画像モーダルのコンポーネント
function SampleImageModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg p-4 max-w-3xl w-full mx-4 z-10 shadow-xl/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">表示例</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-gray-900 text-sm mb-4">ピンク色の文字箇所に「発言内容」が表示されます。</p>
          <div className="relative w-full h-[80vh] max-h-[72vh]">
            <Image
            src="/images/form_sample.jpg"
            alt="サンプル画像"
            fill
            className="object-contain"
          />
          </div>
        </div>
      </div>
    </div>
  );
}

// 画像パスを処理するヘルパー関数を追加
const getImagePath = (path: string | null) => {
  if (!path) return '/images/default-avatar.png';
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return '/images/default-avatar.png';
  }

  // パスからファイル名を抽出
  const filename = path.split('/').pop();
  if (!filename) {
    return '/images/default-avatar.png';
  }

  return `${supabaseUrl}/storage/v1/object/public/politicians/${filename}`;
};

function CreateStatementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const speaker_id = searchParams.get('speaker_id');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading } = useAuth();
  const [politician, setPolitician] = useState<SpeakerWithRelations | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tagToAdd, setTagToAdd] = useState('');
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

  // すべてのuseStateをトップレベルに移動
  const [formData, setFormData] = useState({
    title: '',
    statement_date: '',
    content: '',
    speaker_id: speaker_id,
    evidence_url: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: number, name: string }[]>([]);
  const [newTag, setNewTag] = useState('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showOptions, setShowOptions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ログインチェック
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      router.push('/auth');
    }
  }, [user, loading, router]);

  // タグ一覧を取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');

        if (error) throw error;
        setAvailableTags(data);
      } catch (error) {
        console.error('タグの取得に失敗しました', error);
        showToastMessage('タグの取得に失敗しました');
      }
    };

    // ユーザーがログインしている場合のみタグを取得
    if (user) {
      fetchTags();
    }
  }, [user]);

  // 政治家の詳細情報を取得
  useEffect(() => {
    const fetchPolitician = async () => {
      if (!speaker_id) return;

      try {
        const { data, error } = await politicianAPI.getDetail(speaker_id);
        if (error) throw new Error(error);
        setPolitician(data);
      } catch (err) {
        console.error('政治家データの取得に失敗しました:', err);
      }
    };

    fetchPolitician();
  }, [speaker_id]);

  // ローディング中または未ログインの場合のレンダリング
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Toastを表示する関数を修正
  const showToastMessage = (message: string, type: 'success' | 'error' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage('');
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 画像処理の共通関数
  const processFile = async (file: File) => {
    // ファイルタイプの検証
    if (!file.type.match('image/(jpeg|png|webp)')) {
      showToastMessage('PNG、JPG、またはWebP形式の画像のみアップロード可能です');
      return;
    }

    // ファイルサイズの検証（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      showToastMessage('ファイルサイズは5MB以下にしてください');
      return;
    }

    try {
      // 画像圧縮のオプション設定
      const options = {
        maxSizeMB: 2,
        maxWidth: 1200,
        maxHeight: 2400,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8
      };

      // 画像の圧縮とリサイズ
      const compressedFile = await imageCompression(file, options);
      
      setImage(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('画像の処理に失敗しました:', error);
      showToastMessage('画像の処理に失敗しました');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  // ドラッグ＆ドロップのイベントハンドラ
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 子要素へのドラッグを検出するために、関連ターゲットをチェック
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement | HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    // 確認ダイアログを表示するために状態を設定
    setTagToAdd(newTag.trim());
    setShowConfirmDialog(true);
  };

  // タグ追加の確認後の処理
  const confirmAddTag = async () => {
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: tagToAdd })
        .select()
        .single();

      if (error) throw error;

      setAvailableTags([...availableTags, data]);
      setSelectedTags([...selectedTags, data.id]);
      setNewTag('');
      showToastMessage('タグを追加しました', 'success');
    } catch (error: unknown) {
      showToastMessage('タグの追加に失敗しました');
      console.error('タグの追加に失敗しました', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('送信ボタンがクリックされました');

    if (!user) {
      console.log('ユーザーが認証されていません');
      return;
    }

    if (!speaker_id) {
      console.log('政治家IDが指定されていません');
      return;
    }

    try {
      const supabase = createClientComponentClient();

      // 画像のアップロード処理
      let image_path = null;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('statements')
          .upload(filePath, image);

        if (uploadError) {
          throw uploadError;
        }

        // 画像のパスを設定
        image_path = filePath;
      }

      const statementData: Omit<Statement, 'id' | 'created_at' | 'updated_at'> = {
        title: formData.title,
        statement_date: formData.statement_date || null,
        content: formData.content,
        speaker_id: speaker_id as string,
        evidence_url: formData.evidence_url || '',
        user_id: user.id as string,
        image_path: image_path
      };

      console.log('送信するデータ:', statementData);
      const { data: statement, error: statementError } = await supabase
        .from('statements')
        .insert([statementData])
        .select()
        .single();

      if (statementError) throw statementError;
      console.log('登録結果:', statement);

      // タグの関連付け
      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase
          .from('statement_tag')
          .insert(
            selectedTags.map(tagId => ({
              statement_id: statement.id,
              tag_id: tagId
            }))
          );

        if (tagError) throw tagError;
        console.log('タグの関連付けが完了しました');
      }

      router.push(`/politicians/${speaker_id}`);
    } catch (error) {
      console.error('発言の登録に失敗しました:', error);
      showToastMessage('発言の登録に失敗しました');
    }
  };

  // 登録確認モーダルを表示
  const handleRegisterClick = () => {
    setShowRegisterConfirm(true);
  };

  // 登録確認モーダルでキャンセルをクリック
  const handleRegisterCancel = () => {
    setShowRegisterConfirm(false);
  };

  // 登録確認モーダルで登録をクリック
  const handleRegisterConfirm = async (e: React.FormEvent) => {
    setShowRegisterConfirm(false);
    await handleSubmit(e);
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      {/* 確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmAddTag}
        title={`「${tagToAdd}」というタグを追加しますか？`}
        message={`追加する前に「${tagToAdd}」という名前の類似タグがないか確認してください。`}
      />

      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className={`${
            toastType === 'success' 
              ? 'bg-green-50 border-green-400 text-green-700' 
              : 'bg-red-50 border-red-400 text-red-700'
            } px-6 py-3 min-w-72 rounded-md shadow-lg max-w-md animate-fade-in border`}>
            {toastMessage}
          </div>
        </div>
      )}

      {/* サンプル画像モーダル */}
      <SampleImageModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
      />

      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>

      <div className="container mx-auto px-4 pt-4">
        {politician && (
          <div className="max-w-screen-md mx-auto bg-gray-700 rounded-t-md">
            <div className="p-4 flex items-center">
              {politician.image_path && (
                <div className="mr-4 ml-2 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={getImagePath(politician.image_path)}
                      alt={`${politician.last_name}${politician.first_name}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover border-2 border-white rounded-full"
                    />
                  </div>
                </div>
              )}
              <div>
                <h2 className="font-bold text-lg text-white">
                  {politician.last_name}{politician.first_name}の問題発言を登録
                </h2>
                <p className="text-xs text-white">
                  {politician.parties?.name || '無所属'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-screen-md mx-auto bg-white p-6 rounded-b-md shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-600 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-6">
              {!imagePreview && (
                <div
                  className="flex items-center justify-center w-full"
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <label
                    htmlFor="dropzone-file"
                    className={`flex flex-col items-center justify-center w-full h-52 border-2 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'} border-dashed rounded-lg cursor-pointer`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">スクリーンショットを登録</span></p>
                      <svg className="w-8 h-8 mb-3 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">クリックしてアップロード</span><br />またはドラッグ＆ドロップ</p>
                      <p className="text-xs text-gray-500">PNG, JPG (最大 1200x1200px)</p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/png,image/jpeg"
                      className="hidden"
                    />
                  </label>
                </div>
              )}
              {imagePreview && (
                <div className="mt-4">
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreview}
                      alt="プレビュー"
                      width={400}
                      height={300}
                      className="rounded-lg object-contain w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -top-3 -right-3 bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 block">
                <div className="flex justify-between items-center">
                  <div>
                    発言内容 <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
                  </div>
                  <Link 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowSampleModal(true);
                    }} 
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <small>表示例を見る</small>
                  </Link>
                </div>
              </label>
              <textarea
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                placeholder="発言内容を入力してください"
              />
              <small className="text-gray-500">{politician?.last_name}{politician?.first_name}が●●●という発言をしましたと表示されます</small>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 block">
                タグ <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {availableTags.map(tag => (
                  <label key={tag.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag.id]);
                        } else {
                          setSelectedTags(selectedTags.filter(id => id !== tag.id));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">{tag.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="タグを追加"
                  className="w-2/3 px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  追加
                </button>
              </div>
              <small className="text-gray-500 block -mt-1">類似するタグがない場合に追加してください</small>
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900"
              >
                <span className="mr-2 text-blue-700 font-semibold">暴言詳細を登録する</span>
                <svg
                  className={`text-blue-700 w-4 h-4 transform transition-transform ${showOptions ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showOptions && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 text-sm font-bold mb-2 block">
                    発言日 <span className="bg-gray-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">任意</span>
                  </label>
                  <input
                    type="date"
                    name="statement_date"
                    value={formData.statement_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-bold mb-2 block">
                    内容 <span className="bg-gray-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">任意</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-bold mb-2 block">
                    エビデンスのURL <span className="bg-gray-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">任意</span>
                  </label>
                  <input
                    type="url"
                    name="evidence_url"
                    value={formData.evidence_url}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?xxx"
                    className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <small className="text-gray-500">
                    発言の証拠となるURLを入力してください。
                  </small>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4 mt-10">
              <button
                type="button"
                onClick={() => router.back()}
                className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                キャンセル
              </button>
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="min-w-28 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-indigo-500 rounded-lg border border-gray-200 hover:bg-indigo-600"
                >
                  登録する
                </button>
            </div>
          </form>
        </div>
      </div>

      {/* 登録確認モーダル */}
      {showRegisterConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[45%] border-2">
          <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-xl" onClick={handleRegisterCancel}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-screen-md w-full mx-4 z-10 shadow-xl/30">
            <h3 className="font-semibold mb-4">登録確認</h3>
            <p className="mb-4 text-sm">登録内容を確認して登録してください。このスクショを登録しますか？</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRegisterCancel}
                className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                onClick={handleRegisterConfirm}
                className="min-w-28 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-indigo-500 rounded-lg border border-gray-200 hover:bg-indigo-600"
              >
                登録
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default function CreateStatement() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <CreateStatementContent />
    </Suspense>
  );
}
