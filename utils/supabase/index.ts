// 相対パスでの正しいインポート
export * from '@/utils/supabase/politicians'
export * from '@/utils/supabase/statements'
export * from '@/utils/supabase/parties'
export * from '@/utils/supabase/tags'
export * from '@/utils/supabase/types'

// 共通のエラーハンドリング
export const handleSupabaseError = (error: any): string => {
  if (!error) return ''

  // Supabaseの一般的なエラー
  if (error.code === 'PGRST204') {
    return '認証が必要です'
  }
  if (error.code === 'P0001') {
    return '権限がありません'
  }
  if (error.code === '23505') {
    return '既に存在するデータです'
  }
  if (error.code === '23503') {
    return '関連するデータが存在しません'
  }

  // カスタムエラーメッセージ
  if (error.message) {
    return error.message
  }

  // その他のエラー
  console.error('Unexpected error:', error)
  return '予期せぬエラーが発生しました'
}

// 共通の型定義
export type SupabaseResponse<T> = {
  data: T | null
  error: any
}

// ページネーションの型
export type PaginationParams = {
  page?: number
  limit?: number
}

// 検索パラメータの基本型
export type SearchParams = {
  query?: string
} & PaginationParams 