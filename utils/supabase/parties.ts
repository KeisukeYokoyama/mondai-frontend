import supabase from './client';
import type { Party, PartyDetail } from './types';
import type { SupabaseResponse } from '@/utils/supabase/index'

export const partiesAPI = {
  // 政党一覧取得
  getParties: async (): Promise<SupabaseResponse<Party[]>> => {
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      return { data: data as Party[], error: null };
    } catch (error) {
      console.error('Error in getParties:', error);
      return { data: null, error };
    }
  },

  /**
   * 政党の詳細情報を取得
   * @param id 政党ID
   */
  getPartyDetail: async (id: number): Promise<SupabaseResponse<PartyDetail>> => {
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as PartyDetail, error: null };
    } catch (error) {
      console.error('Error in getPartyDetail:', error);
      return { data: null, error };
    }
  }
}
