import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

class SupabaseClientManager {
  private static instance: ReturnType<typeof createClientComponentClient<Database>>;
  private static isInitializing = false;

  static getInstance(): ReturnType<typeof createClientComponentClient<Database>> {
    if (typeof window === 'undefined') {
      return createClientComponentClient<Database>();
    }

    if (!this.instance && !this.isInitializing) {
      this.isInitializing = true;
      this.instance = createClientComponentClient<Database>();
      this.isInitializing = false;
    }

    return this.instance;
  }
}

// シングルトンインスタンスを取得
const supabase = SupabaseClientManager.getInstance();

export const getSupabaseClient = () => SupabaseClientManager.getInstance();
export default supabase; 