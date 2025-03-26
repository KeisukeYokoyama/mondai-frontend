'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AuthStatus() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <div className="bg-gray-800 text-white p-2 text-center text-sm">
      {user ? (
        <span>ログイン中: {user.user_metadata.user_name}</span>
      ) : (
        <span>ゲスト</span>
      )}
    </div>
  )
} 