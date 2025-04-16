'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import { getSupabaseClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import imageCompression from 'browser-image-compression';

interface Party {
  id: number;
  uuid: string;
  name: string;
  abbreviation?: string;
  parent_id: number | null;
  order?: number;
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
            登録する
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateSpeakerContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isDragging, setIsDragging] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedChildParty, setSelectedChildParty] = useState<number | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    speaker_type: '',
    last_name: '',
    first_name: '',
    last_name_kana: '',
    first_name_kana: '',
    birthday: '',
    age: '',
    gender: '',
    party_id: '',
    prefecture_id: '',
    district: '',
    chamber: '',
    election_result: '',
    position: '',
    biography: '',
    official_url: '',
    facebook_url: '',
    twitter_url: '',
    youtube_url: '',
    line_url: '',
    instagram_url: '',
    tiktok_url: '',
  });

  // 「その他」政党のIDを定数として定義
  const OTHER_PARTY_ID = 3925;

  // 親政党のみをフィルタリング（orderでソート済み）
  const parentParties = parties.filter(party => !party.parent_id);
  
  // 選択された親政党の子政党をフィルタリング
  const childParties = parties.filter(party => {
    if (!formData.party_id) return false;
    const parentId = String(formData.party_id);
    return String(party.parent_id) === parentId;
  });

  // ログインチェック
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      router.push('/auth');
    }
  }, [user, loading, router]);

  // 政党一覧の取得
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const { data, error } = await getSupabaseClient()
          .from('parties')
          .select('*')
          .order('order', { ascending: true })
          .order('name', { ascending: true });
        
        if (error) throw error;
        setParties(data);
      } catch (error) {
        console.error('Error fetching parties:', error);
      }
    };

    fetchParties();
  }, [getSupabaseClient]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
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

  // バリデーション関数を追加
  const validateForm = () => {
    // 必須項目のチェック
    if (!formData.last_name || !formData.first_name || !formData.last_name_kana || !formData.first_name_kana || !formData.speaker_type) {
      showToastMessage('必須項目を入力してください');
      return false;
    }

    // 政治家の場合は所属政党も必須
    if (formData.speaker_type === '1' && !formData.party_id) {
      showToastMessage('所属政党を選択してください');
      return false;
    }

    return true;
  };

  // 登録ボタンのクリックハンドラ
  const handleRegisterClick = () => {
    if (validateForm()) {
      setShowRegisterConfirm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('ユーザーが認証されていません');
      return;
    }

    try {
      const supabase = createClientComponentClient();

      // 画像のアップロード処理
      let image_path = null;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('politicians')
          .upload(filePath, image);

        if (uploadError) {
          throw uploadError;
        }

        image_path = filePath;
      }

      // データの型変換
      const speakerData = {
        speaker_type: parseInt(formData.speaker_type.toString()),
        last_name: formData.last_name,
        first_name: formData.first_name,
        last_name_kana: formData.last_name_kana || null,
        first_name_kana: formData.first_name_kana || null,
        birthday: formData.birthday || null,
        age: formData.age ? parseInt(formData.age.toString()) : null,
        gender: formData.gender || null,
        party_id: formData.party_id ? parseInt(formData.party_id.toString()) : null,
        prefecture_id: formData.prefecture_id ? parseInt(formData.prefecture_id.toString()) : null,
        district: formData.district || null,
        chamber: formData.chamber || null,
        election_result: formData.election_result ? formData.election_result.toString() : null,
        position: formData.position || null,
        biography: formData.biography || null,
        official_url: formData.official_url || null,
        facebook_url: formData.facebook_url || null,
        twitter_url: formData.twitter_url || null,
        youtube_url: formData.youtube_url || null,
        line_url: formData.line_url || null,
        instagram_url: formData.instagram_url || null,
        tiktok_url: formData.tiktok_url || null,
        image_path: image_path,
      };

      console.log('送信するデータ:', speakerData);

      const { data: speaker, error: speakerError } = await supabase
        .from('speakers')
        .insert([speakerData])
        .select()
        .single();

      if (speakerError) {
        console.error('Supabaseエラー:', speakerError);
        throw speakerError;
      }

      showToastMessage('発言者を登録しました', 'success');
      setTimeout(() => {
        router.push('/commentators');
      }, 2000);

    } catch (error) {
      console.error('発言者の登録に失敗しました:', error);
      showToastMessage('発言者の登録に失敗しました');
    }
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
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

      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>

      <div className="container mx-auto px-4 pt-4">
        <div className="max-w-screen-md mx-auto bg-gray-700 rounded-t-md">
          <div className="p-4">
            <h2 className="font-bold text-lg text-white">
              発言者を登録
            </h2>
          </div>
        </div>

        <div className="max-w-screen-md mx-auto bg-white p-6 rounded-b-md shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 画像アップロード */}
            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 block">
                プロフィール画像
              </label>
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
                >
                  {!imagePreview ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">クリックしてアップロード</span><br />またはドラッグ＆ドロップ</p>
                      <p className="text-xs text-gray-500">PNG, JPG (最大 1200x1200px)</p>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="プレビュー"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-3 -right-3 bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input
                    id="dropzone-file"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/png,image/jpeg"
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2 block">
                  姓 <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="例：安倍"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2 block">
                  名 <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="例：晋三"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2 block">
                  せい <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
                </label>
                <input
                  type="text"
                  name="last_name_kana"
                  placeholder="例：あべ"
                  value={formData.last_name_kana}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2 block">
                  めい <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
                </label>
                <input
                  type="text"
                  name="first_name_kana"
                  placeholder="例：しんぞう"
                  value={formData.first_name_kana}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 発言者タイプ */}
            <div>
              <label className="text-gray-700 text-sm font-bold mb-2 block">
                人物の属性 <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
              </label>
              <select
                name="speaker_type"
                value={formData.speaker_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">選択してください</option>
                <option value="1">政治家</option>
                <option value="2">ジャーナリスト</option>
                <option value="3">学者・専門家</option>
                <option value="4">評論家・言論人</option>
                <option value="5">その他</option>
              </select>
              <p className="text-gray-700 text-sm"><small>* 政治家を選択した場合、所属政党の選択が必須になります</small></p>
            </div>

            {/* 政治家の場合の追加情報 */}
            {formData.speaker_type === '1' && (
              <div className="space-y-4 pt-4">
                <h3 className="font-bold text-gray-700">政治家情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm font-bold mb-2 block">
                      所属政党 <span className="bg-red-400 text-white text-xs font-medium me-2 px-1.5 py-0.5 rounded-sm">必須</span>
                    </label>
                    <div className="relative">
                      <select
                        name="party_id"
                        value={formData.party_id}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                      >
                        <option value="">選択してください</option>
                        {parentParties.map((party) => (
                          <option key={party.uuid} value={party.id}>
                            {party.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* その他政党が選択された場合の子政党選択 */}
                  {Number(formData.party_id) === OTHER_PARTY_ID && childParties.length > 0 && (
                    <div>
                      <label className="text-gray-700 text-sm font-bold mb-2 block">
                        その他政党を選択
                      </label>
                      <div className="relative">
                        <select
                          name="child_party_id"
                          value={selectedChildParty || ''}
                          onChange={(e) => {
                            setSelectedChildParty(Number(e.target.value));
                            setFormData({
                              ...formData,
                              party_id: e.target.value
                            });
                          }}
                          className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 appearance-none"
                        >
                          <option value="">選択してください</option>
                          {childParties.map((party) => (
                            <option key={party.uuid} value={party.id}>
                              {party.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-gray-700 text-sm font-bold mb-2 block">
                      選挙区
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-bold mb-2 block">
                      議院
                    </label>
                    <input
                      type="text"
                      name="chamber"
                      value={formData.chamber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-bold mb-2 block">
                      選挙結果
                    </label>
                    <select
                      name="election_result"
                      value={formData.election_result}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">選択してください</option>
                      <option value="1">当選</option>
                      <option value="0">落選</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-bold mb-2 block">
                      役職
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 個人情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2 block">
                  生年月日
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2 block">
                  年齢
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2 block">
                  性別
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">選択してください</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900"
              >
                <span className="mr-2 text-blue-700 font-semibold">プロフィール詳細を登録する</span>
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
              <>
                {/* 経歴 */}
                <div>
                  <label className="text-gray-700 text-sm font-bold mb-2 block">
                    経歴
                  </label>
                  <textarea
                    name="biography"
                    value={formData.biography}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* SNSリンク */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700">SNSリンク</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 text-sm font-bold mb-2 block">
                        公式サイト
                      </label>
                      <input
                        type="url"
                        name="official_url"
                        value={formData.official_url}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="例：https://example.com"
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-bold mb-2 block">
                        X
                      </label>
                      <input
                        type="url"
                        name="twitter_url"
                        value={formData.twitter_url}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="例：https://x.com/..."
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-bold mb-2 block">
                        Facebook
                      </label>
                      <input
                        type="url"
                        name="facebook_url"
                        value={formData.facebook_url}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div>
                      <label className="text-gray-700 text-sm font-bold mb-2 block">
                        YouTube
                      </label>
                      <input
                        type="url"
                        name="youtube_url"
                        value={formData.youtube_url}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                </div>

              </>
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
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-28 border-2">
          <div className="fixed inset-0 bg-gray-600/10 backdrop-blur-xl" onClick={() => setShowRegisterConfirm(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-screen-md w-full mx-4 z-10 shadow-xl/30">
            <h3 className="font-semibold mb-4">登録確認</h3>
            <p className="mb-4 text-sm">人物は重複していませんか？入力内容に問題はないですか？</p>
            <p className="mb-4 text-sm">内容を確認して登録してください。</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRegisterConfirm(false)}
                className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                onClick={async (e) => {
                  setShowRegisterConfirm(false);
                  await handleSubmit(e);
                }}
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

export default function CreateSpeaker() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <CreateSpeakerContent />
    </Suspense>
  );
}
