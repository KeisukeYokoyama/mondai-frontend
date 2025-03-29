import React from 'react';
import { MdOutlineSearch } from "react-icons/md";

export default function Hero() {
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
        <button className="bg-gray-800 text-sm text-white px-6 py-2 rounded-md hover:bg-gray-600">
          スクショを登録する
        </button>
      </div>
    </>
  );
}
