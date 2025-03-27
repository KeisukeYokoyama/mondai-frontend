import { supabase } from '@/lib/supabase'

export const tagAPI = {
  // 一覧取得
  getAll: async () => {
    return await supabase
      .from('tags')
      .select('*')
  }
}
