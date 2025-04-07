'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React, { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Navs/Header'
import Footer from '@/components/Navs/Footer'
import Link from 'next/link'
import debounce from 'lodash/debounce'
import Image from 'next/image'
import { politicianAPI } from '@/utils/supabase/politicians'
import type { SpeakerWithRelations } from '@/utils/supabase/types'

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
  parent_id: number | null;  // 修正
  order?: number;
}

// 検索用のinterface追加
interface SearchParams {
  s?: string;
  chamber?: string;  // undefinedのみを許可
  gender?: string;   // undefinedのみを許可
  party_id?: string;
  prefecture_id?: number;
  city_id?: string;
}

// 型定義の追加
interface Speaker {
  id: string;
  speaker_type: number;
  last_name: string;
  first_name: string;
  last_name_kana: string | null;  // nullを許容
  first_name_kana: string | null;  // nullを許容
  age?: string | null;  // nullを許容するように修正
  gender?: string | null;  // nullを許容するように修正
  chamber?: string | null;  // nullを許容するように修正
  image_path?: string | null;  // nullを許容するように修正
  election_result?: string | null;  // nullを許容するように修正
  party?: {
    id: number;
    uuid: string;
    name: string;
    abbreviation: string;
  };
  prefectures?: {
    id: number;
    name: string;
  }[];
  cities?: {
    id: number;
    name: string;
  }[];
}

// 検索中のインジケータコンポーネント
const SearchingIndicator = () => (
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
  </div>
);

// 画像パスを処理するヘルパー関数を追加
const getImagePath = (path: string | null) => {
  if (!path) return '/images/default-avatar.png';
  
  // パスが完全なURLの場合はそのまま返す
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Supabaseのストレージパスを構築
  return path.startsWith('/') ? path : `/${path}`;
};

