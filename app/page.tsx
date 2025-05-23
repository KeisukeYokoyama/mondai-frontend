import React from 'react'
import { Metadata } from 'next'
import Header from '@/components/Navs/Header'
import Footer from '@/components/Navs/Footer'
import TopTagCloud from '@/components/TagCloud/TopTagCloud'
// import TopTrends from '@/components/Posts/TopTrends'
import TopRanking from '@/components/Politicians/TopRanking'
import TopUpdate from '@/components/Posts/TopUpdate'
import Hero from '@/components/Navs/Hero'
import TopNewComments from '@/components/Comments/TopNewComments'
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.mondai-hatsugen.com'
  }
}

export default function Home() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto max-w-screen-lg">
          <Header title="問題発言ドットコム" />
        </div>
      </section>
      <Hero />
      <main className="container px-5 py-8 mx-auto max-w-screen-md">
        <TopTagCloud title="みんなの興味関心" />
        {/* <TopTrends title="トレンドの問題発言" /> */}
        <TopRanking title="殿堂入り暴言政治家ランキング" />
        <TopUpdate title="新着の暴言" />
        <TopNewComments />
      </main>
      <Footer />
    </main>
  )
}