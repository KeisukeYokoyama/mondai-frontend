'use client';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
        
        <div className="space-y-6 text-gray-600">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. はじめに</h2>
            <p className="mb-4">
              本利用規約（以下「本規約」といいます）は、当サービスの利用条件を定めるものです。
              ユーザーの皆様には、本規約に従って当サービスをご利用いただきます。
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. サービスの利用</h2>
            <p className="mb-4">
              当サービスの利用にあたり、以下の行為を禁止します：
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>他者の知的財産権を侵害する行為</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 免責事項</h2>
            <p className="mb-4">
              当サービスは以下の事項について、一切の責任を負いません：
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>ユーザーが当サービスを利用することで生じた損害</li>
              <li>ユーザー間のトラブル</li>
              <li>サービスの中断・停止・変更による損害</li>
              <li>その他当サービスに関連して生じた損害</li>
            </ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. 規約の変更</h2>
            <p className="mb-4">
              当サービスは、必要に応じて本規約を変更することができるものとします。
              規約変更後の利用者による当サービスの利用には、変更後の規約が適用されます。
            </p>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 準拠法・管轄裁判所</h2>
            <p className="mb-4">
              本規約の解釈にあたっては日本法を準拠法とし、
              当サービスに関連する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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
