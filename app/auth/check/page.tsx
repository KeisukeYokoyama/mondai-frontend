'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [isChecked, setIsChecked] = useState(false);

  const redirectPath = searchParams.get('redirect') || '/dashboard'
  
  useEffect(() => {
    // ユーザー情報のロードが完了したときのみ処理を実行
    if (!loading && !isChecked) {
      setIsChecked(true);
      
      // 少し遅延を入れて、確実にユーザー情報を取得してから処理を実行
      setTimeout(() => {
        if (user) {
          console.log('Redirect path:', redirectPath); // デバッグ用

          if (redirectPath) {
            router.push(redirectPath);
            localStorage.removeItem('redirectAfterLogin'); // リダイレクト後に削除
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/auth');
        }
      }, 1000); // 1秒の遅延を設定
    }
  }, [user, loading, router, isChecked]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">認証を確認中...</p>
      </div>
    </div>
  );
} 