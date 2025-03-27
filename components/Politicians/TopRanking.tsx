import React from 'react';
import { FaCrown } from "react-icons/fa6";

interface TopRankingProps {
  title: string;
}

interface Politician {
  name: string;
  party: string;
  img: string;
}

const politicians: Politician[] = [
  { name: "百田 尚樹", party: "日本保守党", img: "/images/sample/politician01.jpg" },
  { name: "有本 香", party: "日本保守党", img: "/images/sample/politician02.jpg" },
  { name: "小野寺 まさる", party: "日本保守党", img: "/images/sample/politician03.jpg" },
  { name: "島田 洋一", party: "日本保守党", img: "/images/sample/politician04.jpg" }
];

export default function TopRanking({ title }: TopRankingProps) {
  return (
    <>
      <div className="container px-3 pt-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900">
          <FaCrown className="inline-block mr-2 text-yellow-500" />
          {title}
        </h2>
      </div>
      <div className="container px-0 py-8 mx-auto">
        <div className="flex flex-col divide-y divide-gray-200">
          {politicians.map((politician, index) => (
            <div key={index} className="flex items-center justify-between py-3 px-4 bg-white w-full">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-900 mr-4">{index + 1}</div>
                <img src={politician.img} alt={politician.name} className="w-16 h-16 object-cover rounded-full mr-4 shadow-md" />
                <div>
                  <h3 className="font-bold text-gray-900">{politician.name}</h3>
                  <p className="text-gray-600 text-xs">{politician.party}</p>
                </div>
              </div>
              <button className="text-blue-700 hover:text-blue-500 text-sm">問題発言を見る</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
