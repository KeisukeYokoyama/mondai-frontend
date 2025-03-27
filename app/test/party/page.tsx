'use client'

import { useEffect, useState } from 'react'
import { partiesAPI } from '@/utils/supabase/parties'
import type { Party } from '@/utils/supabase/types'

export default function PartyTestPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParties = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await partiesAPI.getParties()
        
        if (error) {
          throw error
        }

        setParties(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchParties()
  }, [])

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">エラー: {error}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">政党一覧</h1>
      
      <div className="mb-4">
        <p>取得件数: {parties.length}件</p>
      </div>

      <div className="grid gap-4">
        {parties.map((party) => (
          <div 
            key={party.id} 
            className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{party.name}</h2>
            <div className="mt-2 text-gray-600">
              <p>略称: {party.abbreviation}</p>
              <p>順序: {party.order}</p>
              {party.parent_id && (
                <p>親政党ID: {party.parent_id}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* デバッグ情報 */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">デバッグ情報</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(parties, null, 2)}
        </pre>
      </div>
    </div>
  )
}
