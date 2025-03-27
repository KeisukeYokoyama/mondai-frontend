import React from 'react';
import Image from 'next/image';

interface ScreenShotProps {
  title: string;
  className?: string;
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
    imageUrl: "/images/sample/sample01.jpg",
    tags: ["闇クマ", "脅迫"],
    politician: {
      name: "百田尚樹",
      party: "日本保守党"
    },
    dislikePercentage: 80
  },
  {
    id: 2,
    imageUrl: "/images/sample/sample02.jpg",
    tags: ["デマ", "外国勢に買われた山"],
    politician: {
      name: "有本 香",
      party: "日本保守党"
    },
    dislikePercentage: 40
  },
  {
    id: 3,
    imageUrl: "/images/sample/sample03.png",
    tags: ["ヘイトスピーチ", "LGBT"],
    politician: {
      name: "百田 尚樹",
      party: "日本保守党"
    },
    dislikePercentage: 90
  }
];

export default function ScreenShot({ title, className }: ScreenShotProps) {
  return (
    <>
      <div className={`container px-3 pt-8 mx-auto ${className}`}>
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
      </div>
      <div className="container px-5 py-8 mx-auto">
        <div className="flex flex-wrap -m-4">
          {posts.map((post) => (
            <div key={post.id} className="p-2 md:w-1/3 w-full">
              <div className="border border-gray-200 rounded-md bg-white shadow-sm">
                <div className="flex items-center justify-center p-4">
                  <Image
                    src={post.imageUrl} alt={`Post ${post.id}`} className="w-full h-full object-cover object-center rounded" 
                    width={300}
                    height={300}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
