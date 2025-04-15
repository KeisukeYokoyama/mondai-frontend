'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FaXTwitter } from "react-icons/fa6";
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react'

function AuthContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user && !loading) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      console.log('Starting auth process...')
      
      const currentPath = window.location.pathname + window.location.search;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
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
    <div className="h-screen flex justify-center">
      <div className="max-w-md w-full pt-20 px-10 bg-white">
        <div className="text-center mb-5">
          <Link href="/">
            <div className="flex items-center justify-center gap-4">
              <Image src="/images/Logo.svg" alt="問題発言ドットコム ロゴ" width={36} height={36} />
              <h2 className="text-2xl font-bold text-gray-900">
              問題発言ドットコム
            </h2>
          </div>
          </Link>
          <p className="mt-8 text-sm text-gray-600">
            スクショ登録にはログインが必要です！
          </p>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-sm hover:bg-gray-800 transition-colors hover:cursor-pointer"
        >
          <FaXTwitter className="w-8 h-8 pr-2" />
          <span className="text-sm">X(Twitter)でログイン</span>
        </button>
        <p className="mt-8 text-xs text-gray-600 text-center">
          <Link href="/privacy" className="text-blue-700 hover:text-blue-800">
            プライバシーポリシー
          </Link>
          <span className="text-gray-600 mx-2">|</span>
          <Link href="/terms" className="text-blue-700 hover:text-blue-800">
            利用規約
          </Link>
          <span className="text-gray-600 mx-2">|</span>
          <Link href="/" className="text-blue-700 hover:text-blue-800">
            トップに戻る
          </Link>
        </p>
        <p className="mt-4 text-xs text-gray-600 text-center">
          規約をご確認して同意の上ご利用ください
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}