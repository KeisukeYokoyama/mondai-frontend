import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// クライアントインスタンスの型定義
declare global {
  var supabase: ReturnType<typeof createClientComponentClient<Database>> | undefined;
}

let browserInstance: ReturnType<typeof createClientComponentClient<Database>> | undefined;

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return createClientComponentClient<Database>();
  }

  if (!browserInstance) {
    browserInstance = global.supabase || createClientComponentClient<Database>();
    global.supabase = browserInstance;
  }

  return browserInstance;
};

// シングルトンインスタンスをエクスポート
const supabase = getSupabaseClient();
export default supabase; 