import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'みんなの暴言',
  description: 'みんなの暴言は、問題を発言するサイトです。',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 