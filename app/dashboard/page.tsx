'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { UserMetadata } from '@/types/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
          {user && (
            <div className="mt-4 flex items-center gap-4">
              <img 
                src={user.user_metadata.avatar_url?.replace('_normal', '') || user.user_metadata.avatar_url} 
                alt={`${user.user_metadata.full_name}のアバター`}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-lg">ようこそ、{user.user_metadata.full_name}さん</p>
                <p className="text-gray-600">@{user.user_metadata.user_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}