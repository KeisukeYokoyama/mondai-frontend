'use client';

import { Suspense } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { statementAPI } from '@/utils/supabase/statements';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import { getSupabaseClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Statement } from '@/utils/supabase/types';
import { politicianAPI } from '@/utils/supabase/politicians';
import type { SpeakerWithRelations } from '@/utils/supabase/types';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

interface UploadProgressEvent {
  loaded: number;
  total: number;
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

// メディアアップロード関数の型定義
interface UploadMediaResult {
  data: {
    path: string;
  };
  error: Error | null;
}

// メディアアップロード関数
const uploadMedia = async (file: File, bucket: 'images' | 'videos' | 'thumbnails'): Promise<UploadMediaResult> => {
  try {
    const supabase = getSupabaseClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    return {
      data: {
        path: filePath,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: {
        path: '',
      },
      error: error as Error,
    };
  }
};

// 画像パスを処理するヘルパー関数
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

function EditStatementContent() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [statement, setStatement] = useState<Statement | null>(null);
  const [politician, setPolitician] = useState<SpeakerWithRelations | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagSearchRef = useRef<HTMLDivElement>(null);
  const relatedSearchRef = useRef<HTMLDivElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tagToAdd, setTagToAdd] = useState('');
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [searchTagQuery, setSearchTagQuery] = useState('');
  const [showTagResults, setShowTagResults] = useState(false);
  const [frequentTags, setFrequentTags] = useState<{ id: number; name: string; count: number }[]>([]);

