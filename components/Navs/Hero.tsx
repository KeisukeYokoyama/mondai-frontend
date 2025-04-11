'use client';

import React, { useState } from 'react';
import { MdOutlineSearch } from "react-icons/md";
import Link from 'next/link';
import Image from 'next/image';
export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="container px-5 pt-8 mx-auto text-center relative">
        <div className="relative flex max-w-md mx-auto">
          <input 
            type="text" 
            className="w-full pl-4 pr-12 py-2 bg-white border border-gray-300 rounded-l-md text-gray-600 focus:outline-none"
            placeholder="問題発言を検索" 
          />
          <button 
            type="submit" 
            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-r-md hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300"
          >
            <MdOutlineSearch size={20} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-500 pt-2">日付・人物・タグ・暴言などを検索</p>
      </div>
      {/* 登録するボタン */}
      <div className="container px-5 pt-8 mx-auto text-center">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-800 text-sm text-white px-6 py-2 rounded-md hover:bg-gray-600"
        >
          スクショを登録する
        </button>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-gray-100/10 backdrop-blur-xl flex items-start pt-12 justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">スクショを登録するには？</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-left">
                <ul className="list-decimal pl-5 space-y-1 text-sm">
                  <li>まずは、発言者を検索してください</li>
                  <li>発言者詳細ページにある「スクショを登録」ボタンをクリックしてください</li>
                  <li>Xアカウントでログインしてください</li>
                  <li>発言内容などの情報を追加してスクショをアップロードしてください</li>
                </ul>
              </div>
              <Image src="/images/how_to_use_01.jpg" alt="X" width={480} height={270} />

              <Link 
                href="/politicians"
                className="block w-full px-4 py-3 border rounded-md bg-gray-900 text-white hover:bg-gray-800 text-center"
              >
                政治家を探す
              </Link>
              <p className="text-sm">
                  <span className="text-red-500">※</span> スクショの登録にはXアカウントが必要です<br />
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
