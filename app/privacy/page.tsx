'use client';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
        
        <div className="space-y-6 text-gray-600">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. 個人情報の取り扱いについて</h2>
            <p className="mb-4">
              当サービスは、ユーザーの個人情報を適切に取り扱い、保護することが社会的責務であると考え、
              以下の方針に基づき個人情報の保護に努めます。
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 収集する情報</h2>
            <p className="mb-4">
              当サービスでは、以下の情報を収集する場合があります：
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>氏名</li>
              <li>メールアドレス</li>
              <li>利用履歴</li>
              <li>その他サービス提供に必要な情報</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 個人情報の利用目的</h2>
            <p className="mb-4">
              収集した個人情報は、以下の目的で利用いたします：
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>サービスの提供・運営</li>
              <li>ユーザーサポート</li>
              <li>サービスの改善・新機能の開発</li>
              <li>お知らせやメールマガジンの配信</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. お問い合わせ</h2>
            <p className="mb-4">
              個人情報の取り扱いに関するお問い合わせは、以下の連絡先までご連絡ください：
            </p>
            <p className="text-gray-700">
              メール：privacy@example.com<br />
              電話：03-XXXX-XXXX
            </p>
          </section>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-right">
          最終更新日：2024年3月1日
        </div>
      </div>
    </div>
  );
}
