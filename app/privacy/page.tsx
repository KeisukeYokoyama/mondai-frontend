'use client';
import Link from 'next/link';
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
        
        <div className="space-y-8 text-gray-600">
          <section>
            <p className="mb-4">
              問題発言ドットコム（以下、「本サービス」といいます）は、本サービスにおける利⽤者の個⼈情報の取扱いについて、以下のとおりプライバシーポリシーを定め、個人情報に関する法令を遵守し、その保護を適正に行います。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">個人情報の定義</h2>
            <p className="mb-4">
              個人情報とは、「個⼈情報の保護に関する法律」（以下「個人情報保護法」といいます）に定める個⼈情報をいいます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">取得する情報</h2>
            <p className="mb-4">
              本サービスでは、以下の情報を取得する場合があります：
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>ログインに必要なXアカウント情報</li>
              <li>アクセスログ、Cookieなどの技術情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">個人情報の利用目的</h2>
            <p className="mb-4">
              取得した個人情報は、以下の目的で利用します：
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>本サービスへのログイン処理</li>
              <li>本サービスの提供、改善、開発</li>
              <li>不正行為の防止およびセキュリティ向上</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">個人情報の管理</h2>
            <p className="mb-4">
              本サービスは、ユーザーの個人情報を適切に管理し、個人情報の漏洩、改ざん、不正アクセスなどの危険について適切な措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">個人情報の第三者提供</h2>
            <p className="mb-4">
              本サービスは、以下の場合を除き、取得した個人情報を第三者に提供することはありません：
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく開示要求があった場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cookieおよびトラッキング技術の利用</h2>
            <p className="mb-4">
              本サービスでは、利便性向上のためにCookieや類似の技術を使用することがあります。ユーザーは、ブラウザの設定によりCookieの無効化が可能ですが、一部の機能が正常に動作しなくなる可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">プライバシーポリシーの変更</h2>
            <p className="mb-4">
              本ポリシーの内容は、必要に応じて変更されることがあります。変更後のポリシーは、本サービス上で通知することで有効になるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">お問い合わせ</h2>
            <p className="mb-4">
              本ポリシーに関するお問い合わせは、以下の窓口までご連絡ください：
            </p>
            <p className="text-gray-700">
              <Link href="https://x.com/staatmobrau" target="_blank" className="text-blue-500 hover:text-blue-600">
                STAT[@staatmobrau]
              </Link>
            </p>
          </section>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-right">
          制定日 令和7年4月1日
        </div>
      </div>
    </div>
  );
}
