import { supabase } from '@/lib/supabase'
import type { Party, PartyDetail } from '@/utils/supabase/types'
import type { SupabaseResponse } from '@/utils/supabase/index'

export const partiesAPI = {
  // 政党一覧取得
  getParties: async (): Promise<SupabaseResponse<Party[]>> => {
    const { data, error } = await supabase
      .from('parties')
      .select(`
        id,
        uuid,
        name,
        abbreviation,
        order,
        parent_id,
        leader_name,
        description,
        founded_date,
        dissolved_date,
        official_website,
        twitter_url,
        facebook_url,
        instagram_url,
        youtube_url,
        created_at,
        updated_at
      `)
      .order('order')

    return { data, error }
  },

  /**
   * 政党の詳細情報を取得
   * @param id 政党ID
   */
  getPartyDetail: async (id: number): Promise<SupabaseResponse<PartyDetail>> => {
    const { data, error } = await supabase
      .from('parties')
      .select(`
        id,
        uuid,
        name,
        abbreviation,
        order,
        parent_id,
        leader_name,
        description,
        founded_date,
        dissolved_date,
        official_website,
        twitter_url,
        facebook_url,
        instagram_url,
        youtube_url,
        logo_url,
        headquarters,
        member_count,
        policy_summary,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching party detail:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }
}
