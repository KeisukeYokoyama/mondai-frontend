'use client';

import { useEffect, useState } from 'react';
import { politicianAPI } from '@/utils/supabase/politicians';
import type { SpeakerWithRelations } from '@/utils/supabase/types';
import Image from 'next/image';

export default function PoliticianTestPage() {
  const [politicians, setPoliticians] = useState<SpeakerWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolitician, setSelectedPolitician] = useState<SpeakerWithRelations | null>(null);

  // 政治家一覧の取得
  const fetchPoliticians = async () => {
    try {
      setLoading(true);
      const { data, error } = await politicianAPI.getAll({ per_page: 20 });
      console.log('政治家一覧のレスポンス:', { data, error });
      if (error) throw error;
      setPoliticians(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 政治家の検索
  const handleSearch = async () => {
    try {
      setLoading(true);
      const { data, error } = await politicianAPI.search({
        s: searchQuery,
        per_page: 20
      });
      console.log('政治家検索のレスポンス:', { 
        query: searchQuery,
        data, 
        error 
      });
      if (error) throw error;
      setPoliticians(data?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 政治家の詳細取得
  const fetchPoliticianDetail = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await politicianAPI.getDetail(id);
      console.log('政治家詳細のレスポンス:', { 
        id,
        data, 
        error 
      });
      if (error) throw error;
      setSelectedPolitician(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '詳細の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliticians();
  }, []);

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-500">エラー: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">政治家APIテスト</h1>

      {/* 検索フォーム */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="政治家名で検索"
          className="border p-2 mr-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          検索
        </button>
      </div>

      {/* 政治家一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {politicians.map((politician) => (
          <div
            key={politician.id}
            className="border p-4 rounded cursor-pointer hover:bg-gray-50"
            onClick={() => fetchPoliticianDetail(politician.id)}
          >
            <div className="mb-3">
              <Image
                src={politician.image_path ? `/${politician.image_path}` : '/images/default-avatar.png'}
                alt={`${politician.last_name} ${politician.first_name}の写真`}
                className="w-32 h-32 object-cover rounded"
                width={128}
                height={128}
              />
            </div>
            <h2 className="text-xl font-bold">
              {politician.last_name} {politician.first_name}
            </h2>
            <p className="text-gray-600">
              {politician.parties[0]?.name} / {politician.chamber}
            </p>
            <p className="text-sm text-gray-500">
              {politician.prefectures[0]?.name} {politician.cities[0]?.name}
            </p>
          </div>
        ))}
      </div>

      {/* 詳細表示 */}
      {selectedPolitician && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <div className="flex items-start">
              <div className="mr-6">
                <Image
                  src={selectedPolitician.image_path ? `/${selectedPolitician.image_path}` : '/images/default-avatar.png'}
                  alt={`${selectedPolitician.last_name} ${selectedPolitician.first_name}の写真`}
                  className="w-48 h-48 object-cover rounded"
                  width={192}
                  height={192}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedPolitician.last_name} {selectedPolitician.first_name}の詳細
                </h2>
                <div className="space-y-2">
                  <p><strong>所属政党:</strong> {selectedPolitician.parties[0]?.name}</p>
                  <p><strong>所属:</strong> {selectedPolitician.chamber}</p>
                  <p><strong>選挙区:</strong> {selectedPolitician.prefectures[0]?.name} {selectedPolitician.cities[0]?.name}</p>
                  <p><strong>年齢:</strong> {selectedPolitician.age}</p>
                  <p><strong>性別:</strong> {selectedPolitician.gender}</p>
                  {selectedPolitician.statements && selectedPolitician.statements.length > 0 && (
                    <div>
                      <h3 className="font-bold mt-4">発言一覧</h3>
                      <ul className="list-disc pl-4">
                        {selectedPolitician.statements.map((statement) => (
                          <li key={statement.id} className="mt-1">
                            {statement.content}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedPolitician(null)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
