import React from 'react';
import Link from 'next/link';
export default function Footer() {
  return (
    <div className="bg-gray-800 mt-auto">
    <footer className="text-white body-font bg-gray-800 max-w-screen-lg mx-auto">
      <section className="text-white pt-10">
        <div className="container flex flex-col justify-center px-6 pt-2 mx-auto md:pt-8 md:px-8 md:pb-4">
          <h2 className="mb-8 text-xl font-bold sm:text-base">よくある質問</h2>
          <div className="flex flex-col divide-y sm:px-8 lg:px-12 xl:px-32 divide-gray-700">
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">スクショを登録するには？</summary>
              <div className="px-4 pb-4 text-sm">
                <p>政治家/言論人詳細ページの「スクショを登録する」ボタンから登録できます。スクショの登録にはXのアカウントが必要です。</p>
              </div>
            </details>
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">政治家/言論人を登録するには？</summary>
              <div className="px-4 pb-4 text-sm">
                <p>現在、登録機能は開放していません。Xなどでアンケートを実施させていただき検討を加速します。</p>
              </div>
            </details>
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">虚偽のスクショがあるので削除したい</summary>
              <div className="px-4 pb-4 text-sm">
                <p>「通報」ボタンから通報できます。独自のアルゴリズムで虚偽だと判断した場合は自動的に非表示となります。通報の多いアカウントはロックされます。
                  また、虚偽の通報をした場合もコメント機能や通報機能が停止されます。
                </p>
              </div>
            </details>
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">政治家の画像を削除してほしい</summary>
              <div className="px-4 pb-4 text-sm">
                <p>X APIを使用していますので、Xのポリシーに従って対応いたします。</p>
              </div>
            </details>
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">問題発言ドットコムとは？</summary>
              <div className="px-4 pb-4 text-sm">
                <p>
                  政治家の暴言やデマ、言行不一致などのスクショを登録して、過去の問題発言を検索できるサービスです。
                  選挙で投票する政党がない！といった迷える愛国者を救うため、消去法で選挙に参加する時の参考になれば幸いです。
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>
      
      <section className="container px-5 mx-auto md:py-6 pt-10 pb-6">
        <div className="flex flex-col items-center">
          <div className="flex space-x-4 pb-4">
            <Link href="/privacy" className="text-xs text-white hover:text-gray-300">プライバシーポリシー</Link>
            <Link href="/terms" className="text-xs text-white hover:text-gray-300">利用規約</Link>
            <Link href="/update-info" className="text-xs text-white hover:text-gray-300">更新情報</Link>
          </div>
          <p className="text-xs text-white">
            <Link href="/">© 問題発言ドットコム</Link>
          </p>
        </div>
      </section>
    </footer>
    </div>
  );
}
