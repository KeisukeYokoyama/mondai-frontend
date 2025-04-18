'use client';
import React, { useState, useEffect } from 'react';
import { FaCrown } from "react-icons/fa6";
import Image from 'next/image';
import Link from 'next/link';
import { politicianAPI } from '@/utils/supabase/politicians';

interface TopRankingProps {
  title: string;
}

interface Politician {
  id: string;
  name: string;
  party: string;
  img: string;
  url: string;
  statementCount: number;
}

export default function TopRanking({ title }: TopRankingProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPoliticians = async () => {
      const { data, error } = await politicianAPI.getTopByStatementCount();
      if (error) {
        setError(error);
        return;
      }
      if (data) {
        setPoliticians(data);
      }
    };

    fetchTopPoliticians();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }
  
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
            <div key={politician.id} className="flex items-center justify-between py-3 px-4 bg-white w-full">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-900 mr-4">{index + 1}</div>
                <Image
                  src={politician.img} 
                  alt={politician.name} 
                  className="w-16 h-16 object-cover rounded-full mr-4 shadow-md" 
                  width={64}
                  height={64}
                />
                <div>
                  <h3 className="font-bold text-gray-900">{politician.name}</h3>
                  <p className="text-gray-600 text-xs">{politician.party}</p>
                  <p className="text-gray-500 text-xs">発言数: {politician.statementCount}件</p>
                </div>
              </div>
              <Link 
                href={politician.url} 
                prefetch={true}
                className={`text-blue-700 hover:text-blue-500 text-sm transition-opacity duration-200 ${
                  isLoading === politician.url ? 'opacity-50' : ''
                }`}
                onClick={() => setIsLoading(politician.url)}
              >
                詳細
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
