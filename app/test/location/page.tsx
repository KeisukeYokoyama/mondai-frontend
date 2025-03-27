// app/test/location/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { locationAPI } from '@/utils/supabase/location'

export default function LocationTest() {
  const [regions, setRegions] = useState<any[]>([])
  const [prefectures, setPrefectures] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [selectedPrefId, setSelectedPrefId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // 地域データ取得
        const { data: regionsData, error: regionsError } = await locationAPI.getRegions()
        if (regionsError) throw regionsError
        setRegions(regionsData || [])

        // 都道府県データ取得
        const { data: prefecturesData, error: prefecturesError } = await locationAPI.getPrefectures()
        if (prefecturesError) throw prefecturesError
        setPrefectures(prefecturesData || [])
      } catch (err) {
        setError('データの取得に失敗しました')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 市区町村データ取得
  const handlePrefectureChange = async (prefId: number) => {
    setSelectedPrefId(prefId)
    try {
      const { data: citiesData, error: citiesError } = await locationAPI.getCities(prefId)
      if (citiesError) throw citiesError
      setCities(citiesData || [])
    } catch (err) {
      setError('市区町村データの取得に失敗しました')
      console.error(err)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Location API Test</h1>

      {/* 地域一覧 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">地域一覧</h2>
        <ul className="list-disc pl-5">
          {regions.map(region => (
            <li key={region.id}>
              {region.name} ({region.slug})
            </li>
          ))}
        </ul>
      </section>

      {/* 都道府県一覧 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">都道府県一覧</h2>
        <select 
          className="border p-2 rounded"
          onChange={(e) => handlePrefectureChange(Number(e.target.value))}
        >
          <option value="">選択してください</option>
          {prefectures.map(pref => (
            <option key={pref.id} value={pref.id}>
              {pref.name} (地域: {pref.regions?.[0]?.name})
            </option>
          ))}
        </select>
      </section>

      {/* 市区町村一覧 */}
      {selectedPrefId && (
        <section>
          <h2 className="text-xl font-semibold mb-4">市区町村一覧</h2>
          <ul className="list-disc pl-5">
            {cities.map(city => (
              <li key={city.id}>
                {city.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* デバッグ情報 */}
      <section className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-4">デバッグ情報</h2>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify({ regions, prefectures, cities }, null, 2)}
        </pre>
      </section>
    </div>
  )
}