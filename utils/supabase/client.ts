import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// グローバルオブジェクトに型を定義
declare global {
  var supabase: ReturnType<typeof createClientComponentClient<Database>> | undefined;
}

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return createClientComponentClient<Database>();
  }

  if (!global.supabase) {
    global.supabase = createClientComponentClient<Database>();
  }

  return global.supabase;
};

// シングルトンインスタンスをエクスポート
const supabase = getSupabaseClient();
export default supabase; 