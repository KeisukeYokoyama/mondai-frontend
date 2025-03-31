'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { statementAPI } from '@/utils/supabase/statements';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function CreateStatement() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const speakerId = searchParams.get('speaker_id');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        statement_date: '',
        content: '',
        speaker_id: speakerId,
        evidence_url: '',
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [availableTags, setAvailableTags] = useState<{id: number, name: string}[]>([]);
    const [newTag, setNewTag] = useState('');
    const [toastMessage, setToastMessage] = useState<string>('');
    const [showToast, setShowToast] = useState(false);

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
        fetchTags();
    }, []);

    // バケットの存在確認
    useEffect(() => {
        const checkBucket = async () => {
            try {
                const exists = await statementAPI.checkBucket();
                if (!exists) {
                    setError('statements バケットが存在しません');
                }
            } catch (err) {
                console.error('バケットの確認に失敗しました', err);
                setError('ストレージの設定を確認してください');
            }
        };
        checkBucket();
    }, []);

    // Toastを表示する関数
    const showToastMessage = (message: string) => {
        setToastMessage(message);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImage(null);
            setImagePreview(null);
        }
    };

    const handleAddTag = async () => {
        if (!newTag.trim()) return;
        
        try {
            const { data, error } = await supabase
                .from('tags')
                .insert({ name: newTag.trim() })
                .select()
                .single();

            if (error) throw error;

            setAvailableTags([...availableTags, data]);
            setSelectedTags([...selectedTags, data.id]);
            setNewTag('');
        } catch (error: unknown) {
            showToastMessage('タグの追加に失敗しました');
            console.error('タグの追加に失敗しました', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!speakerId) {
            setError('政治家IDが指定されていません');
            return;
        }

        try {
            const { data: statement } = await statementAPI.create({
                ...formData,
                speaker_id: speakerId,
                image_path: image || undefined,
            });

            if (!statement) {
                throw new Error('発言の登録に失敗しました');
            }

            // タグがある場合は関連付け
            if (selectedTags.length > 0) {
                await statementAPI.attachTags(statement.id, selectedTags);
            }

            router.push(`/politicians/${speakerId}`);
        } catch (err) {
            setError('発言の登録に失敗しました');
            console.error(err);
        }
    };

    return (
        <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
            {showToast && (
                <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md shadow-lg max-w-md animate-fade-in">
                        {toastMessage}
                    </div>
                </div>
            )}

            <section className="text-gray-600 body-font bg-white">
                <div className="container px-5 py-2 mx-auto">
                    <Header title="新規発言登録" />
                </div>
            </section>

            <div className="container mx-auto px-5 py-8">
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                タイトル
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                発言日
                            </label>
                            <input
                                type="date"
                                name="statement_date"
                                value={formData.statement_date}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                画像
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="mt-1 block w-full"
                            />
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                内容
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                エビデンスのURL
                            </label>
                            <input
                                type="url"
                                name="evidence_url"
                                value={formData.evidence_url}
                                onChange={handleChange}
                                placeholder="https://www.youtube.com/watch?xxx"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <small className="text-gray-500">
                                発言の証拠となるURLを入力してください。
                            </small>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                タグ
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
                                    placeholder="新しいタグを追加"
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                登録する
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </main>
    );
}
