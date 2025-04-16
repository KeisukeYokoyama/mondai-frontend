import { getSupabaseClient } from './client'

export const tagAPI = {
  // 一覧取得
  getAll: async () => {
    return await getSupabaseClient()
      .from('tags')
      .select('*')
      .order('name')
  },

  // タグの追加
  create: async (name: string) => {
    return await getSupabaseClient()
      .from('tags')
      .insert([{ name }])
      .select()
      .single()
  }
}
