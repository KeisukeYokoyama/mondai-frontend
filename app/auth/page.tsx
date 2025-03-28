'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FaXTwitter } from "react-icons/fa6";
import Image from 'next/image';
import Link from 'next/link';

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleSignIn = async () => {
    try {
      console.log('Starting auth process...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-4">
            <Image src="/images/logo.svg" alt="問題発言ドットコム" width={36} height={36} />
            <h2 className="text-2xl font-bold text-gray-900">
              問題発言ドットコム
            </h2>
          </div>
          <p className="mt-8 text-sm text-gray-600">
            ログインすると問題発言の登録ができるようになります
          </p>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors hover:cursor-pointer"
        >
          <FaXTwitter className="w-4 h-4" />
          ログイン
        </button>
        <p className="mt-8 text-xs text-gray-600 text-center">
          <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
            プライバシーポリシー
          </Link>
          <span className="text-gray-600 mx-2">|</span>
          <Link href="/terms" className="text-blue-600 hover:text-blue-800">
            利用規約
          </Link>
        </p>
        <p className="mt-4 text-xs text-gray-600 text-center">
          上記リンクをご確認して同意の上、ご利用ください
        </p>
      </div>
    </div>
  )
}