// utils/supabase/location.ts
import { supabase } from '@/lib/supabase'
import type { Region, Prefecture, City } from '@/utils/supabase/types'
import type { SupabaseResponse } from '@/utils/supabase/index'

export const locationAPI = {
  // 地域一覧取得
  getRegions: async (): Promise<SupabaseResponse<Region[]>> => {
    return await supabase
      .from('regions')
      .select('id, name, slug, created_at, updated_at')
      .order('id')
  },

  // 都道府県一覧取得
  getPrefectures: async (): Promise<SupabaseResponse<(Prefecture & { regions: Region[] })[]>> => {
    return await supabase
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
  },

  // 指定された都道府県の市区町村一覧を取得
  getCities: async (prefectureId: number): Promise<SupabaseResponse<(City & { prefectures: Prefecture[] })[]>> => {
    return await supabase
      .from('cities')
      .select(`
        id,
        name,
        prefecture_id,
        created_at,
        updated_at,
        prefectures (
          id,
          name,
          slug,
          region_id,
          created_at,
          updated_at
        )
      `)
      .eq('prefecture_id', prefectureId)
      .order('id')
  }
}