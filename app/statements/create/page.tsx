'use client';

import { Suspense } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { statementAPI } from '@/utils/supabase/statements';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import { getSupabaseClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Statement } from '@/utils/supabase/types';
import { politicianAPI } from '@/utils/supabase/politicians';
import type { SpeakerWithRelations } from '@/utils/supabase/types';
import imageCompression from 'browser-image-compression';
import Link from 'next/link';
import { createWorker } from 'tesseract.js';
import OpenAI from 'openai';

interface UploadProgressEvent {
  loaded: number;
  total: number;
}

interface AIResponse {
  title: string;
  content: string;
  statement_date: string;
}

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
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-28">
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
  const speaker_type = searchParams.get('speaker_type');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagSearchRef = useRef<HTMLDivElement>(null);
  const relatedSearchRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const [politician, setPolitician] = useState<SpeakerWithRelations | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tagToAdd, setTagToAdd] = useState('');
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [searchTagQuery, setSearchTagQuery] = useState('');
  const [showTagResults, setShowTagResults] = useState(false);
  const [frequentTags, setFrequentTags] = useState<{ id: number; name: string; count: number }[]>([]);

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
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [error, setError] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: number, name: string }[]>([]);
  const [newTag, setNewTag] = useState('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showOptions, setShowOptions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [relatedSpeakers, setRelatedSpeakers] = useState<SpeakerWithRelations[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpeakerWithRelations[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [processingStep, setProcessingStep] = useState<'idle' | 'uploading' | 'ocr' | 'ai'>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2秒

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
        const { data, error } = await getSupabaseClient().from('tags')
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

  // 頻繁に使用されるタグを取得
  useEffect(() => {
    const fetchFrequentTags = async () => {
      if (!user) return;

      try {
        const { data, error } = await getSupabaseClient().from('statement_tag')
          .select(`
            tag_id,
            tags (
              id,
              name
            )
          `)
          .limit(100);

        if (error) throw error;

        // タグの使用回数をカウント
        const tagCounts = data.reduce((acc: { [key: string]: number }, curr) => {
          const tagId = curr.tag_id;
          acc[tagId] = (acc[tagId] || 0) + 1;
          return acc;
        }, {});

        // 頻繁に使用されるタグを抽出
        const frequentTagsData = Object.entries(tagCounts)
          .map(([tagId, count]) => {
            const tagData = data.find(d => d.tag_id === parseInt(tagId))?.tags as { id: number; name: string } | undefined;
            if (!tagData) return null;
            return {
              id: tagData.id,
              name: tagData.name,
              count: count
            };
          })
          .filter((tag): tag is { id: number; name: string; count: number } => tag !== null)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setFrequentTags(frequentTagsData);
      } catch (error) {
        console.error('頻出タグの取得に失敗しました:', error);
      }
    };

    fetchFrequentTags();
  }, [user]);

  // タグ検索結果をフィルタリング
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTagQuery.toLowerCase())
  );

  // 外部クリックを検知するためのuseEffectを追加
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // タグ検索プルダウンの外部クリック処理
      if (tagSearchRef.current && !tagSearchRef.current.contains(event.target as Node)) {
        setShowTagResults(false);
      }
      // 関連人物検索プルダウンの外部クリック処理
      if (relatedSearchRef.current && !relatedSearchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
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

  // ファイルサイズをチェックする関数
  const checkFileSize = (file: File, maxSize: number) => {
    const fileSize = file.size / (1024 * 1024); // MBに変換
    return fileSize <= maxSize;
  };

  // 動画の再生時間をチェックする関数
  const checkVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration <= 220); // 220秒以下かチェック
      };

      video.src = URL.createObjectURL(file);
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
        maxSizeMB: 1.5,
        maxWidth: 1200,
        maxHeight: 1800,
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

      // OCR処理を実行
      setProcessingStep('ocr');
      await processOCR(compressedFile);

    } catch (error) {
      console.error('画像の処理に失敗しました:', error);
      showToastMessage('画像の処理に失敗しました');
      setProcessingStep('idle');
    }
  };

  // OCR処理を行う関数を修正
  const processOCR = async (imageFile: File) => {
    try {
      const worker = await createWorker('jpn');
      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();
      
      // テキストの整形処理
      const formattedText = text
        .replace(/\s+/g, '')
        .trim();

      // テキストが検出されない場合の処理
      if (!formattedText || formattedText.length < 10) {
        showToastMessage('テキストを検出できませんでした。引用元の投稿と問題発言を手動で入力してください。', 'warning');
        setFormData(prev => ({
          ...prev,
          title: '',
          content: '',
          statement_date: ''
        }));
        setProcessingStep('idle');
        return;
      }
      
      // AI処理を実行
      setProcessingStep('ai');
      await processWithAI(formattedText);
      
    } catch (error) {
      console.error('OCR処理エラー:', error);
      showToastMessage('OCR処理に失敗しました。手動で入力してください。');
      setProcessingStep('idle');
    }
  };

  // OpenAIでテキストを処理する関数を追加
  const processWithAI = async (text: string, retryAttempt = 0): Promise<void> => {
    try {
      // リトライ回数が最大値を超えた場合、早期リターン
      if (retryAttempt >= MAX_RETRIES) {
        showToastMessage('最大リトライ回数を超えました。手動で入力してください。', 'error');
        setFormData(prev => ({
          ...prev,
          title: text.split('\n')[0] || '',
          content: text,
          statement_date: ''
        }));
        setProcessingStep('idle');
        setRetryCount(0);
        setIsProcessingAI(false);
        return;
      }

      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "あなたは政治家や言論人の問題発言を分析・指摘する専門家です。与えられたテキストから重要な情報を抽出し、指定されたJSON形式で出力してください。"
          },
          {
            role: "user",
            content: `次の政治家や言論人のXでの問題発言を分析し、指定されたJSON形式で出力してください：

■元のテキスト：
${text}

■出力フォーマット：
{
  "title": "投稿の核心的で印象的なフレーズを抽出し、原文のまま出力",
  "content": "原文を引用しつつ、自然な日本語で300文字以内で問題点を指摘して要約",
  "statement_date": "投稿に日付がある場合はYYYY-MM-DD形式で抽出、なければ「不明」"
}

■注意点：
- titleは核心的で印象的なフレーズを100文字以内で出力
- フロントで「発言者は{title}という発言をしました」と処理する
- contentは要約文をそのまま出力、無理に長くする必要はありませんが、投稿の背景がわかるようにしてください
- statement_dateは日付のみを出力（YYYY-MM-DD形式）`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const processedText = response.choices[0].message.content;
      
      try {
        const parsedResponse = JSON.parse(processedText || '{}') as AIResponse;
        
        setFormData(prev => ({
          ...prev,
          title: parsedResponse.title || '',
          content: parsedResponse.content || '',
          statement_date: parsedResponse.statement_date !== '不明' ? parsedResponse.statement_date : ''
        }));
        
        showToastMessage('AIによるテキスト処理が完了しました', 'success');
        setRetryCount(0);
        setProcessingStep('idle');
        setIsProcessingAI(false);
      } catch (parseError) {
        console.error('JSON解析エラー:', parseError);
        showToastMessage('テキストの解析に失敗しました');
        setProcessingStep('idle');
        setIsProcessingAI(false);
      }
    } catch (error: unknown) {
      console.error('AI処理エラー:', error);
      
      // クォータ制限エラーの場合
      if (error instanceof Error && error.message?.includes('quota')) {
        showToastMessage('AI処理が一時的に利用できません。手動で入力してください。', 'error');
        
        // フォールバック処理：ユーザーに手動入力を促す
        setFormData(prev => ({
          ...prev,
          title: text.split('\n')[0] || '',
          content: text,
          statement_date: ''
        }));
        
        setProcessingStep('idle');
        setRetryCount(0);
        setIsProcessingAI(false);
        return;
      }
      
      // レート制限エラーの場合
      if (error instanceof Error && error.message?.includes('429')) {
        const delay = Math.pow(2, retryAttempt) * 1000; // 指数バックオフ
        setRetryCount(retryAttempt + 1);
        
        // リトライ回数が少ない場合は再試行
        if (retryAttempt < MAX_RETRIES) {
          showToastMessage(`API制限に達しました。${delay/1000}秒後に再試行します... (${retryAttempt + 1}/${MAX_RETRIES})`, 'warning');
          await new Promise(resolve => setTimeout(resolve, delay));
          return processWithAI(text, retryAttempt + 1);
        } else {
          showToastMessage('最大リトライ回数を超えました。手動で入力してください。', 'error');
          setFormData(prev => ({
            ...prev,
            title: text.split('\n')[0] || '',
            content: text,
            statement_date: ''
          }));
          setProcessingStep('idle');
          setRetryCount(0);
          setIsProcessingAI(false);
        }
      } else {
        // その他のエラーの場合
        showToastMessage('AIによるテキスト処理に失敗しました', 'error');
        setProcessingStep('idle');
        setRetryCount(0);
        setIsProcessingAI(false);
      }
    }
  };

  // handleImageChange関数を修正
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProcessingStep('uploading');

      try {
        // ファイルタイプのチェック
        if (!file.type.match('image/(jpeg|png|webp)')) {
          showToastMessage('PNG、JPG、またはWebP形式の画像のみアップロード可能です');
          return;
        }

        // ファイルサイズのチェック (5MB制限)
        if (!checkFileSize(file, 6)) {
          showToastMessage('ファイルサイズは5MB以下にしてください');
          return;
        }

        // 画像の圧縮とリサイズ
        const options = {
          maxSizeMB: 1.5,
          maxWidth: 1200,
          maxHeight: 1800,
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: 0.8
        };

        const compressedFile = await imageCompression(file, options);
        setImage(compressedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);

        // OCR処理を実行
        setProcessingStep('ocr');
        await processOCR(compressedFile);
      } catch (error) {
        console.error('画像処理エラー:', error);
        showToastMessage('画像の処理中にエラーが発生しました');
        setProcessingStep('idle');
      }
    } else {
      setImage(null);
      setImagePreview(null);
      setProcessingStep('idle');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleAddTag = () => {
    if (!searchTagQuery.trim()) return;
    setTagToAdd(searchTagQuery.trim());
    setShowConfirmDialog(true);
  };

  // タグ追加の確認後の処理
  const confirmAddTag = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: tagToAdd })
        .select()
        .single();

      if (error) throw error;

      setAvailableTags([...availableTags, data]);
      setSelectedTags([...selectedTags, data.id]);
      setSearchTagQuery('');
      setShowTagResults(false);
      showToastMessage('タグを追加しました', 'success');
    } catch (error: unknown) {
      showToastMessage('タグの追加に失敗しました');
      console.error('タグの追加に失敗しました', error);
    }
  };

  // 検索機能を追加
  const searchSpeakers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await getSupabaseClient().from('speakers')
        .select(`
          *,
          parties (
            name
          )
        `)
        .or(`last_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name_kana.ilike.%${query}%,first_name_kana.ilike.%${query}%`)
        .limit(30);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('発言者の検索に失敗しました:', error);
      showToastMessage('発言者の検索に失敗しました');
    } finally {
      setIsSearching(false);
    }
  };

  // 関連人物を追加する関数
  const addRelatedSpeaker = (speaker: SpeakerWithRelations) => {
    if (!relatedSpeakers.find(s => s.id === speaker.id)) {
      setRelatedSpeakers([...relatedSpeakers, speaker]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // 関連人物を削除する関数
  const removeRelatedSpeaker = (speakerId: string) => {
    setRelatedSpeakers(relatedSpeakers.filter(s => s.id !== speakerId));
  };

  // 動画ファイル処理の関数を修正
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessing(true);

      try {
        // ファイルタイプのチェック
        if (!file.type.startsWith('video/')) {
          showToastMessage('動画ファイルのみアップロード可能です');
          return;
        }

        // ファイルサイズのチェック (10MB制限)
        if (!checkFileSize(file, 10)) {
          showToastMessage('ファイルサイズは10MB以下にしてください');
          return;
        }

        // 動画の再生時間をチェック
        const isValidDuration = await checkVideoDuration(file);
        if (!isValidDuration) {
          showToastMessage('動画の長さは220秒以下にしてください');
          return;
        }

        // サムネイル生成
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.preload = 'metadata';

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            // 動画の長さの1秒後のフレームを使用（より良いサムネイルを得るため）
            video.currentTime = Math.min(1, video.duration);
          };
          video.onseeked = () => {
            resolve(true);
          };
        });

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // メモリリーク防止
        URL.revokeObjectURL(video.src);

        // サムネイルをBlobに変換
        const thumbnailBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob as Blob);
          }, 'image/jpeg', 0.7);
        });

        // サムネイルをFileオブジェクトに変換
        const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });

        setVideo(file);
        setVideoPreview(URL.createObjectURL(file));
        // サムネイルをstateに保存
        setVideoThumbnail(thumbnailFile);
      } catch (error) {
        console.error('動画処理エラー:', error);
        showToastMessage('動画の処理中にエラーが発生しました');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setVideo(null);
      setVideoPreview(null);
      setVideoThumbnail(null);
    }
  };

  // メディアタイプを切り替えた時の処理を追加
  const handleMediaTypeChange = (type: 'image' | 'video') => {
    // 現在のメディアをクリア
    if (type === 'image') {
      setVideo(null);
      setVideoPreview(null);
    } else {
      setImage(null);
      setImagePreview(null);
    }
    setMediaType(type);
  };

  // 登録ボタンクリック時の処理を修正
  const handleRegisterClick = () => {
    // バリデーションチェック
    if (!user) {
      setError('ユーザーが認証されていません');
      return;
    }

    if (!speaker_id) {
      setError('政治家IDが指定されていません');
      return;
    }

    // メディアのいずれかが必要
    if (!image && !video) {
      showToastMessage('スクショまたは動画を登録してください');
      return;
    }

    if (!formData.title.trim()) {
      showToastMessage('発言内容を入力してください');
      return;
    }

    if (selectedTags.length === 0) {
      showToastMessage('タグを1つ以上選択してください');
      return;
    }

    // バリデーション通過後にモーダルを表示
    setShowRegisterConfirm(true);
  };

  // 登録確認モーダルで登録をクリック
  const handleRegisterConfirm = async (e: React.FormEvent) => {
    setShowRegisterConfirm(false);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      setUploadState('uploading');
      setUploadStatusText('アップロードの準備中...');

      // 画像のアップロード処理
      let image_path = null;
      if (image) {
        setUploadStatusText('画像をアップロード中...');
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('statements')
          .upload(filePath, image);

        if (uploadError) throw uploadError;
        image_path = filePath;
      }

      // 動画のアップロード処理
      let video_path = null;
      let video_thumbnail_path = null;
      if (video) {
        setUploadStatusText('動画をアップロード中...');
        const fileExt = video.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('videos')
          .upload(filePath, video);

        if (uploadError) throw uploadError;
        video_path = filePath;

        // サムネイルのアップロード
        if (videoThumbnail) {
          setUploadStatusText('サムネイルを生成中...');
          const thumbnailFileName = `${Math.random()}.jpg`;
          const thumbnailPath = `${user.id}/${thumbnailFileName}`;

          const { data: thumbnailData, error: thumbnailError } = await supabase
            .storage
            .from('video-thumbnails')
            .upload(thumbnailPath, videoThumbnail);

          if (thumbnailError) throw thumbnailError;
          video_thumbnail_path = thumbnailPath;
        }
      }

      setUploadState('processing');
      setUploadStatusText('データを保存中...');

      // statementの登録
      const statementData = {
        title: formData.title,
        statement_date: formData.statement_date || null,
        content: formData.content,
        speaker_id: speaker_id as string,
        evidence_url: formData.evidence_url || '',
        user_id: user.id as string,
        image_path: image_path,
        video_path: video_path,
        video_thumbnail_path: video_thumbnail_path
      };

      console.log('送信するデータ:', statementData);
      const { data: statement, error: statementError } = await supabase
        .from('statements')
        .insert([statementData])
        .select()
        .single();

      if (statementError) {
        console.error('Statement登録エラー:', statementError);
        throw statementError;
      }

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

      // 関連人物の登録
      if (statement && relatedSpeakers.length > 0) {
        const { error: relatedError } = await supabase
          .from('statement_speaker')
          .insert(
            relatedSpeakers.map(speaker => ({
              statement_id: statement.id,
              speaker_id: speaker.id
            }))
          );

        if (relatedError) {
          console.error('関連人物の登録に失敗しました:', relatedError);
          showToastMessage('関連人物の登録に失敗しました');
          return;
        }
      }

      setUploadState('complete');
      console.log('取得したstatement:', statement);

      try {
        // speaker_typeを取得
        const { data: speakerData, error: speakerError } = await getSupabaseClient().from('speakers')
          .select('speaker_type')
          .eq('id', speaker_id)
          .single();

        if (speakerError) {
          console.error('発言者の情報取得に失敗しました:', speakerError);
          showToastMessage('リダイレクトに失敗しました');
          return;
        }

        console.log('取得したspeaker_type:', speakerData.speaker_type);

        // speaker_typeに基づいてリダイレクト
        if (speakerData.speaker_type === 1) {
          console.log('政治家ページにリダイレクト');
          router.push(`/politicians/${speaker_id}`);
        } else {
          console.log('コメンテーターページにリダイレクト');
          router.push(`/commentators/${speaker_id}`);
        }
      } catch (error) {
        console.error('リダイレクト処理でエラーが発生しました:', error);
        showToastMessage('リダイレクトに失敗しました');
      }
    } catch (error) {
      setUploadState('idle');
      console.error('発言の登録に失敗しました:', error);
      showToastMessage('発言の登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleRegisterClick();
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      {/* 確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmAddTag}
        title={`「${tagToAdd}」というタグを追加しますか？`}
        message="追加する前に類似タグがないか確認してください。"
      />

      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className={`${toastType === 'success'
              ? 'bg-green-50 border-green-400 text-green-700'
              : toastType === 'error'
                ? 'bg-red-50 border-red-400 text-red-700'
                : 'bg-yellow-50 border-yellow-400 text-yellow-700'
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

      <div className="container mx-auto px-4 py-4">
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

          <div className="mb-4 bg-amber-50 px-4 py-3 rounded-md border border-amber-300">
            <p className="text-xs text-amber-900">
              AIによる自動化の試用運転中です。<span className="text-red-600">タグは自動化対象外</span>です。投稿内容をご確認の上、おかしなところは編集してください。
            </p>
          </div>

          {/* APIキー未設定時の警告 */}
          {!process.env.NEXT_PUBLIC_OPENAI_API_KEY && (
            <div className="mb-4 bg-red-50 px-4 py-3 rounded-md border border-red-300">
              <p className="text-xs text-red-900">
                AI処理の設定が完了していません。画像のテキスト認識のみ実行されます。
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メディアアップロードセクション */}
            <div className="mb-6">
              <div className="flex mb-4">
                <button
                  type="button"
                  onClick={() => handleMediaTypeChange('image')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${mediaType === 'image'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-700'
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    スクショ
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleMediaTypeChange('video')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border ${mediaType === 'video'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-700'
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    動画
                  </div>
                </button>
              </div>

              {/* 画像アップロード */}
              {mediaType === 'image' && (
                <>
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
                        className={`flex flex-col items-center justify-center w-full h-52 border-2 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                          } border-dashed rounded-lg cursor-pointer`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">スクショをアップロード</span>
                          </p>
                          <svg className="w-8 h-8 mb-3 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">クリックしてアップロード</span>
                            <br />またはドラッグ＆ドロップ
                          </p>
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
                </>
              )}

              {/* 動画アップロード */}
              {mediaType === 'video' && (
                <>
                  {!videoPreview && (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="video-upload"
                        className={`flex flex-col items-center justify-center w-full h-52 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
                              <p className="text-sm text-gray-500">処理中...</p>
                            </>
                          ) : (
                            <>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">動画をアップロード</span>
                              </p>
                              <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">クリックして選択</span>
                              </p>
                              <p className="text-xs">
                                <span className="text-red-500">10MB以下</span>,
                                <span className="text-red-500"> 220秒以内</span>
                                <span className="text-gray-500">の動画</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">MP4, WebM (推奨)</p>
                            </>
                          )}
                        </div>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="hidden"
                          disabled={isProcessing}
                        />
                      </label>
                    </div>
                  )}
                  {videoPreview && (
                    <div className="mt-4">
                      <div className="relative w-full">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setVideo(null);
                            setVideoPreview(null);
                          }}
                          className="absolute -top-3 -right-3 bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </>
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

              {/* 選択されたタグの表示 */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedTags.map(tagId => {
                  const tag = availableTags.find(t => t.id === tagId);
                  return tag ? (
                    <div
                      key={tag.id}
                      className="flex items-center bg-indigo-100 rounded-full px-3 py-1 mb-6"
                    >
                      <span className="text-sm text-indigo-700">{tag.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTags(selectedTags.filter(id => id !== tag.id))}
                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null;
                })}
              </div>

              {/* タグ検索フォーム */}
              <div className="relative -mt-2" ref={tagSearchRef}>
                <input
                  type="text"
                  value={searchTagQuery}
                  onChange={(e) => {
                    setSearchTagQuery(e.target.value);
                    setShowTagResults(true);
                  }}
                  onFocus={() => setShowTagResults(true)}
                  placeholder="タグを検索 or 追加"
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                />

                {/* 検索結果のドロップダウン */}
                {showTagResults && (searchTagQuery || filteredTags.length > 0) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredTags.length > 0 ? (
                      filteredTags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            if (!selectedTags.includes(tag.id)) {
                              setSelectedTags([...selectedTags, tag.id]);
                            }
                            setSearchTagQuery('');
                            setShowTagResults(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {tag.name}
                        </button>
                      ))
                    ) : searchTagQuery ? (
                      <div className="px-4 py-2 text-sm text-gray-500 flex items-center justify-between">
                        <span>「{searchTagQuery}」を新しいタグとして追加</span>
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="ml-2 text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded-md text-sm"
                        >
                          追加
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* よく使用されるタグ */}
            {frequentTags.length > 0 && (
              <div className="mb-4 -mt-2">
                <div className="flex items-center">
                  <span className="text-sm pb-2 text-gray-900 mr-2 flex-shrink-0">
                    人気のタグ:
                  </span>
                  <div className="flex-1 overflow-x-auto pb-2 hide-scrollbar">
                    <div className="flex gap-2">
                      {frequentTags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            if (!selectedTags.includes(tag.id)) {
                              setSelectedTags([...selectedTags, tag.id]);
                            }
                          }}
                          className={`text-sm px-3 py-1 rounded-full flex-shrink-0 ${selectedTags.includes(tag.id)
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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

                <div>
                  <label className="text-gray-700 text-sm font-bold mb-2 block">
                    関連人物 <span className="bg-gray-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">任意</span>
                  </label>

                  {/* 選択された関連人物の表示 */}
                  {relatedSpeakers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {relatedSpeakers.map(speaker => (
                        <div
                          key={speaker.id}
                          className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                        >
                          <span className="text-sm">
                            {speaker.last_name}{speaker.first_name}
                            {speaker.parties?.name && ` (${speaker.parties.name})`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRelatedSpeaker(speaker.id)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 検索フォーム */}
                  <div className="relative" ref={relatedSearchRef}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchSpeakers(e.target.value);
                      }}
                      placeholder="名前を入力して検索"
                      className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                    />

                    {/* 検索結果のドロップダウン */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {searchResults.map(speaker => (
                          <button
                            key={speaker.id}
                            type="button"
                            onClick={() => addRelatedSpeaker(speaker)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                              <Image
                                src={speaker.image_path ? getImagePath(speaker.image_path) : '/images/default-avatar.png'}
                                alt={`${speaker.last_name}${speaker.first_name}`}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div>{speaker.last_name}{speaker.first_name}</div>
                              {speaker.parties?.name && (
                                <div className="text-xs text-gray-500">{speaker.parties.name}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 検索中のローディング表示 */}
                    {isSearching && (
                      <div className="absolute right-3 top-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                  <small className="text-gray-500">
                    発言に関連する人物を追加してください
                  </small>
                </div>
              </div>
            )}

            {/* プログレスバーの修正版 */}
            {uploadState !== 'idle' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{uploadStatusText}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${uploadState === 'complete'
                        ? 'bg-green-500 w-full'
                        : uploadState === 'processing'
                          ? 'bg-yellow-500 w-3/4'
                          : 'bg-indigo-500 w-1/2 animate-pulse'
                      }`}
                  ></div>
                </div>
              </div>
            )}

            {/* 登録ボタン */}
            <div className="flex justify-center space-x-4 mt-10">
              <button
                type="button"
                onClick={() => router.back()}
                className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                disabled={uploadState !== 'idle'}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleRegisterClick}
                disabled={uploadState !== 'idle'}
                className={`min-w-28 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-indigo-500 rounded-lg border border-gray-200 hover:bg-indigo-600 ${uploadState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {uploadState !== 'idle' ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    処理中...
                  </div>
                ) : (
                  '登録する'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 登録確認モーダル */}
      {showRegisterConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-28 border-2">
          <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-xl" onClick={() => setShowRegisterConfirm(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-screen-md w-full mx-4 z-10 shadow-xl/30">
            <h3 className="font-semibold mb-4">登録確認</h3>
            <p className="mb-4 text-sm">登録内容を確認して登録してください。このスクショを登録しますか？</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRegisterConfirm(false)}
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

      {(isProcessingOCR || isProcessingAI) && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-3"></div>
            <span className="text-gray-700">
              {isProcessingOCR ? 'OCR処理中...' : 'AIによるテキスト処理中...'}
            </span>
          </div>
        </div>
      )}

      {processingStep !== 'idle' && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {processingStep === 'uploading' && '画像を読み込み中'}
                  {processingStep === 'ocr' && 'テキスト処理中'}
                  {processingStep === 'ai' && 'AIによる分析中'}
                </span>
                <span className="text-sm text-gray-500">
                  {processingStep === 'uploading' && '1/3'}
                  {processingStep === 'ocr' && '2/3'}
                  {processingStep === 'ai' && '3/3'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    processingStep === 'uploading' ? 'w-1/3 bg-blue-500' :
                    processingStep === 'ocr' ? 'w-2/3 bg-indigo-500' :
                    'w-full bg-green-500'
                  }`}
                ></div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            </div>
            {retryCount > 0 && (
              <div className="mt-2 text-center text-sm text-yellow-600">
                再試行中... ({retryCount}/{MAX_RETRIES})
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />

      {/* スタイルを追加 */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
