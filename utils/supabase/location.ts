// utils/supabase/location.ts
import { getSupabaseClient } from './client'
import type { Region, Prefecture, City } from '@/utils/supabase/types'
import type { SupabaseResponse } from '@/utils/supabase/index'

export const locationAPI = {
  // 地域一覧取得
  getRegions: async (): Promise<SupabaseResponse<Region[]>> => {
    return await getSupabaseClient()
      .from('regions')
      .select('id, name, slug, created_at, updated_at')
      .order('id')
  },

  // 都道府県一覧取得
  getPrefectures: async (): Promise<SupabaseResponse<(Prefecture & { regions: Region[] })[]>> => {
    const { data, error } = await getSupabaseClient()
      .from('prefectures')
      .select(`
        id,
        name,
        slug,
        region_id,
        created_at,
        updated_at,
        regions (
          id,
          name,
          slug,
          created_at,
          updated_at
        )
      `)
      .order('id')

    return { data, error }
  },

  getCities: async (prefectureId: number): Promise<SupabaseResponse<City[]>> => {
    const { data, error } = await getSupabaseClient()
      .from('cities')
      .select(`
        id,
        name,
        slug,
        prefecture_id,
        created_at,
        updated_at
      `)
      .eq('prefecture_id', prefectureId)
      .order('id')

    return { data, error }
  }
}