export default function Home() {
  const supabase = createClientComponentClient()
  
  // 状態管理
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SpeakerWithRelations[]>([]);
  const [selectedType, setSelectedType] = useState<number>(0);
  const [selectedParty, setSelectedParty] = useState<number>(3924);
  const [selectedRegion, setSelectedRegion] = useState<number>(0);
  const [selectedPrefecture, setSelectedPrefecture] = useState<number>(0);
  const [selectedCity, setSelectedCity] = useState<number>(0);
  const [selectedGender, setSelectedGender] = useState<number>(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  
  // 親政党のみをフィルタリング（orderでソート済み）
  const parentParties = parties.filter(party => !party.parent_id);
  
  // 選択された親政党の子政党をフィルタリング
  const childParties = parties.filter(party => {
    if (!selectedParty) return false;
    const parentId = String(selectedParty);
    return String(party.parent_id) === parentId;
  });

  // 検索機能の実装
  const handleSearch = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    try {
      console.log('検索実行 - パラメータ:', {
        検索文字列: params.s,
        議員種別: params.chamber,
        性別: params.gender,
        政党ID: params.party_id,
        都道府県ID: params.prefecture_id,
        市区町村ID: params.city_id
      });

      const { data, error } = await politicianAPI.search({
        s: params.s,
        chamber: params.chamber,
        gender: params.gender,
        party_id: params.party_id,
        prefecture_id: params.prefecture_id ? String(params.prefecture_id) : undefined,
        city_id: params.city_id,
        per_page: 20
      });

      if (error) throw error;
      
      console.log('検索結果の最初のデータ構造:', {
        データ全体: data?.data?.[0],
        政党情報: {
          parties: data?.data?.[0]?.parties,
        },
        地域情報: {
          prefectures: data?.data?.[0]?.prefectures,
        }
      });

      console.log('検索結果の詳細:', {
        最初の政治家: data?.data?.[0] ? {
          名前: `${data.data[0].last_name} ${data.data[0].first_name}`,
          政党情報: {
            party: data.data[0].parties,
            政党名: data.data[0].parties.name,
            政党ID: data.data[0].parties.id
          },
          地域情報: {
            prefecture: data.data[0].prefectures,
            地域名: data.data[0].prefectures.name
          }
        } : '該当なし'
      });

      console.log('検索結果:', {
        総件数: data?.total,
        取得データ件数: data?.data?.length,
        最初の結果: data?.data?.[0] ? {
          名前: `${data.data[0].last_name} ${data.data[0].first_name}`,
          政党: data.data[0].parties.name,
          政党ID: data.data[0].parties.id,
          議員種別: data.data[0].chamber
        } : '該当なし'
      });

      setSearchResults(data?.data || []);
      setTotalResults(data?.total || 0);
    } catch (error) {
      console.error('検索エラー:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // マウント時にクライアントサイドフラグを設定
  useEffect(() => {
    setIsClient(true);
    
    // sessionStorageから値を取得
    try {
      setSearchText(sessionStorage.getItem('searchText') || '');
      setSelectedGender(Number(sessionStorage.getItem('selectedGender')) || 0);
      setSelectedType(Number(sessionStorage.getItem('selectedType')) || 0);
      setSelectedParty(Number(sessionStorage.getItem('selectedParty')) || 3924);
      setSelectedRegion(Number(sessionStorage.getItem('selectedRegion')) || 0);
      setSelectedPrefecture(Number(sessionStorage.getItem('selectedPrefecture')) || 0);
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

  // 初期検索を実行
  useEffect(() => {
    if (isClient) {
      const searchParams = {
        s: searchText,
        chamber: selectedType === 0 ? undefined : 
                selectedType === 1 ? '衆議院' : 
                selectedType === 2 ? '参議院' : 
                selectedType === 3 ? '地方選挙' : undefined,
        gender: selectedGender === 0 ? undefined : 
               selectedGender === 1 ? '男' : 
               selectedGender === 2 ? '女' : undefined,
        party_id: selectedParty ? String(selectedParty) : undefined,
        prefecture_id: selectedPrefecture,
        city_id: selectedCity ? String(selectedCity) : undefined
      };
      handleSearch(searchParams);
    }
  }, [isClient, handleSearch, searchText, selectedType, selectedGender, selectedParty, selectedPrefecture, selectedCity]);

  // クライアントサイドでのみsessionStorageに保存
  useEffect(() => {
    if (!isClient) return;  // クライアントサイドでない場合は処理しない
    
    try {
      sessionStorage.setItem('searchText', searchText);
      sessionStorage.setItem('selectedGender', String(selectedGender));
      sessionStorage.setItem('selectedType', String(selectedType));
      sessionStorage.setItem('selectedParty', String(selectedParty));
      sessionStorage.setItem('selectedRegion', String(selectedRegion));
      sessionStorage.setItem('selectedPrefecture', String(selectedPrefecture));
      sessionStorage.setItem('selectedCity', String(selectedCity));
      sessionStorage.setItem('searchResults', JSON.stringify(searchResults));
      sessionStorage.setItem('totalResults', String(totalResults));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }, [
    isClient, searchText, selectedGender, selectedType, selectedParty, selectedRegion, selectedPrefecture, selectedCity,
    searchResults, totalResults
  ]);

  // 地域一覧の取得
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) throw error;
        setRegions(data);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };

    fetchRegions();
  }, [supabase]);

  // 都道府県一覧の取得
  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        let query = supabase
          .from('prefectures')
          .select('*')
          .order('id', { ascending: true });

        // 地域が選択されている場合、その地域の都道府県のみを取得
        if (selectedRegion > 0) {
          query = query.eq('region_id', selectedRegion);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setPrefectures(data);
      } catch (error) {
        console.error('Error fetching prefectures:', error);
      }
    };

    fetchPrefectures();
  }, [supabase, selectedRegion]);

  // 市区町村一覧の取得
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedPrefecture) return;
      
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .eq('prefecture_id', selectedPrefecture)
          .order('id', { ascending: true });
        
        if (error) throw error;
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, [selectedPrefecture, supabase]);

  // 政党一覧の取得
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const { data, error } = await supabase
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
  }, [supabase]);

  // デバウンスされた検索関数
  const debouncedSearch = useCallback(
    (term: string) => {
      const search = async () => {
        try {
          setIsLoading(true);
          const results = await politicianAPI.search({
            s: term || undefined,
            party_id: selectedParty ? String(selectedParty) : undefined,
            chamber: selectedType === 0 ? undefined : 
                    selectedType === 1 ? '衆議院' : 
                    selectedType === 2 ? '参議院' : 
                    selectedType === 3 ? '地方選挙' : undefined,
            gender: selectedGender === 0 ? undefined : 
                   selectedGender === 1 ? '男' : 
                   selectedGender === 2 ? '女' : undefined,
            prefecture_id: selectedPrefecture ? String(selectedPrefecture) : undefined,
            city_id: selectedCity ? String(selectedCity) : undefined
          });
          if (results.data) {
            setSearchResults(results.data.data || []);
            setTotalResults(results.data.total || 0);
          }
        } catch (error) {
          console.error('検索エラー:', error);
          setSearchResults([]);
          setTotalResults(0);
        } finally {
          setIsLoading(false);
        }
      };

      const debouncedFn = debounce(search, 300);
      debouncedFn();
      return debouncedFn;
    },
    [selectedParty, selectedType, selectedGender, selectedPrefecture, selectedCity, setSearchResults, setTotalResults, setIsLoading]
  );

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (debouncedSearch) {
        const debouncedFn = debouncedSearch('');
        debouncedFn.cancel();
      }
    };
  }, [debouncedSearch]);

  // 「その他」政党のIDを定数として定義
  const OTHER_PARTY_ID = 3925;  // 数値のまま

  // 入力時の処理
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      
      if (value.length >= 1) {
        debouncedSearch(value);
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    },
    [debouncedSearch, setSearchResults, setTotalResults]
  );

  const handleGenderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedGender(Number(e.target.value));
  }, []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(Number(e.target.value));
  }, []);

  const handlePartyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParty(Number(e.target.value));
  }, []);

  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedRegion(value);
    // 地域が変更されたら、都道府県と市区町村の選択をリセット
    setSelectedPrefecture(0);
    setSelectedCity(0);
  }, []);

  const handlePrefectureChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setSelectedPrefecture(value);
    setSelectedCity(0);
  }, []);

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(Number(e.target.value));
  }, []);

  // 検索結果の更新処理
  const updateSearchResults = useCallback(() => {
    const fetchData = async () => {
      try {
        const { data: speakers, error } = await supabase
          .from('speakers')
          .select('*')
          .eq('speaker_type', selectedType === 0 ? null : selectedType)
          .eq('party_id', selectedParty === 0 ? null : selectedParty)
          .eq('region_id', selectedRegion === 0 ? null : selectedRegion)
          .eq('prefecture_id', selectedPrefecture === 0 ? null : selectedPrefecture)
          .eq('city_id', selectedCity === 0 ? null : selectedCity)
          .eq('gender', selectedGender === 0 ? null : selectedGender)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSearchResults(speakers || []);
        setTotalResults(speakers?.length || 0);
        localStorage.setItem('searchResults', JSON.stringify(speakers));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedType, selectedParty, selectedRegion, selectedPrefecture, selectedCity, selectedGender, supabase]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
        {/* <section className="text-gray-600 body-font bg-white">
          <div className="container px-5 py-2 mx-auto">
            <h1 className="text-xl font-bold text-gray-900">
              政治家一覧
            </h1>
          </div>
        </section> */}
        <div className="container px-5 pt-8 mx-auto text-center relative">
          <div className="relative flex flex-col gap-4 max-w-md mx-auto">
            <div className="relative">
              <input 
                type="text" 
                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="政治家名を入力" 
                value={searchText}
                onChange={handleInputChange}
              />
              {isLoading && <SearchingIndicator />}
            </div>
            <p 
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-blue-700 cursor-pointer text-right -mt-2 font-semibold"
            >
              詳細条件
            </p>

            {/* モーダル */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-100/10 backdrop-blur-xl flex items-start pt-12 justify-center z-50">
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
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md appearance-none bg-white"
                        value={selectedParty}
                        onChange={handlePartyChange}
                      >
                        <option value="">政党を選択</option>
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

                    {/* その他政党が選択された場合の子政党選択 */}
                    {Number(selectedParty) === OTHER_PARTY_ID && childParties.length > 0 && (
                      <div className="relative">
                        <select 
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md appearance-none bg-white"
                          value={selectedParty}
                          onChange={handlePartyChange}
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
                    )}

                    {/* 種別選択 */}
                    <div className="flex flex-col items-start gap-2 pb-2">
                      <p className="text-sm text-gray-700 font-bold">議員種別</p>
                      <div className="flex gap-3">
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="type" 
                            value="0"
                            checked={selectedType === 0}
                            onChange={handleTypeChange}
                            className="mr-1" 
                          />
                          <span className="text-sm">すべて</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="type" 
                            value="1"
                            checked={selectedType === 1}
                            onChange={handleTypeChange}
                            className="mr-1" 
                          />
                          <span className="text-sm">衆議院</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="type" 
                            value="2"
                            checked={selectedType === 2}
                            onChange={handleTypeChange}
                            className="mr-1" 
                          />
                          <span className="text-sm">参議院</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="type" 
                            value="3"
                            checked={selectedType === 3}
                            onChange={handleTypeChange}
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
                            value="0"
                            checked={selectedGender === 0}
                            onChange={handleGenderChange}
                            className="mr-1" 
                          />
                          <span className="text-sm">すべて</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="1"
                            checked={selectedGender === 1}
                            onChange={handleGenderChange}
                            className="mr-1" 
                          />
                          <span className="text-sm">男性</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="2"
                            checked={selectedGender === 2}
                            onChange={handleGenderChange}
                            className="mr-1" 
                          />
                          <span className="text-sm">女性</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* 地域選択 */}
                      <div className="relative">
                        <select 
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md appearance-none bg-white"
                          value={selectedRegion}
                          onChange={handleRegionChange}
                        >
                          <option value={0}>地域を選択</option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>

                      {/* 都道府県選択 */}
                      {selectedRegion > 0 && (
                        <div className="relative">
                          <select 
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md appearance-none bg-white"
                            value={selectedPrefecture}
                            onChange={handlePrefectureChange}
                          >
                            <option value={0}>都道府県を選択</option>
                            {prefectures.map((prefecture) => (
                              <option key={prefecture.id} value={prefecture.id}>
                                {prefecture.name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* 市区町村選択 */}
                      {selectedPrefecture > 0 && (
                        <div className="relative">
                          <select 
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md appearance-none bg-white"
                            value={selectedCity}
                            onChange={handleCityChange}
                          >
                            <option value={0}>市区町村を選択</option>
                            {cities.map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        const searchParams = {
                          s: searchText,
                          chamber: selectedType === 0 ? undefined : 
                                  selectedType === 1 ? '衆議院' : 
                                  selectedType === 2 ? '参議院' : 
                                  selectedType === 3 ? '地方選挙' : undefined,
                          gender: selectedGender === 0 ? undefined : 
                                 selectedGender === 1 ? '男' : 
                                 selectedGender === 2 ? '女' : undefined,
                          party_id: selectedParty ? String(selectedParty) : undefined,
                          prefecture_id: selectedPrefecture,
                          city_id: selectedCity ? String(selectedCity) : undefined
                        };
                        console.log('Sending search params:', searchParams);
                        handleSearch(searchParams);
                        setIsModalOpen(false);
                      }}
                      className="w-full px-4 py-3 border rounded-md bg-gray-900 text-white hover:bg-gray-800"
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
            <h1 className="text-xl font-bold text-gray-900">
              政治家一覧
            </h1>
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
                      src={getImagePath(politician.image_path)}
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
                        {politician.parties?.name || '無所属'} / 
                        {politician.chamber === '地方選挙' ? '地方議員' : politician.chamber || '不明'} / 
                        {politician.prefectures?.name || '地域不明'} /
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

