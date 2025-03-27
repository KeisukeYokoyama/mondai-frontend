import { supabase } from '@/lib/supabase'
import type { 
  Speaker, 
  SpeakerWithRelations, 
  PaginationParams,
  SearchSpeakerParams,
  SearchResponse 
} from '@/utils/supabase/types'
import type { SupabaseResponse } from '@/utils/supabase/index'

export const politicianAPI = {
  /**
   * 政治家の検索
   */
  search: async (params: SearchSpeakerParams): Promise<SupabaseResponse<SearchResponse>> => {
    try {
      let query = supabase
        .from('speakers')
        .select(`
          *,
          parties!inner (
            id,
            uuid,
            name,
            abbreviation,
            order,
            parent_id
          ),
          prefectures (
            id,
            name
          ),
          cities (
            id,
            name,
            prefecture_id
          )
        `, { count: 'exact' })
        .eq('speaker_type', 1);

      // 検索条件の適用
      if (params.s) {
        query = query.or(`last_name.ilike.%${params.s}%,first_name.ilike.%${params.s}%,last_name_kana.ilike.%${params.s}%,first_name_kana.ilike.%${params.s}%`);
      }
      if (params.chamber) {
        query = query.eq('chamber', params.chamber);
      }
      if (params.gender) {
        query = query.eq('gender', params.gender);
      }
      if (params.prefecture_id) {
        query = query.eq('prefecture_id', params.prefecture_id);
      }
      if (params.city_id) {
        query = query.eq('city_id', params.city_id);
      }
      if (params.party_id) {
        // その他の党（ID: 3925）の場合は、親政党も含めて検索
        if (params.party_id === '3925') {
          query = query.or(`party_id.eq.${params.party_id},parties.parent_id.eq.${params.party_id}`);
        } else {
          query = query.eq('party_id', params.party_id);
        }
      }

      const page = params.page || 1;
      const perPage = params.per_page || 20;
      const start = (page - 1) * perPage;
      const end = start + perPage - 1;

      const { data, error, count } = await query
        .range(start, end)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error searching politicians:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { data: null, error };
      }

      return {
        data: {
          data: data as SpeakerWithRelations[],
          total: count || 0
        },
        error: null
      };
    } catch (err) {
      console.error('Unexpected error in search:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : '予期せぬエラーが発生しました' 
      };
    }
  },

  /**
   * 政治家の一覧を取得
   */
  getAll: async ({ page = 1, per_page = 20 }: PaginationParams = {}) => {
    try {
      const offset = (page - 1) * per_page

      const { data, error } = await supabase
        .from('speakers')
        .select(`
          id,
          speaker_type,
          last_name,
          first_name,
          last_name_kana,
          first_name_kana,
          birthday,
          age,
          gender,
          party_id,
          prefecture_id,
          city_id,
          district,
          chamber,
          election_result,
          position,
          biography,
          official_url,
          facebook_url,
          twitter_url,
          youtube_url,
          line_url,
          instagram_url,
          tiktok_url,
          image_path,
          created_at,
          updated_at,
          parties!inner (
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
          ),
          prefectures (
            id,
            name,
            created_at,
            updated_at
          ),
          cities (
            id,
            name,
            prefecture_id,
            created_at,
            updated_at
          )
        `)
        .eq('speaker_type', 1)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .range(offset, offset + per_page - 1)

      if (error) {
        console.error('Error fetching politicians:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        return { data: null, error }
      }

      return { data: data as SpeakerWithRelations[], error: null }
    } catch (error) {
      console.error('Error in getAll:', error)
      return { data: null, error }
    }
  },

  /**
   * 政治家の詳細情報を取得
   */
  getDetail: async (id: string): Promise<SupabaseResponse<SpeakerWithRelations>> => {
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select(`
          id,
          speaker_type,
          last_name,
          first_name,
          last_name_kana,
          first_name_kana,
          birthday,
          age,
          gender,
          party_id,
          prefecture_id,
          city_id,
          district,
          chamber,
          election_result,
          position,
          biography,
          official_url,
          facebook_url,
          twitter_url,
          youtube_url,
          line_url,
          instagram_url,
          tiktok_url,
          image_path,
          created_at,
          updated_at,
          parties (
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
          ),
          prefectures (
            id,
            name,
            created_at,
            updated_at
          ),
          cities (
            id,
            name,
            prefecture_id,
            created_at,
            updated_at
          ),
          statements (
            id,
            content,
            created_at,
            parties (
              id,
              name,
              abbreviation
            ),
            tags (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .eq('speaker_type', 1)
        .single();

      if (error) {
        console.error('Error fetching politician detail:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { data: null, error };
      }

      return { data: data as SpeakerWithRelations, error: null };
    } catch (err) {
      console.error('Unexpected error in getDetail:', err);
      return { data: null, error: err instanceof Error ? err.message : '予期せぬエラーが発生しました' };
    }
  }
};
