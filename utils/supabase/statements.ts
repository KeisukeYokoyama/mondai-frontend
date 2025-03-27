import { supabase } from '@/lib/supabase'

export const statementAPI = {
  // 一覧取得
  getAll: async () => {
    return await supabase
      .from('statements')
      .select('*')
  }
}
