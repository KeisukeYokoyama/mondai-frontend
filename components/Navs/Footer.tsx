import React from 'react';

export default function Footer() {
  return (
    <footer className="text-white body-font bg-gray-800 mt-8">
      <section className="text-white pt-10 pb-4">
        <div className="container flex flex-col justify-center px-6 py-2 mx-auto md:p-8">
          <h2 className="mb-8 text-xl font-bold sm:text-base">よくある質問</h2>
          <div className="flex flex-col divide-y sm:px-8 lg:px-12 xl:px-32 divide-gray-700">
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">暴言を登録するには？</summary>
              <div className="px-4 pb-4 text-sm">
                <p>「スクショを登録する」ボタンから登録できます。スクショの登録にはXのアカウントが必要です。</p>
              </div>
            </details>
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">政治家を登録するには？</summary>
              <div className="px-4 pb-4 text-sm">
                <p>政治家の画像は、政治家のXのプロフィール画像を使用しています。</p>
              </div>
            </details>
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">虚偽の暴言があるので削除したい</summary>
              <div className="px-4 pb-4 text-sm">
                <p>みんなの暴言は、XのAPIを使用しています。XのAPIを使用しているため、虚偽の暴言は登録できません。</p>
              </div>
            </details>
            <details>
              <summary className="py-2 outline-none cursor-pointer text-sm">政治家の画像を削除してほしい</summary>
              <div className="px-4 pb-4 text-sm">
                <p>みんなの暴言は、XのAPIを使用しています。XのAPIを使用しているため、政治家の画像は削除できません。</p>
              </div>
            </details>
          </div>
        </div>
      </section>
      <section className="text-white pt-4 pb-10">
        <div className="container flex flex-col justify-center px-6 py-2 mx-auto md:p-8">
          <h2 className="mb-8 text-xl font-bold sm:text-base">みんなの暴言とは？</h2>
          <div className="flex flex-col divide-y sm:px-8 lg:px-12 xl:px-32 divide-gray-700">
            <p className="text-sm">政治家の過去の暴言やデマ、言動不一致を検索できるサービスです。</p>
          </div>
        </div>
      </section>
      <section className="container px-5 mx-auto py-4">
        <p className="text-xs text-white">
          みんなの暴言(仮) by 百田グループの皆さま
        </p>
      </section>
    </footer>
  );
}
