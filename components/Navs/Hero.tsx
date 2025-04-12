'use client';

import React, { useState } from 'react';
import { MdOutlineSearch } from "react-icons/md";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [speakerSearchText, setSpeakerSearchText] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchText.trim() || speakerSearchText.trim()) {
      const params = new URLSearchParams();
      if (searchText.trim()) {
        params.append('search', searchText.trim());
      }
      if (speakerSearchText.trim()) {
        params.append('speaker', speakerSearchText.trim());
      }
      router.push(`/statements?${params.toString()}`);
      setIsSearchModalOpen(false);
      setSearchText('');
      setSpeakerSearchText('');
    }
  };

  return (
    <>
      <div className="container px-5 pt-8 mx-auto text-center relative">
        <div 
          className="relative flex max-w-md mx-auto cursor-pointer"
          onClick={() => setIsSearchModalOpen(true)}
        >
          <input 
            type="text" 
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-l-md text-gray-600 focus:outline-none"
            placeholder="問題発言をざっくり検索" 
            readOnly
          />
          <button 
            type="submit" 
            aria-label="問題発言を検索"
            className="px-4 py-2 font-medium text-white bg-gray-800 rounded-r-md hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300"
          >
            <MdOutlineSearch size={20} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-800 pt-2">暴言内容をざっくり検索</p>
      </div>

      {/* 登録するボタン */}
      <div className="container px-5 pt-8 mx-auto text-center">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-600"
        >
          スクショを登録する
        </button>
      </div>

      {/* 検索モーダル */}
      {isSearchModalOpen && (
        <div 
          className="fixed inset-0 bg-gray-100/10 backdrop-blur-xl flex items-start pt-12 justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsSearchModalOpen(false);
            }
          }}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">問題発言を検索</h3>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                placeholder="暴言内容をざっくり検索" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 font-semibold">発言者</label>
                <input 
                  type="text" 
                  className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                  placeholder="発言者名を入力" 
                  value={speakerSearchText}
                  onChange={(e) => setSpeakerSearchText(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-500 -mt-3">
                  <small>検索結果で高度な絞り込みができます</small>
                </p>
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-3 border rounded-md bg-gray-900 text-white hover:bg-gray-800"
                >
                  検索
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 登録モーダル */}
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
