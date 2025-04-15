'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Header from '@/components/Navs/Header'
import Footer from '@/components/Navs/Footer'
import Link from 'next/link'
import debounce from 'lodash/debounce'
import Image from 'next/image'
import { commentatorAPI } from '@/utils/supabase/commentators'
import { MdArrowForwardIos } from "react-icons/md";
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

// 検索結果の型定義
type SearchResult = {
  id: string;
  speaker_type: number;
  last_name?: string | null;
  first_name?: string | null;
  last_name_kana?: string | null;
  first_name_kana?: string | null;
  age?: string | null;
  gender?: string | null;
  biography?: string | null;
  image_path?: string | null;
  created_at?: string;
  updated_at?: string;
  birthday?: string | null;
  official_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  line_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
};

// 検索中のインジケータコンポーネント
const SearchingIndicator = () => (
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
  </div>
);

// 画像パスを処理するヘルパー関数
const getImagePath = (path?: string | null) => {
  if (!path) return '/images/default-avatar.png';
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return '/images/default-avatar.png';
  }

  const filename = path.split('/').pop();
  if (!filename) {
    return '/images/default-avatar.png';
  }

  return `${supabaseUrl}/storage/v1/object/public/politicians/${filename}`;
};

export default function Home() {
  const supabase = createClientComponentClient()
  
  // 状態管理
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const commentatorsPerPage = 20;

  // 発言者種別の定義
  // const speakerTypes = {
  //   2: 'ジャーナリスト',
  //   3: '学者・専門家',
  //   4: '評論家・言論人',
  //   5: 'その他'
  // } as const;

  // 検索機能の実装
  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await commentatorAPI.search({
        s: searchText,
        page: currentPage,
        per_page: commentatorsPerPage
      });

      if (error) throw error;

      if (data) {
        setSearchResults(data.data);
        setTotalResults(data.total);
        setTotalPages(Math.ceil(data.total / commentatorsPerPage));
      }
    } catch (error) {
      console.error('検索エラー:', error);
      setSearchResults([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [searchText, currentPage]);

  // デバウンスされた検索
  const debouncedSearch = useMemo(
    () => debounce(() => {
      handleSearch();
    }, 300),
    [handleSearch]
  );

  // 入力時の処理
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      // IMEの入力中は検索をスキップ
      const event = e.nativeEvent as InputEvent;
      if (!event.isComposing) {
        debouncedSearch();
      }
    },
    [debouncedSearch]
  );

  // IME確定時の処理を追加
  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setSearchText(value);
      debouncedSearch();
    },
    [debouncedSearch]
  );

  // 検索条件変更時の検索実行
  useEffect(() => {
    if (currentPage === 1) {
      debouncedSearch();
    } else {
      setCurrentPage(1);
    }
  }, [searchText, debouncedSearch, currentPage]);

  // ページ変更時の検索実行
  useEffect(() => {
    handleSearch();
  }, [currentPage, handleSearch]);

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
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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
            className={`w-8 h-8 text-sm flex items-center justify-center border border-gray-200 ${
              currentPage === page ? 'bg-indigo-500 text-white' : 'bg-white'
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

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: '言論人一覧', item: '/commentators' },
        ]}
      />
      <div className="min-h-screen bg-gray-50">
        <section className="text-gray-600 body-font bg-white">
          <div className="container px-5 py-2 mx-auto max-w-screen-lg">
            <Header />
          </div>
        </section>
        <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
          <div className="container px-5 pt-8 mx-auto text-center relative">
            <div className="relative flex flex-col gap-4 max-w-md mx-auto">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="発言者の名前を入力" 
                  value={searchText}
                  onChange={handleInputChange}
                  onCompositionEnd={handleCompositionEnd}
                />
                {isLoading && <SearchingIndicator />}
              </div>
              {/* <select
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(Number(e.target.value))}
              >
                <option value="0">すべての種別</option>
                <option value="2">ジャーナリスト</option>
                <option value="3">学者・専門家</option>
                <option value="4">評論家・言論人</option>
                <option value="5">その他</option>
              </select> */}
            </div>
          </div>
          <div className="container px-3 pt-8 mx-auto max-w-screen-md">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">
                言論人一覧
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
          <div className="container px-0 pt-6 pb-8 mx-auto max-w-screen-md">
            <div className="flex flex-col divide-y divide-gray-200">
              {Array.isArray(searchResults) && searchResults.length > 0 ? (
                <>
                  {searchResults.map((commentator, index) => (
                    <Link 
                      href={`/commentators/${commentator.id}`}
                      key={commentator.id || index} 
                      title={`${commentator.last_name} ${commentator.first_name}の発言`}
                      className="flex items-center justify-between py-4 px-4 bg-white w-full hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center flex-grow">
                        <Image
                          src={getImagePath(commentator.image_path)}
                          alt={`${commentator.last_name} ${commentator.first_name}`} 
                          className="w-20 h-20 object-cover rounded-full mr-4 shadow-md" 
                          width={64}
                          height={64}
                        />
                        <div className="flex-1 min-w-0">
                          <h2 className="text-gray-900">
                            <span className="font-bold text-lg">
                              {commentator.last_name} {commentator.first_name}
                            </span>
                            <span className="text-gray-600 text-sm ml-2">
                              {commentator.age ? `${commentator.age}歳` : ''} 
                              {commentator.gender ? ` / ${commentator.gender}` : ''}
                            </span>
                          </h2>
                          <p className="text-gray-600 text-sm mt-1">
                            {/* {speakerTypes[commentator.speaker_type as keyof typeof speakerTypes] || '種別不明'} */}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center ml-4 -mr-1 bg-gray-100 rounded-full p-2">
                        <span className="text-gray-700 text-sm font-bold">
                          <MdArrowForwardIos />
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Pagination />
                </>
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
    </>
  );
}

