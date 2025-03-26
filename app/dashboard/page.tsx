'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { UserMetadata } from '@/types/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ user_metadata: UserMetadata } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

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
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
          {user && (
            <div className="mt-4">
              <p className="text-lg">ようこそ、{user.user_metadata.full_name}さん</p>
              <p className="text-gray-600">@{user.user_metadata.user_name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}