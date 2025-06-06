'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import Header from '@/components/Navs/Header'
import Footer from '@/components/Navs/Footer'
import Link from 'next/link'
import Image from 'next/image'
import path from 'path'
import { useSearchParams } from 'next/navigation'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import ItemListJsonLd from '@/components/ItemListJsonLd';


interface Tag {
  id: string;
  name: string;
}

interface Party {
  id: number;
  uuid: string;
  name: string;
  abbreviation?: string;
  parent_id: number | null;
  order: number;
  leader_name?: string;
  description?: string;
  founded_date?: string;
  dissolved_date?: string;
  official_website?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
}

interface Statement {
  id: string;
  title: string;
  content: string | null;
  statement_date: string | null;
  image_path: string;
  video_path: string | null;
  video_thumbnail_path: string | null;
  evidence_url: string | null;
  created_at: string;
  speaker: {
    id: string;
    last_name: string;
    first_name: string;
    party: {
      name: string;
    };
    chamber: string | null;
    prefectures: {
      name: string;
    }[];
  };
}

interface SupabaseStatement {
  id: string
  title: string
  content: string
  statement_date: string
  image_path: string | null
  video_path: string | null
  video_thumbnail_path: string | null
  evidence_url: string | null
  created_at: string
  speaker: {
    id: string
    last_name: string
    first_name: string
    party: {
      name: string
    }
    chamber: string | null
    prefectures: {
      name: string
    }[]
    image_url?: string
  }
}

interface StatementTag {
  statement_id: string;
  tag_id: string;
}

// ひらがなをカタカナに変換する関数
const hiraganaToKatakana = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, match => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
};

