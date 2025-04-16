import React from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import Link from 'next/link';
import Header from '@/components/Navs/Header';
import Footer from '@/components/Navs/Footer';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

const TopicsPage = async () => {
  const { data: tags, error } = await getSupabaseClient()
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('タグの取得に失敗しました', error);
    return <div>エラーが発生しました</div>;
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'ホーム', item: '/' },
          { name: 'トピックス一覧', item: '/topics' },
        ]}
      />
      <div className="min-h-screen bg-gray-50">
        <section className="text-gray-600 body-font bg-white">
          <div className="container px-5 py-2 mx-auto max-w-screen-lg">
            <Header />
          </div>
        </section>
        <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
          <div className="container px-5 py-8 mx-auto max-w-screen-md">
            <h1 className="text-xl font-bold text-gray-900 mb-6">
              トピックス一覧
            </h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <span key={tag.id} className="text-blue-700 font-bold">
                    <Link href={`/topics/${tag.id}`}>
                      #{tag.name}
                    </Link>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TopicsPage;

