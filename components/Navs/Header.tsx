'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleScreenshotButtonClick = () => {
    if (!user) {
      // ログインしていない場合は認証ページへリダイレクト
      router.push('/auth')
      return
    }
    // ログインしている場合はスクショ登録処理を実行
    // ここにスクショ登録処理を追加
  }

  return (
    <>
      <nav className="bg-white border-gray-200 relative z-50">
        <div className="max-w-screen-xl flex items-center mx-auto p-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src='/images/Logo.svg'
              alt='みんなの暴言'
              width={192}
              height={26}
              className='h-6 w-auto'
              priority
            />
            <span className="self-center text-base font-semibold whitespace-nowrap">
              {title || 'みんなの暴言（仮）'}
            </span>
          </Link>

          {/* デスクトップ用メニュー */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold ml-auto py-3">
            {/* <Link
              href="/search"
              className="text-gray-900 hover:text-blue-700"
            >
              問題発言を探す
            </Link> */}
            <Link
              href="/politicians"
              className="text-gray-900 hover:text-blue-700"
            >
              政治家を探す
            </Link>
            <Link
              href="/speakers"
              className="text-gray-900 hover:text-blue-700"
            >
              言論人を探す
            </Link> 
            <Link
              href="/parties"
              className="text-gray-900 hover:text-blue-700"
            >
              政党を探す
            </Link>
            <Link
              href="/trending"
              className="text-gray-900 hover:text-blue-700"
            >
              話題の問題発言
            </Link>
            
            {user && (
              <button
                onClick={signOut}
                className="text-gray-900 hover:text-blue-700"
              >
                ログアウト
              </button>
            )}
          </div>

          <div className="flex md:order-2 ml-auto md:ml-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <span className="sr-only">メニューを開く</span>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* オーバーレイメニュー */}
      {isOpen && (
        <>
          {/* メニューコンテンツ */}
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="bg-gray-100 h-full w-full">
              <div className="flex justify-between items-center p-6 bg-white">
                <div className="w-full flex justify-end sm:pr-16">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* メニューリンク */}
              <ul className="p-4 text-right font-semibold">
                <li className="mb-2">
                  <Link
                    href="/trending"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    話題の問題発言
                  </Link>
                </li>
                {/* <li className="mb-2">
                  <Link
                    href="/search"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    問題発言を探す
                  </Link>
                </li> */}
                <li className="mb-2">
                  <Link
                    href="/politicians"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    政治家を探す
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    href="/speakers"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    言論人を探す
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    href="/parties"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100"
                  >
                    政党を探す
                  </Link>
                </li>
                {user && (
                  <li className="mb-2">
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        signOut();
                        setIsOpen(false);
                      }}
                      className="block w-full text-right py-2 px-3 text-gray-900 rounded hover:bg-gray-100"
                    >
                      ログアウト
                    </Link>
                  </li>
                )}
              </ul>
              {/* 登録ボタン */}
              <div className="container px-5 pt-8 mx-auto text-right">
                <button 
                  className="bg-gray-800 text-sm text-white px-6 py-2 rounded-md hover:bg-gray-600"
                  onClick={() => {
                    if (!user) {
                      router.push('/auth');
                      setIsOpen(false);
                    } else {
                      // ログインしている場合はスクショ登録処理を実行
                      // ここにスクショ登録処理を追加
                    }
                  }}
                >
                  スクショを登録する
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}