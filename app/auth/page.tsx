'use client'

import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const handleSignIn = async () => {
    try {
      console.log('Starting auth process...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3000/auth/callback'
            : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })

      console.log('Auth response:', { data, error })

      if (error) {
        console.error('Auth error:', error)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            問題アプリへようこそ
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Twitterアカウントでログインまたは新規登録
          </p>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-[#1DA1F2] text-white py-3 px-4 rounded-lg hover:bg-[#1a91da] transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Twitterで続ける
        </button>
      </div>
    </div>
  )
}