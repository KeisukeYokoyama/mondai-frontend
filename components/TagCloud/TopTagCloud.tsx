import React from 'react';
import { FcSpeaker } from "react-icons/fc";
import Link from 'next/link';

interface TopTagCloudProps {
  title: string;
}

export default function TopTagCloud({ title }: TopTagCloudProps) {
  return (
    <>
      <div className="container px-3 pt-8 mx-auto">
        <h2 className="text-xl font-bold text-gray-900">
          <FcSpeaker className="inline-block mr-2" />
          {title}
        </h2>
      </div>
      <div className="container px-5 py-8 mt-4 mx-auto bg-white">
        <span className="text-blue-600 font-bold mx-2">
          <Link href="/topics/1">
            #外国勢に買われた山
          </Link>
        </span>
        <span className="text-blue-600 font-bold mx-2">
          <Link href="/topics/2">
            #元組長カスハラ事件
          </Link>
        </span>
        <span className="text-blue-600 font-bold mx-2">
          <Link href="/topics/3">
            #カンカン事件
          </Link>
        </span>
        <span className="text-blue-600 font-bold mx-2">
          <Link href="/topics/4">
            #HanadaVS保守党
          </Link>
        </span>
      </div>
    </>
  );
}
