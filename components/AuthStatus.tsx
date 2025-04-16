'use client'

import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'

interface AuthStatusProps {
  className?: string;
}

// Supabaseのユーザーメタデータの型を拡張
interface ExtendedUserMetadata {
  user_name?: string;
  display_name?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
}

export default function AuthStatus({ className = '' }: AuthStatusProps) {
  const { user, loading } = useAuth()
  const [userState, setUser] = useState<typeof user | null>(null)

  useEffect(() => {
    const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    })
  }, [])

  if (loading) return null

  // user_metadataの型をキャスト
  const metadata = user?.user_metadata as ExtendedUserMetadata

  // 表示名の優先順位: full_name > name > user_name
  const displayName = metadata?.full_name || metadata?.name || metadata?.user_name

  // アバター画像のURLを取得
  const avatarUrl = metadata?.avatar_url || '/default-avatar.png'

  return (
    <div className={`text-base ${className}`}>
      {user ? (
        <div className="flex items-center justify-end">
          <div className="ml-2">
            <Image
              src={avatarUrl}
              alt={`${displayName || 'ユーザー'}のアバター`}
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <span className='block py-2 px-3 text-gray-900 hover:bg-gray-100'>ようこそ{displayName}さん</span>
        </div>
      ) : (
        <span className='block py-2 px-3 text-gray-900 hover:bg-gray-100'>ようこそゲストさん</span>
      )}
    </div>
  )
} 