import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Navs/Footer';
import Header from '@/components/Navs/Header';

export const metadata: Metadata = {
  title: '更新情報',
  description: '問題発言ドットコムの開発予定や更新情報をご確認いただけます。',
  alternates: {
    canonical: 'https://www.mondai-hatsugen.com/update-info'
  },
  openGraph: {
    title: '更新情報',
    description: '問題発言ドットコムの開発予定や更新情報をご確認いただけます。',
    url: 'https://www.mondai-hatsugen.com/update-info',
    type: 'website',
    locale: 'ja_JP',
    siteName: '問題発言ドットコム',
    images: [
      {
        url: 'https://www.mondai-hatsugen.com/images/ogp-image.png',
        width: 1200,
        height: 630,
        alt: '問題発言ドットコム',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '更新情報',
    description: '問題発言ドットコムの開発予定や更新情報をご確認いただけます。',
    images: ['https://www.mondai-hatsugen.com/images/ogp-image.png'],
  },
}

export default function UpdateInfo() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto max-w-screen-lg">
            <Header />
        </div>
      </section>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-screen-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">更新情報</h1>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="relative shadow-md rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3 min-w-52">
                        開発予定・ご要望
                      </th>
                      <th scope="col" className="px-6 py-3">
                        内容
                      </th>
                      <th scope="col" className="px-6 py-3 w-1/6">
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal min-w-52 dark:text-white">
                        タグを必須にする
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                        検索性を向上させるために、タグを必須にする。
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white w-1/6">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                          開発中
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal min-w-52 dark:text-white">
                        発言者の新規登録
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                        ログインユーザーが政治家や言論人の登録機能を追加する機能。
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white w-1/6">
                        <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                          完了
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal min-w-52 dark:text-white">
                        人気の発言を表示できるようにする
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                        コメント数が多い発言や表示件数を考慮して、人気の発言をランキング形式で表示する
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white w-1/6">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                          開発中
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal min-w-52 dark:text-white">
                        発言内容の変更
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                        ログインユーザーが発言内容を変更することができるようにする。変更した発言はモデレーターによって承認されるまで公開されない。
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white w-1/6">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                          検討中
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal min-w-52 dark:text-white">
                        関連スクショを登録できるようにする
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                        発言に関連するスクショを登録できるようにする。
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white w-1/6">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                          検討中
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal min-w-52 dark:text-white">
                        スクショの通報機能
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                        スクショの通報機能を追加する。スクショの通報が一定条件を満たした場合、モデレーターによって承認されるまで非公開にする。
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white w-1/6">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                          検討中
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal min-w-52 dark:text-white">
                        今日は何の日？
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white">
                        今日は何の日？懐かしいあの日の暴言を表示できるようにする。
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-normal dark:text-white w-1/6">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                          検討中
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
              検討中
            </span>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-900 dark:text-gray-300">
              保留
            </span>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              開発中
            </span>
            <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              完了
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}