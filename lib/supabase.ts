import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jqfxwjhffbyketlrygiw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZnh3amhmZmJ5a2V0bHJ5Z2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MDEzMjksImV4cCI6MjA1ODQ3NzMyOX0.R8O1Bjker8lGxTZGbb9pwfNyIZA7-HsRE6Kv5wqT6gg' // あなたのanon keyを設定

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