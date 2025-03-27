'use client';
import React, { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Navs/Header'
import Footer from '@/components/Navs/Footer'
import Link from 'next/link'
import debounce from 'lodash/debounce';  // lodashのインストールが必要
import Image from 'next/image';

interface Region {
  id: number;
  name: string;
  slug: string;
}

interface Prefecture {
  id: number;
  name: string;
  slug: string;
  region_id: number;
}

interface City {
  id: number;
  name: string;
  prefecture_id: number;
}

interface Party {
  id: number;           // 数値型のID
  uuid: string;         // UUID
  name: string;
  abbreviation?: string;
  parent_id?: string;
  order?: number;
}

// 検索用のinterface追加
interface SearchParams {
  s?: string;
  chamber?: string;
  gender?: string;
  party_id?: string;  // UUID
  prefecture_id?: number;
  city_id?: string;
}

// 型定義の追加
interface Speaker {
  id: string;          // 数値型の元ID
  speaker_type: number;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  age?: string;
  gender?: string;
  chamber?: string;
  image_path?: string;  // 追加
  election_result?: string;  // 文字列型に修正
  party?: {
    id: number;        // 数値型のID
    uuid: string;      // UUID
    name: string;
    abbreviation: string;
  };
  prefecture?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
  };
}

interface SearchResponse {
  data: Speaker[];
  total: number;
  current_page: number;
  per_page: number;
}

// 検索中のインジケータコンポーネント
const SearchingIndicator = () => (
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
  </div>
);

