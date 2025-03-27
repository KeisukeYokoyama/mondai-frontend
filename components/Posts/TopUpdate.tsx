import React from 'react';
import { MdTipsAndUpdates } from "react-icons/md";
import { FaRegThumbsDown, FaRegThumbsUp, FaArrowRightLong } from "react-icons/fa6";

interface TopUpdateProps {
  title: string;
}

interface Post {
  id: number;
  imageUrl: string;
  tags: string[];
  politician: {
    name: string;
    party: string;
  };
  dislikePercentage: number;
}

const posts: Post[] = [
  {
    id: 1,
    imageUrl: "/images/sample/sample04.png",
    tags: ["HanadaVS保守党", "カンカン事件"],
    politician: {
      name: "百田尚樹",
      party: "日本保守党"
    },
    dislikePercentage: 80
  },
  {
    id: 2,
    imageUrl: "/images/sample/sample05.png",
    tags: ["名誉毀損", "稲田朋美"],
    politician: {
      name: "百田尚樹",
      party: "日本保守党"
    },
    dislikePercentage: 40
  }
];

export default function TopUpdate({ title }: TopUpdateProps) {
  return (
    <>
      <div className="container px-3 pt-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900">
          <MdTipsAndUpdates className="inline-block mr-2 text-yellow-500" />
          {title}
        </h2>
      </div>
      <div className="container px-5 py-8 mx-auto">
        <div className="flex flex-wrap -m-4">
          {posts.map((post) => (
            <div key={post.id} className="p-2 md:w-1/3 w-full">
              <div className="border border-gray-200 rounded-md bg-white shadow-sm">
                <div className="flex items-center justify-center p-4">
                  <img src={post.imageUrl} alt={`Post ${post.id}`} className="w-full h-full object-cover object-center rounded" />
                </div>
                <div className="pb-4 px-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-gray-900">
                    <span className="font-bold text-sm"> {post.politician.name}</span>
                    <span className="text-xs">（{post.politician.party}）</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-4 mb-2 px-1">
                    <FaRegThumbsDown className="text-red-600" />
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${post.dislikePercentage}%` }}
                      ></div>
                    </div>
                    <FaRegThumbsUp className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container px-5 mx-auto text-right">
        <button className="bg-gray-800 text-xs text-white px-4 py-2 rounded-md hover:bg-gray-600">
          もっと見る
          <FaArrowRightLong className="inline-block ml-2" />
        </button>
      </div>
    </>
  );
}
