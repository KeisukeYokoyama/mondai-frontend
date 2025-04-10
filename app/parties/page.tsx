'use client'

import { useEffect, useState, useCallback } from 'react'
import { partiesAPI } from '@/utils/supabase/parties'
import type { Party } from '@/utils/supabase/types'
import Header from '@/components/Navs/Header'
import Footer from '@/components/Navs/Footer'
import Link from 'next/link'
import debounce from 'lodash/debounce'

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [filteredParties, setFilteredParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const { data, error } = await partiesAPI.getParties()
        if (error) throw error
        // カテゴリの政党（parent_id: 3925）を除外
        const filteredParties = (data || []).filter(party => party.parent_id !== 3925)
        setParties(filteredParties)
        setFilteredParties(filteredParties)
      } catch (err) {
        setError('政党データの取得に失敗しました')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchParties()
  }, [])

  // 検索機能の実装
  const handleSearch = useCallback(
    debounce((term: string) => {
      setIsLoading(true)
      const filtered = parties.filter(party => 
        party.name.toLowerCase().includes(term.toLowerCase()) ||
        (party.leader_name && party.leader_name.toLowerCase().includes(term.toLowerCase()))
      )
      setFilteredParties(filtered)
      setIsLoading(false)
    }, 300),
    [parties]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)
    handleSearch(value)
  }

  if (loading) return <div className="p-4">読み込み中...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
          <Header />
        </div>
      </section>
      <main className="w-full overflow-x-hidden bg-gray-100">
        <div className="container px-4 py-8 max-w-screen-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">政党一覧</h1>
            <div className="relative md:w-5/12 w-3/5">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="政党名または代表者名で絞り込み"
                value={searchText}
                onChange={handleInputChange}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3 max-w-36">
                    政党名
                  </th>
                  <th scope="col" className="px-6 py-3">
                    政党種別
                  </th>
                  <th scope="col" className="px-6 py-3">
                    代表者
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.map((party) => (
                  <tr
                    key={party.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-normal max-w-36 dark:text-white"
                    >
                      <Link 
                        href={`/parties/${party.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {party.name}
                      </Link>
                    </th>
                    <td className="px-6 py-4">
                      {party.parent_id ? '諸派' : '国政政党'}
                    </td>
                    <td className="px-6 py-4">
                      {party.leader_name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
