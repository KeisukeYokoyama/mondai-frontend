import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

let supabase: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createClientComponentClient<Database>();
  }
  return supabase;
};

export default getSupabaseClient(); 