// カタカナをひらがなに変換する関数
const katakanaToHiragana = (str: string) => {
  return str.replace(/[\u30A1-\u30F6]/g, match => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
};

// 漢字をひらがなに変換する関数
const kanjiToHiragana = async (str: string) => {
  try {
    const response = await fetch(`https://jqfxwjhffbyketlrygiw.supabase.co/functions/v1/convert-kana?text=${encodeURIComponent(str)}`)
    const data = await response.json()
    return data.hiragana
  } catch (error) {
    return str
  }
};

function StatementsContent() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const searchParams = useSearchParams()
  const [statements, setStatements] = useState<Statement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState(searchParams.get('search') || '')
  const [isSearching, setIsSearching] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [tagSearchText, setTagSearchText] = useState('')
  const [isTagSearchOpen, setIsTagSearchOpen] = useState(false)
  const [filteredTagsList, setFilteredTagsList] = useState<Tag[]>([])
  const [selectedParty, setSelectedParty] = useState<number>(0)
  const [selectedChildParty, setSelectedChildParty] = useState<number | null>(null)
  const [parties, setParties] = useState<Party[]>([])
  const [speakerSearchText, setSpeakerSearchText] = useState(searchParams.get('speaker') || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const statementsPerPage = 20

  // タグ一覧の取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setTags(data || [])
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }

    fetchTags()
  }, [supabase])

  // 政党一覧の取得
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const { data, error } = await supabase
          .from('parties')
          .select('*')
          .order('order', { ascending: true })
          .order('name', { ascending: true })

        if (error) throw error
        setParties(data || [])
      } catch (error) {
        console.error('Error fetching parties:', error)
      }
    }

    fetchParties()
  }, [supabase])

  // メモ化された親政党フィルタリング
  const parentParties = useMemo(() => 
    parties.filter(party => !party.parent_id).sort((a, b) => a.order - b.order),
    [parties]
  )

  // メモ化された子政党フィルタリング
  const childParties = useMemo(() => 
    parties.filter(party => {
      if (!selectedParty) return false
      return party.parent_id === selectedParty
    }).sort((a, b) => a.order - b.order),
    [parties, selectedParty]
  )

  // 「その他」政党のIDを定数として定義
  const OTHER_PARTY_ID = 3925

  // タグ検索のフィルタリング
  useEffect(() => {
    if (tagSearchText) {
      const filtered = tags.filter((tag: Tag) =>
        tag.name.toLowerCase().includes(tagSearchText.toLowerCase()) &&
        !selectedTags.some(selected => selected.id === tag.id)
      )
      setFilteredTagsList(filtered)
      setIsTagSearchOpen(true)
    } else {
      setFilteredTagsList([])
      setIsTagSearchOpen(false)
    }
  }, [tagSearchText, tags, selectedTags])

  // タグの追加
  const handleAddTag = (tag: Tag) => {
    setSelectedTags([...selectedTags, tag])
    setTagSearchText('')
    setIsTagSearchOpen(false)
  }

  // タグの削除
  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId))
  }

  // 検索関数をuseCallbackでメモ化
  const fetchStatements = useCallback(async () => {
    try {
      setIsLoading(true)
      setIsSearching(true)

      let query = supabase
        .from('statements')
        .select(`
          id,
          title,
          content,
          statement_date,
          image_path,
          video_path,
          video_thumbnail_path,
          evidence_url,
          created_at,
          speaker:speakers (
            id,
            last_name,
            first_name,
            party:parties (
              id,
              name
            ),
            chamber,
            prefectures (
              name
            )
          )
        `, { count: 'exact' })

      // 検索条件を配列で管理
      const conditions = []

      if (searchText) {
        conditions.push(`title.ilike.%${searchText}%,content.ilike.%${searchText}%`)
      }

      if (speakerSearchText) {
        conditions.push(`last_name.ilike.%${speakerSearchText}%,first_name.ilike.%${speakerSearchText}%`)
      }

      // 条件をORで結合
      if (conditions.length > 0) {
        query = query.or(conditions.join(','))
      }

      // 日付範囲検索
      if (startDate) query = query.gte('statement_date', startDate)
      if (endDate) query = query.lte('statement_date', endDate)

      // タグ検索の最適化
      if (selectedTags.length > 0) {
        const { data: statementTags } = await supabase
          .from('statement_tag')
          .select('statement_id')
          .in('tag_id', selectedTags.map(tag => tag.id))
          .eq('tag_id', selectedTags[0].id)

        if (statementTags && statementTags.length > 0) {
          query = query.in('id', statementTags.map(st => st.statement_id))
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000')
        }
      }

      // 政党検索の最適化
      if (selectedParty > 0) {
        if (selectedParty === OTHER_PARTY_ID) {
          if (selectedChildParty) {
            query = query.eq('speaker.party_id', selectedChildParty)
          } else if (childParties.length > 0) {
            query = query.in('speaker.party_id', childParties.map(party => party.id))
          }
        } else {
          query = query.eq('speaker.party_id', selectedParty)
        }
      }

      // ページネーションの適用
      query = query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * statementsPerPage, currentPage * statementsPerPage - 1)

      const { data, error, count } = await query

      if (error) throw error

      setStatements(data as unknown as Statement[])
      if (count !== null) {
        setTotalResults(count)
        setTotalPages(Math.ceil(count / statementsPerPage))
      }
    } catch (error) {
      console.error('Error fetching statements:', error)
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }, [
    supabase,
    searchText,
    speakerSearchText,
    startDate,
    endDate,
    selectedTags,
    selectedParty,
    selectedChildParty,
    childParties,
    currentPage,
    statementsPerPage
  ])

  // ページネーションコンポーネント
  const Pagination = () => {
    if (totalPages <= 1) return null

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    const maxVisiblePages = 4
    let visiblePages = pages

    if (totalPages > maxVisiblePages) {
      const start = Math.max(0, Math.min(currentPage - 3, totalPages - maxVisiblePages))
      visiblePages = pages.slice(start, start + maxVisiblePages)
    }

    const handlePageClick = (page: number) => {
      setCurrentPage(page)
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

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
    )
  }

  // イベントハンドラをuseCallbackでメモ化
  const handleSearch = useCallback(() => {
    setIsModalOpen(false)
    setCurrentPage(1) // 検索時にページを1に戻す
    fetchStatements()
  }, [fetchStatements])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)
    setIsSearching(!!value)
    setCurrentPage(1)
  }, [])

  const handleSpeakerSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSpeakerSearchText(value)
    setIsSearching(!!value)
    setCurrentPage(1)
  }, [])

  const handlePartyChange = useCallback((value: string) => {
    setSelectedParty(Number(value))
    setSelectedChildParty(null)
    setCurrentPage(1)
  }, [])

  const handleChildPartyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChildParty(Number(e.target.value))
  }

  // getMediaPathをメモ化
  const getMediaPath = useCallback((statement: Statement) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return '/images/video-thumbnail-no-image.jpg'

    if (statement.image_path) {
      return `${supabaseUrl}/storage/v1/object/public/statements/${statement.image_path}`
    }
    
    if (statement.video_thumbnail_path) {
      return `${supabaseUrl}/storage/v1/object/public/video-thumbnails/${statement.video_thumbnail_path}`
    }

    return '/images/video-thumbnail-no-image.jpg'
  }, [])

  // ビューポート内の画像かどうかを判定する関数
  const shouldPrioritize = (index: number) => {
    // モバイルでは1つ、デスクトップでは2つの画像を優先
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? index < 1 : index < 2;
    }
    return index < 2; // SSRのデフォルト値
  };

  // 次の画像をプリフェッチする関数
  const prefetchNextImage = (index: number) => {
    if (index < statements.length - 1) {
      const nextImageUrl = getMediaPath(statements[index + 1]);
      const prefetchImage = document.createElement('link');
      prefetchImage.rel = 'prefetch';
      prefetchImage.as = 'image';
      prefetchImage.href = nextImageUrl;
      document.head.appendChild(prefetchImage);
    }
  };

  useEffect(() => {
    fetchStatements()
  }, [supabase, searchText, startDate, endDate, selectedTags, selectedParty, selectedChildParty, speakerSearchText, currentPage])

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: '問題発言一覧', item: '/statements' },
        ]}
      />
      {statements.length > 0 && (
        <ItemListJsonLd
          items={statements.map((statement, index) => ({
            position: index + 1,
            name: statement.title,
            url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mondai-hatsugen.com'}/statements/${statement.id}`,
            image: getMediaPath(statement),
          }))}
        />
      )}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <section className="text-gray-600 body-font bg-white">
          <div className="container px-5 py-2 mx-auto max-w-screen-lg">
            <Header />
          </div>
        </section>
        <main className="w-full max-w-full overflow-x-hidden bg-gray-50 flex-grow">
          <div className="container px-5 pt-8 mx-auto text-center relative">
            <div className="relative flex flex-col gap-4 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="発言内容をざっくり入力"
                  value={searchText}
                  onChange={handleSearchChange}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              <p
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-blue-700 cursor-pointer text-right -mt-2 font-semibold"
              >
                高度な検索
              </p>
            </div>
          </div>

          {/* 詳細検索モーダル */}
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-gray-100/10 backdrop-blur-xl flex items-start pt-12 justify-center z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsModalOpen(false);
                }
              }}
            >
              <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">高度な検索</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-700 font-semibold">タグ</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tagSearchText}
                      onChange={(e) => setTagSearchText(e.target.value)}
                      placeholder="タグを検索"
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {isTagSearchOpen && filteredTagsList.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                        {filteredTagsList.map((tag: Tag) => (
                          <div
                            key={tag.id}
                            onClick={() => handleAddTag(tag)}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                          >
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map(tag => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm mb-4"
                      >
                        <span>{tag.name}</span>
                        <button
                          onClick={() => handleRemoveTag(tag.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-700 font-semibold">発言者</label>
                    <input
                      type="text"
                      value={speakerSearchText}
                      onChange={handleSpeakerSearchChange}
                      placeholder="発言者名を入力"
                      className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-700 font-semibold">発言日</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-1/2 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">〜</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-1/2 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-700 font-semibold">政党</label>
                    <div className="relative">
                      <select
                        value={selectedParty.toString()}
                        onChange={(e) => handlePartyChange(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>すべて</option>
                        {parentParties.map(party => (
                          <option key={party.id} value={party.id}>
                            {party.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedParty === OTHER_PARTY_ID && childParties.length > 0 && (
                      <div className="relative mt-2">
                        <select
                          value={selectedChildParty?.toString() || ''}
                          onChange={handleChildPartyChange}
                          className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">選択してください</option>
                          {childParties.map(party => (
                            <option key={party.id} value={party.id}>
                              {party.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-3 border rounded-md bg-gray-900 text-white hover:bg-gray-800"
                  >
                    検索
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="container px-3 pt-8 mx-auto max-w-screen-md">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">
                問題発言一覧
              </h1>
              {statements.length > 0 && (
                <p className="text-sm text-gray-600">
                  検索結果：{statements.length}件
                </p>
              )}
            </div>
          </div>
          <div className="container pt-6 pb-8 px-3 mx-auto max-w-screen-md">
            {isLoading ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">読み込み中...</p>
              </div>
            ) : statements.length > 0 ? (
              <>
                <div className="columns-1 md:columns-2 gap-4">
                  {statements.map((statement: Statement, index: number) => (
                    <div key={statement.id} className="break-inside-avoid mb-4">
                      <Link 
                        href={`/statements/${statement.id}`} 
                        className="block"
                        prefetch={true}
                      >
                        <div className="border border-gray-200 rounded-md bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center relative">
                            <Image
                              src={getMediaPath(statement)}
                              alt={statement.title}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover object-center rounded-t-md"
                              quality={75}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              priority={shouldPrioritize(index)}
                              onLoad={() => prefetchNextImage(index)}
                            />
                            {statement.video_thumbnail_path && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-900">
                                {statement.speaker?.last_name || ''} {statement.speaker?.first_name || ''}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {statement.speaker?.party?.name || '無所属'}
                              </span>
                            </div>
                            {statement.content && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                {statement.content}
                              </p>
                            )}
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              {statement.statement_date && (
                                <span className="mr-4">
                                  {new Date(statement.statement_date).toLocaleDateString('ja-JP')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                <Pagination />
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">登録されている問題発言がありません</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <StatementsContent />
    </Suspense>
  )
}
