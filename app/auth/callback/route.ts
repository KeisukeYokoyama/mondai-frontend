import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      }
    }

    // エラーの場合は認証ページに戻る
    return NextResponse.redirect(`${requestUrl.origin}/auth`)
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth`)
  }
}