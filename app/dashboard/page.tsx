'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
          {user && user.user_metadata && (
            <div className="mt-4 flex items-center gap-4">
              <Image 
                src={
                  (user.user_metadata.avatar_url?.replace('_normal', '') || 
                  user.user_metadata.avatar_url || 
                  '/default-avatar.png')
                }
                alt={`${user.user_metadata.full_name || 'ユーザー'}のアバター`}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="text-lg">ようこそ、{user.user_metadata.full_name || 'ゲスト'}さん</p>
                <p className="text-gray-600">@{user.user_metadata.user_name || 'unknown'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}