import Link from 'next/link';
import Footer from '@/components/Navs/Footer';
import Header from '@/components/Navs/Header';

export default function UpdateInfo() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto max-w-screen-lg">
            <Header />
        </div>
      </section>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">要望集</h1>

          <div className="space-y-8 text-gray-600">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ご要望一覧</h2>
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2025年4月11日</h2>
              <p className="mb-4">
                問題発言ドットコムの更新情報を追加しました。
              </p>
            </div>
          </div>
          <div className="space-y-8 text-gray-600 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">開発予定</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">開発予定</th>
                  <th className="border border-gray-300 p-2">内容</th>
                  <th className="border border-gray-300 p-2">優先度</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">項目</td>
                  <td className="border border-gray-300 p-2">内容</td>
                  <td className="border border-gray-300 p-2">優先度</td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