  // フォームデータの状態
  const [formData, setFormData] = useState({
    title: '',
    statement_date: '',
    content: '',
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
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
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
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  // statement データの取得
  useEffect(() => {
    const fetchStatement = async () => {
      if (!params.id) return;

      try {
        // クエリを修正
        const { data, error } = await getSupabaseClient()
          .from('statements')
          .select(`
            *,
            statement_tag (
              tags (
                id,
                name
              )
            ),
            statement_speaker (
              speaker:speakers (
                id,
                last_name,
                first_name,
                parties (
                  name
                )
              )
            )
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('データが見つかりませんでした');
        
        setStatement(data);
        // フォームデータを初期化
        setFormData({
          title: data.title ?? '',
          statement_date: data.statement_date ?? '',
          content: data.content ?? '',
          evidence_url: data.evidence_url ?? '',
        });

        // メディアタイプの設定
        if (data.video_path) {
          setMediaType('video');
          setVideoPreview(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${data.video_path}`);
        } else if (data.image_path) {
          setMediaType('image');
          setImagePreview(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/statements/${data.image_path}`);
        }

        // タグの設定
        if (data.statement_tag && Array.isArray(data.statement_tag)) {
          const tagIds = data.statement_tag.map((tag: { tags: { id: number } }) => tag.tags.id);
          setSelectedTags(tagIds);
        }

        // 関連人物の設定
        if (data.statement_speaker) {
          const speakers = data.statement_speaker
            .map((rel: { speaker: SpeakerWithRelations }) => rel.speaker)
            .filter(Boolean);
          setRelatedSpeakers(speakers);
        }

        // 政治家データも取得
        if (data.speaker_id) {
          const { data: speakerData, error: speakerError } = await politicianAPI.getDetail(data.speaker_id);
          if (speakerError) throw speakerError;
          if (!speakerData) throw new Error('政治家データが見つかりませんでした');
          setPolitician(speakerData);
        }
      } catch (err) {
        console.error('データの取得に失敗しました:', err);
        setError('データの取得に失敗しました');
        showToastMessage('データの取得に失敗しました');
      }
    };

    fetchStatement();
  }, [params.id]);

  // タグ一覧を取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await getSupabaseClient()
          .from('tags')
          .select('*')
          .order('name');

        if (error) throw error;
        setAvailableTags(data);

        // statementのタグ情報がある場合、選択状態を設定
        if (statement?.statement_tag) {
          const tagIds = statement.statement_tag.map(tag => tag.tags.id);
          setSelectedTags(tagIds);
        }
      } catch (error) {
        console.error('タグの取得に失敗しました', error);
        showToastMessage('タグの取得に失敗しました');
      }
    };

    if (user) {
      fetchTags();
    }
  }, [user, statement]);

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

  // 外部クリックを検知するためのuseEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagSearchRef.current && !tagSearchRef.current.contains(event.target as Node)) {
        setShowTagResults(false);
      }
      if (relatedSearchRef.current && !relatedSearchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ログインチェック
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      router.push('/auth');
    }
  }, [user, loading, router]);

  // タグ検索結果をフィルタリング
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTagQuery.toLowerCase())
  );

  // タグ追加ハンドラー
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

  // 関連人物検索
  const searchPoliticians = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await getSupabaseClient()
        .from('speakers')
        .select(`
          *,
          parties (
            id,
            name
          )
        `)
        .eq('speaker_type', 1)
        .or(`last_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name_kana.ilike.%${query}%,first_name_kana.ilike.%${query}%`)
        .order('last_name', { ascending: true })
        .limit(30);

      if (error) throw error;
      setSearchResults(data as SpeakerWithRelations[]);
    } catch (error) {
      console.error('政治家の検索に失敗しました:', error);
      showToastMessage('政治家の検索に失敗しました');
    } finally {
      setIsSearching(false);
    }
  };

  // 関連人物追加
  const addRelatedSpeaker = (speaker: SpeakerWithRelations) => {
    if (!relatedSpeakers.some(s => s.id === speaker.id)) {
      setRelatedSpeakers([...relatedSpeakers, speaker]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // 関連人物削除
  const removeRelatedSpeaker = (id: string) => {
    setRelatedSpeakers(relatedSpeakers.filter(speaker => speaker.id !== id));
  };

  // Toastを表示する関数
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
        resolve(video.duration <= 60); // 60秒以下かチェック
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // 画像処理の共通関数
  const processFile = async (file: File) => {
    if (!file.type.match('image/(jpeg|png|webp)')) {
      showToastMessage('PNG、JPG、またはWebP形式の画像のみアップロード可能です');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToastMessage('ファイルサイズは5MB以下にしてください');
      return;
    }

    try {
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
    } catch (error) {
      console.error('画像の処理に失敗しました:', error);
      showToastMessage('画像の処理に失敗しました');
    }
  };

  // 更新ボタンクリック時の処理
  const handleUpdateClick = () => {
    // バリデーションチェック
    if (!user) {
      setError('ユーザーが認証されていません');
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

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    console.log('handleSubmit called');
    console.log('Current state:', {
      formData,
      selectedTags,
      mediaType,
      image,
      video,
      videoThumbnail,
      statement,
      politician
    });

    setIsSubmitting(true);
    setError('');
    setShowRegisterConfirm(false);

    try {
      if (!statement || !politician) {
        throw new Error('必要なデータが不足しています');
      }

      if (selectedTags.length === 0) {
        throw new Error('タグを1つ以上選択してください');
      }

      console.log('Starting media upload process');
      // 画像/動画のアップロード処理
      let mediaUrl = statement.media_url;
      let thumbnailUrl = statement.thumbnail_url;

      if (image) {
        console.log('Uploading image...');
        setUploadState('uploading');
        setUploadStatusText('画像をアップロード中...');
        const { data: imageData, error: imageError } = await uploadMedia(image, 'images');
        if (imageError) throw imageError;
        mediaUrl = imageData.path;
        thumbnailUrl = imageData.path;
        console.log('Image upload complete:', imageData);
        setUploadState('complete');
      }

      if (video) {
        console.log('Uploading video...');
        setUploadState('uploading');
        setUploadStatusText('動画をアップロード中...');
        const { data: videoData, error: videoError } = await uploadMedia(video, 'videos');
        if (videoError) throw videoError;
        mediaUrl = videoData.path;

        if (videoThumbnail) {
          console.log('Uploading video thumbnail...');
          setUploadStatusText('サムネイルをアップロード中...');
          const { data: thumbnailData, error: thumbnailError } = await uploadMedia(videoThumbnail, 'thumbnails');
          if (thumbnailError) throw thumbnailError;
          thumbnailUrl = thumbnailData.path;
          console.log('Thumbnail upload complete:', thumbnailData);
        }
        console.log('Video upload complete:', videoData);
        setUploadState('complete');
      }

      console.log('Updating statement data');
      setUploadState('processing');
      setUploadStatusText('データを更新中...');

      // 発言データの更新
      const updateData = {
        title: formData.title,
        statement_date: formData.statement_date || null,
        content: formData.content,
        evidence_url: formData.evidence_url || null,
        media_url: mediaUrl || statement.media_url,
        thumbnail_url: thumbnailUrl || statement.thumbnail_url,
        updated_at: new Date().toISOString(),
      };
      console.log('Update data:', updateData);

      const { error: updateError } = await getSupabaseClient()
        .from('statements')
        .update(updateData)
        .eq('id', params.id);

      if (updateError) throw updateError;
      console.log('Statement update complete');

      // タグの関連付けを更新
      console.log('Updating tags...');
      const { error: deleteTagsError } = await getSupabaseClient()
        .from('statement_tag')
        .delete()
        .eq('statement_id', params.id);

      if (deleteTagsError) throw deleteTagsError;

      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          statement_id: params.id,
          tag_id: tagId
        }));
        console.log('Inserting tags:', tagInserts);

        const { error: tagError } = await getSupabaseClient()
          .from('statement_tag')
          .insert(tagInserts);

        if (tagError) throw tagError;
      }
      console.log('Tags update complete');

      // 関連人物の関連付けを更新
      console.log('Updating related speakers...');
      const { error: deleteSpeakerError } = await getSupabaseClient()
        .from('statement_speaker')
        .delete()
        .eq('statement_id', params.id);

      if (deleteSpeakerError) throw deleteSpeakerError;

      if (relatedSpeakers.length > 0) {
        const speakerInserts = relatedSpeakers.map(speaker => ({
          statement_id: params.id,
          speaker_id: speaker.id
        }));
        console.log('Inserting related speakers:', speakerInserts);

        const { error: speakerError } = await getSupabaseClient()
          .from('statement_speaker')
          .insert(speakerInserts);

        if (speakerError) throw speakerError;
      }
      console.log('Related speakers update complete');

      setUploadState('complete');
      showToastMessage('更新が完了しました', 'success');
      router.push(`/statements/${params.id}`);
    } catch (error) {
      setUploadState('idle');
      console.error('Update error:', error);
      if (error instanceof Error) {
        setError(error.message);
        showToastMessage(error.message);
      } else {
        setError('更新中にエラーが発生しました');
        showToastMessage('更新中にエラーが発生しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // フォームの送信ハンドラーを追加
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateClick();
  };

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

  // データ取得前のレンダリング
  if (!statement || !politician) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className={`${toastType === 'success'
              ? 'bg-green-50 border-green-400 text-green-700'
              : 'bg-red-50 border-red-400 text-red-700'
            } px-6 py-3 min-w-72 rounded-md shadow-lg max-w-md animate-fade-in border`}>
            {toastMessage}
          </div>
        </div>
      )}

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
                  {politician.last_name}{politician.first_name}の問題発言を編集
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

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* 既存の画像/動画の表示（編集不可） */}
            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 block">
                メディア <span className="text-gray-500">（編集不可）</span>
              </label>
              {statement.image_path && (
                <div className="mt-4">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/statements/${statement.image_path}`}
                    alt="スクリーンショット"
                    width={400}
                    height={300}
                    className="rounded-lg object-contain"
                  />
                </div>
              )}
              {statement.video_path && (
                <div className="mt-4">
                  <video
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${statement.video_path}`}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 block">
                発言内容 <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
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
            </div>

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
            </div>

            {/* タグ選択 */}
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

            {/* 関連人物選択 */}
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
                    searchPoliticians(e.target.value);
                  }}
                  placeholder="政治家を検索"
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
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {speaker.last_name}{speaker.first_name}
                        {speaker.parties?.name && ` (${speaker.parties.name})`}
                      </button>
                    ))}
                  </div>
                )}

                {isSearching && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                )}
              </div>
            </div>

            {/* 更新確認モーダル */}
            {showRegisterConfirm && (
              <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-28">
                <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-xl" onClick={() => setShowRegisterConfirm(false)}></div>
                <div className="relative bg-white rounded-lg p-6 max-w-screen-md w-full mx-4 z-10 shadow-xl/30">
                  <h3 className="font-semibold mb-4">更新確認</h3>
                  <p className="mb-4 text-sm">更新内容を確認してください。この内容で更新しますか？</p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowRegisterConfirm(false)}
                      className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="min-w-28 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-indigo-500 rounded-lg border border-gray-200 hover:bg-indigo-600"
                    >
                      更新
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 更新ボタン */}
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
                onClick={handleUpdateClick}
                disabled={isSubmitting || uploadState !== 'idle'}
                className={`min-w-28 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-indigo-500 rounded-lg border border-gray-200 hover:bg-indigo-600 ${(isSubmitting || uploadState !== 'idle') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    処理中...
                  </div>
                ) : (
                  '更新する'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmAddTag}
        title={`「${tagToAdd}」というタグを追加しますか？`}
        message="追加する前に類似タグがないか確認してください。"
      />

      <Footer />
    </main>
  );
}

export default function EditStatement() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <EditStatementContent />
    </Suspense>
  );
}
