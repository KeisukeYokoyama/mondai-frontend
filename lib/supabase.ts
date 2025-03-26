import { createClient } from '@supabase/supabase-js'

// 直接URLを書くのではなく、環境変数を使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

export type UserMetadata = {
  full_name?: string
  user_name?: string
  avatar_url?: string
}