export default function Home() {
  // 状態の初期化（空の値で初期化）
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  
  // 空の初期値で初期化
  const [searchText, setSearchText] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedChildParty, setSelectedChildParty] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(0);
  const [selectedPrefecture, setSelectedPrefecture] = useState(0);
  const [selectedPrefectureSlug, setSelectedPrefectureSlug] = useState('');
  const [selectedCity, setSelectedCity] = useState(0);
  const [searchResults, setSearchResults] = useState<Speaker[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);  // クライアントサイドかどうかのフラグ
  
  // マウント時にクライアントサイドフラグを設定
  useEffect(() => {
    setIsClient(true);
    
    // sessionStorageから値を取得
    try {
      setSearchText(sessionStorage.getItem('searchText') || '');
      setSelectedGender(sessionStorage.getItem('selectedGender') || '');
      setSelectedType(sessionStorage.getItem('selectedType') || '');
      setSelectedParty(sessionStorage.getItem('selectedParty') || '');
      setSelectedChildParty(sessionStorage.getItem('selectedChildParty') || '');
      setSelectedRegion(Number(sessionStorage.getItem('selectedRegion')) || 0);
      setSelectedPrefecture(Number(sessionStorage.getItem('selectedPrefecture')) || 0);
      setSelectedPrefectureSlug(sessionStorage.getItem('selectedPrefectureSlug') || '');
      setSelectedCity(Number(sessionStorage.getItem('selectedCity')) || 0);
      
      const savedResults = sessionStorage.getItem('searchResults');
      if (savedResults) {
        setSearchResults(JSON.parse(savedResults));
      }
      
      const savedTotal = sessionStorage.getItem('totalResults');
      if (savedTotal) {
        setTotalResults(parseInt(savedTotal, 10));
      }
    } catch (error) {
      console.error('Error accessing sessionStorage:', error);
    }
  }, []);

  // クライアントサイドでのみsessionStorageに保存
  useEffect(() => {
    if (!isClient) return;  // クライアントサイドでない場合は処理しない
    
    try {
      sessionStorage.setItem('searchText', searchText);
      sessionStorage.setItem('selectedGender', selectedGender);
      sessionStorage.setItem('selectedType', selectedType);
      sessionStorage.setItem('selectedParty', selectedParty);
      sessionStorage.setItem('selectedChildParty', selectedChildParty);
      sessionStorage.setItem('selectedRegion', String(selectedRegion));
      sessionStorage.setItem('selectedPrefecture', String(selectedPrefecture));
      sessionStorage.setItem('selectedPrefectureSlug', selectedPrefectureSlug);
      sessionStorage.setItem('selectedCity', String(selectedCity));
      sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
      sessionStorage.setItem('totalResults', String(totalResults));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }, [
    isClient, searchText, selectedGender, selectedType, selectedParty, selectedChildParty,
    selectedRegion, selectedPrefecture, selectedPrefectureSlug, selectedCity,
    searchResults, totalResults
  ]);

  // 検索実行関数
  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (params.s) queryParams.append('s', params.s);
      if (params.chamber) queryParams.append('chamber', params.chamber);
      if (params.gender) queryParams.append('gender', params.gender);
      if (params.party_id && params.party_id !== '0') {
        queryParams.append('party_id', params.party_id);
      }
      if (params.prefecture_id) queryParams.append('prefecture_id', String(params.prefecture_id));
      if (params.city_id && params.city_id !== '0') queryParams.append('city_id', params.city_id);

      const searchUrl = `http://localhost:8000/api/v1/speakers/search?${queryParams}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data.data || []);
      setTotalResults(data.total || 0);

    } catch (error) {
      console.error('検索エラー:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  // デバウンスされた検索関数
  const debouncedSearch = useCallback(
    debounce((searchText: string) => {
      handleSearch({ s: searchText });
    }, 300),
    [handleSearch]
  );

  // 地域一覧の取得
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/regions');
        const data = await response.json();
        setRegions(data);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };

    fetchRegions();
  }, []);

  // 都道府県一覧の取得
  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/prefectures');
        const data = await response.json();
        setPrefectures(data);
      } catch (error) {
        console.error('Error fetching prefectures:', error);
      }
    };

    fetchPrefectures();
  }, []);

  // 市区町村一覧の取得
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedPrefectureSlug) return;
      
      try {
        const response = await fetch(`http://localhost:8000/api/v1/prefectures/${selectedPrefectureSlug}/cities`);
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, [selectedPrefectureSlug]);

  // 政党一覧の取得（フラットな配列として取得）
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/parties');
        const data = await response.json();
        // orderに基づいてソート
        setParties(data.sort((a: Party, b: Party) => {
          // orderが存在する場合はそれを使用
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // orderがない場合は名前でソート
          return a.name.localeCompare(b.name);
        }));
      } catch (error) {
        console.error('Error fetching parties:', error);
      }
    };

    fetchParties();
  }, []);

  // 親政党のみをフィルタリング（orderでソート済み）
  const parentParties = parties.filter(party => !party.parent_id);
  
  // 選択された親政党の子政党をフィルタリング
  const childParties = parties.filter(party => 
    party.parent_id === selectedParty
  );

  // 「その他」政党のIDを定数として定義
  const OTHER_PARTY_ID = 3925;  // 数値のまま

  // 入力時の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (value.length >= 1) {
      debouncedSearch(value);
    } else {
      setSearchResults([]);
      setTotalResults(0);
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
        <section className="text-gray-600 body-font bg-white">
          <div className="container px-5 py-2 mx-auto">
            <Header title="政治家一覧" />
          </div>
        </section>
        <div className="container px-5 pt-8 mx-auto text-center relative">
          <div className="relative flex flex-col gap-4 max-w-md mx-auto">
            <div className="relative">
              <input 
                type="text" 
                className="w-full pl-4 pr-12 py-2 text-sm border border-gray-300 rounded-md" 
                placeholder="政治家名を入力" 
                value={searchText}
                onChange={handleInputChange}
              />
              {isLoading && <SearchingIndicator />}
            </div>
            <p 
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-blue-700 cursor-pointer text-right -mt-2 font-semibold"
            >
              詳細条件
            </p>

            {/* モーダル */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start pt-12 justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">詳細検索</h3>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <select 
                      className="w-full pl-4 pr-12 py-2 text-sm border border-gray-300 rounded-md"
                      value={selectedParty}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        const selectedParty = parentParties.find(p => p.id === Number(selectedValue));
                        console.log('Selected value:', selectedValue);
                        console.log('Selected party:', selectedParty);
                        setSelectedParty(selectedValue);
                        setSelectedChildParty('');
                      }}
                    >
                      <option value="">政党を選択</option>
                      {parentParties.map((party) => (
                        <option key={party.uuid} value={party.id}>
                          {party.name}
                        </option>
                      ))}
                    </select>

                    {/* 「その他」が選択された場合のみ子政党を表示 */}
                    {Number(selectedParty) === OTHER_PARTY_ID && childParties.length > 0 && (
                      <select 
                        className="w-full pl-4 pr-12 py-2 text-sm border border-gray-300 rounded-md"
                        value={selectedChildParty}
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          console.log('Selected child party id:', selectedValue);
                          setSelectedChildParty(selectedValue);
                        }}
                      >
                        <option value="">選択してください</option>
                        {childParties.map((party) => (
                          <option key={party.uuid} value={party.id}>
                            {party.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* 種別選択 */}
                    <div className="flex flex-col items-start gap-2 pb-2">
                      <p className="text-sm text-gray-700 font-bold">議員種別</p>
                      <div className="flex gap-3">
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="type" 
                            value=""
                            checked={selectedType === ""}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="mr-1" 
                          />
                          <span className="text-sm">すべて</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="type" 
                            value="衆議院"
                            checked={selectedType === "衆議院"}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="mr-1" 
                          />
                          <span className="text-sm">衆議院</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="type" 
                            value="参議院"
                            checked={selectedType === "参議院"}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="mr-1" 
                          />
                          <span className="text-sm">参議院</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="type" 
                            value="地方選挙"
                            checked={selectedType === "地方選挙"}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="mr-1" 
                          />
                          <span className="text-sm">地方議員</span>
                        </label>
                      </div>
                    </div>

                    {/* 性別選択 */}
                    <div className="flex flex-col items-start gap-2 pb-2">
                      <p className="text-sm text-gray-700 font-bold">性別</p>
                      <div className="flex gap-3">
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="gender" 
                            value=""
                            checked={selectedGender === ""}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="mr-1" 
                          />
                          <span className="text-sm">すべて</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="男"
                            checked={selectedGender === "男"}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="mr-1" 
                          />
                          <span className="text-sm">男性</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="女"
                            checked={selectedGender === "女"}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="mr-1" 
                          />
                          <span className="text-sm">女性</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4 pb-2">
                      {/* 地域選択 */}
                      <select 
                        className="w-full pl-4 pr-12 py-2 text-sm border border-gray-300 rounded-md"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(Number(e.target.value))}
                      >
                        <option value={0}>地域を選択</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </select>

                      {/* 都道府県選択（地域が選択されている場合のみ表示） */}
                      {selectedRegion > 0 && (
                        <select 
                          className="w-full pl-4 pr-12 py-2 text-sm border border-gray-300 rounded-md"
                          value={selectedPrefecture}
                          onChange={(e) => {
                            const prefecture = prefectures.find(p => p.id === Number(e.target.value));
                            if (prefecture) {
                              setSelectedPrefecture(prefecture.id);
                              setSelectedPrefectureSlug(prefecture.slug);
                              setSelectedCity(0);
                            }
                          }}
                        >
                          <option value="">都道府県を選択</option>
                          {prefectures.map((prefecture) => (
                            <option key={prefecture.id} value={prefecture.id}>
                              {prefecture.name}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* 市区町村選択（都道府県が選択されている場合のみ表示） */}
                      {selectedPrefecture > 0 && (
                        <select 
                          className="w-full pl-4 pr-12 py-2 text-sm border border-gray-300 rounded-md"
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(Number(e.target.value))}
                        >
                          <option value={0}>市区町村を選択</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        handleSearch({
                          s: searchText,
                          chamber: selectedType,
                          gender: selectedGender,
                          party_id: selectedChildParty || selectedParty,
                          prefecture_id: selectedPrefecture,
                          city_id: String(selectedCity)
                        });
                        setIsModalOpen(false);
                      }}
                      className="w-full pl-4 pr-12 py-2 text-sm border rounded-md bg-gray-900 text-white hover:bg-gray-800"
                    >
                      検索
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="container px-3 pt-8 mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              検索結果
            </h2>
            {Array.isArray(searchResults) && (
              <p className="text-sm text-gray-600">
                {totalResults === 0 ? (
                  "該当する結果はありません"
                ) : (
                  `検索結果：${totalResults}件`
                )}
              </p>
            )}
          </div>
        </div>
        <div className="container px-0 py-8 mx-auto">
          <div className="flex flex-col divide-y divide-gray-200">
            {Array.isArray(searchResults) && searchResults.length > 0 ? (
              searchResults.map((politician, index) => (
                <div 
                  key={politician.id || index} 
                  className="flex items-center justify-between py-3 px-4 bg-white w-full hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Image
                      src={politician.image_path || "/images/default-avatar.png"} 
                      alt={`${politician.last_name} ${politician.first_name}`} 
                      className="w-16 h-16 object-cover rounded-full mr-4 shadow-md" 
                      width={64}
                      height={64}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900">
                        <span className="font-bold">
                          {politician.last_name} {politician.first_name}
                        </span>
                        <span className="text-gray-600 text-xs">
                          （{politician.age ? `${politician.age}歳` : '-'} / {politician.gender || '-'}）
                        </span>
                      </h3>
                      <p className="text-gray-600 text-xs">
                        {politician.party?.name || '無所属'} / 
                        {politician.chamber === '地方選挙' ? '地方議員' : politician.chamber || '不明'} / 
                        {politician.prefecture?.name || '地域不明'} /
                        <span 
                          className={politician.election_result === "0" ? 'text-red-600 font-semibold' : 
                                   politician.election_result === "1" ? 'text-green-600 font-semibold' : ''}
                        >
                          {politician.election_result === "0" ? '😢 落選' : 
                           politician.election_result === "1" ? '当選' : '不明'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="min-w-[40px] text-right">
                    <Link href={`/politicians/${politician.id}`} className="text-blue-500 text-sm font-bold">
                      詳細
                    </Link>
                  </div>
                </div>
              ))
            ) : searchText.length > 0 ? (
              <div className="text-center py-4 text-gray-500">
                {isLoading ? "検索中..." : "検索結果がありません"}
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

