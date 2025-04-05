import Footer from '@/components/Navs/Footer';
import Header from '@/components/Navs/Header';

export default function TermsOfService() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-gray-100">
      <section className="text-gray-600 body-font bg-white">
        <div className="container px-5 py-2 mx-auto">
            <Header />
        </div>
      </section>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="space-y-8 text-gray-600">
            <section>
              <p className="mb-4">
                本利用規約（以下、「本規約」といいます。）は、問題発言ドットコム（以下、「本サービス」といいます）を利用するすべての訪問者（以下、「ユーザー」といいます。）および本サービスにログインした利用者（以下、「会員」といいます。）に適用されます。本サービスを利用することにより、ユーザーおよび会員は本規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第1条（適用）</h2>
              <p className="mb-4">
                本規約は、ユーザーおよび会員と運営者との間の本サービスの利用に関する一切の関係に適用されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第2条（サービス内容）</h2>
              <p className="mb-4">
                会員は、本サービス上で政治家の問題発言を投稿することができます。
              </p>
              <p className="mb-4">
                ユーザーは、本サービス上で政治家の問題発言を検索することができます。
              </p>
              <p className="mb-4">
                ユーザーは、本サービス上で問題発言にコメントを投稿することができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第3条（禁止事項）</h2>
              <p className="mb-4">
                本サービスの利用に際し、以下の行為を禁止します：
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>虚偽の情報の投稿</li>
                <li>他者への誹謗中傷、脅迫、嫌がらせ行為</li>
                <li>違法行為および公序良俗に反する行為</li>
                <li>運営者の許可なく営利目的で本サービスを利用する行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第4条（投稿の責任と削除）</h2>
              <p className="mb-4">
                投稿者は、本サービスへの投稿に関して発生する一切の責任が自身に帰属することを承諾した上で書き込みを行うものとします。
              </p>
              <p className="mb-4">
                運営者は、以下の場合にユーザーまたは会員の投稿を削除することができます：
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>禁止事項に該当すると判断した場合</li>
                <li>運営者が不適切と判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第5条（免責事項）</h2>
              <p className="mb-4">
                本サービスに掲載される情報の正確性・完全性について、運営者は保証しません。
              </p>
              <p className="mb-4">
                本サービスの利用により生じたトラブル・損害について、運営者は一切の責任を負いません。
              </p>
              <p className="mb-4">
                運営者は、予告なく本サービスの変更、停止、終了を行うことができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第6条（利用停止・会員登録の抹消）</h2>
              <p className="mb-4">
                運営者は、以下の場合にユーザーまたは会員の利用を停止し、または会員登録を抹消することができます。
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>本規約に違反した場合</li>
                <li>その他、運営者が不適切と判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第7条（規約の変更）</h2>
              <p className="mb-4">
                運営者は、必要に応じて本規約を変更できるものとします。変更後の規約は、本サービス上で通知することで効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">第8条（準拠法・管轄）</h2>
              <p className="mb-4">
                本規約は、日本法に準拠し、解釈されるものとします。本サービスに関する紛争は、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
              </p>
            </section>
          </div>

          <div className="mt-8 text-sm text-gray-500 text-right">
            制定日 令和7年4月1日
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
