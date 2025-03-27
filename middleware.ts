import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証コールバックは処理をスキップ
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  // 認証ページへのアクセスで、すでにログインしている場合はダッシュボードへ
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 未認証ユーザーをログインページにリダイレクト
  // if (!session && req.nextUrl.pathname !== '/auth') {
  //   return NextResponse.redirect(new URL('/auth', req.url))
  // }

  // プライバシーポリシーページへのアクセスは認証をスキップ
  if (req.nextUrl.pathname === '/privacy') {
    return res
  }

  return res
}

export const config = {
  matcher: [
    // プライバシーページと利用規約ページを除外
    '/((?!privacy|terms|api|_next/static|_next/image|favicon.ico).*)',
  ],
}