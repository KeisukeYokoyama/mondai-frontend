import supabase from './client';
import type { 
  Speaker, 
  SpeakerWithRelations, 
  PaginationParams,
  SearchSpeakerParams,
  SearchResponse 
} from '@/utils/supabase/types'
import type { SupabaseResponse } from '@/utils/supabase/index'

// カタカナをひらがなに変換する関数
const katakanaToHiragana = (str: string) => {
  return str.replace(/[\u30A1-\u30F6]/g, match => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
};

// ひらがなをカタカナに変換する関数
const hiraganaToKatakana = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, match => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
};

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
          parties (
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
        const searchTerm = params.s;
        const hiragana = katakanaToHiragana(searchTerm);
        const katakana = hiraganaToKatakana(searchTerm);
        
        // OR条件を1行で指定するように修正
        const searchCondition = [
          `last_name.ilike.%${searchTerm}%`,
          `first_name.ilike.%${searchTerm}%`,
          `last_name_kana.ilike.%${hiragana}%`,
          `first_name_kana.ilike.%${hiragana}%`,
          `last_name_kana.ilike.%${katakana}%`,
          `first_name_kana.ilike.%${katakana}%`
        ].join(',');

        query = query.or(searchCondition);
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

      if (params.party_id && params.party_id !== '0') {
        const partyId = Number(params.party_id);
        
        // 親政党「その他」が選択された場合
        if (partyId === 3925) {
          // その他政党とその子政党のIDを取得
          const { data: childParties } = await supabase
            .from('parties')
            .select('id')
            .eq('parent_id', partyId);
          
          const partyIds = [partyId, ...(childParties?.map(p => p.id) || [])];
          query = query.in('party_id', partyIds);
        } else {
          // その他以外の親政党、または子政党が選択された場合
          const { data: party } = await supabase
            .from('parties')
            .select('parent_id')
            .eq('id', partyId)
            .single();

          // 選択された政党がその他の子政党の場合
          if (party?.parent_id === 3925) {
            query = query.eq('party_id', partyId);
          } else {
            // その他以外の政党の場合
            query = query.eq('party_id', partyId);
          }
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

      if (error) throw error;

      return {
        data: {
          data: data as SpeakerWithRelations[],
          total: count || 0
        },
        error: null
      };
    } catch (err) {
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
          prefectures!inner (
            id,
            name,
            created_at,
            updated_at
          ),
          cities!inner (
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
        return { data: null, error }
      }

      return { data: data as unknown as SpeakerWithRelations[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  /**
   * 政治家の詳細情報を取得
   */
  getDetail: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select(`
          *,
          parties (
            name
          ),
          statements (
            id,
            title,
            content,
            statement_date,
            image_path,
            video_path,
            video_thumbnail_path,
            tags:statement_tag (
              tags (*)
            )
          )
        `)
        .eq('id', id)
        .order('statement_date', { foreignTable: 'statements', ascending: false })
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: '政治家データの取得に失敗しました' };
    }
  },

  /**
   * 発言数の多い政治家のトップ5を取得
   */
  getTopByStatementCount: async () => {
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select(`
          id,
          last_name,
          first_name,
          image_path,
          parties (
            name
          ),
          statements!inner (
            id
          )
        `)
        .eq('speaker_type', 1)
        .order('id', { foreignTable: 'statements', ascending: false })
        .limit(20);

      if (error) throw error;

      const sortedData = data
        ?.sort((a, b) => (b.statements?.length || 0) - (a.statements?.length || 0))
        .slice(0, 5);

      const mappedData = sortedData?.map(politician => {
        let imageUrl = '/images/default-profile.png';
        if (politician.image_path) {
          const { data: publicUrlData } = supabase
            .storage
            .from('politicians')
            .getPublicUrl(politician.image_path);
          
          if (publicUrlData) {
            imageUrl = publicUrlData.publicUrl;
          }
        }

        // @ts-expect-error Linter thinks parties is an array, but query returns an object
        const partyName = politician.parties?.name || '';

        return {
          id: politician.id,
          name: `${politician.last_name} ${politician.first_name}`,
          party: partyName, 
          img: imageUrl, 
          url: `/politicians/${politician.id}`,
          statementCount: politician.statements?.length || 0
        };
      });

      return { 
        data: mappedData, 
        error: null 
      };
    } catch (error) {
      console.error('Error getting top politicians:', error);
      return { data: null, error: '政治家データの取得に失敗しました' };
    }
  }
};
