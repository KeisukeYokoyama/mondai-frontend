import { supabase } from '@/lib/supabase'
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
      console.log('検索開始 - 受け取ったパラメータ:', params);
      
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
          prefectures!inner (
            id,
            name
          ),
          cities!inner (
            id,
            name,
            prefecture_id
          )
        `, { count: 'exact' })
        .eq('speaker_type', 1);

      console.log('基本クエリを構築');

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
        
        console.log('名前検索条件を追加:', {
          original: searchTerm,
          hiragana: hiragana,
          katakana: katakana,
          condition: searchCondition
        });
      }
      if (params.chamber) {
        query = query.eq('chamber', params.chamber);
        console.log('議員種別条件を追加:', params.chamber);
      }
      if (params.gender) {
        query = query.eq('gender', params.gender);
        console.log('性別条件を追加:', params.gender);
      }
      if (params.prefecture_id) {
        query = query.eq('prefecture_id', params.prefecture_id);
        console.log('都道府県条件を追加:', params.prefecture_id);
      }
      if (params.city_id && params.city_id !== '0') {
        query = query.eq('city_id', params.city_id);
        console.log('市区町村条件を追加:', params.city_id);
      }

      if (params.party_id && params.party_id !== '0') {
        const partyId = Number(params.party_id);
        console.log('政党ID処理開始:', partyId);
        
        // その他の党（ID: 3925）の場合は、その子政党も含めて検索
        if (partyId === 3925) {
          // 親政党が3925の政党IDを取得
          const { data: childParties } = await supabase
            .from('parties')
            .select('id')
            .eq('parent_id', partyId);
          
          const partyIds = [partyId, ...(childParties?.map(p => p.id) || [])];
          console.log('検索対象の政党ID一覧:', partyIds);
          query = query.in('party_id', partyIds);
        } else {
          console.log('単一政党での検索:', partyId);
          query = query.eq('party_id', partyId);
        }
      }

      const page = params.page || 1;
      const perPage = params.per_page || 20;
      const start = (page - 1) * perPage;
      const end = start + perPage - 1;

      console.log('ページネーション設定:', { page, perPage, start, end });

      const { data, error, count } = await query
        .range(start, end)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error searching politicians:', error);
        console.error('Error details:', {
          message: error.message || 'No message',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code'
        });
        return { data: null, error };
      }

      // 検索結果のログ出力を改善
      console.log('検索成功:', {
        総件数: count || 0,
        取得データ件数: data?.length || 0,
        最初のデータ: data?.[0] ? {
          名前: `${data[0].last_name} ${data[0].first_name}`,
          カナ: `${data[0].last_name_kana || ''} ${data[0].first_name_kana || ''}`
        } : 'データなし'
      });

      return {
        data: {
          data: data as SpeakerWithRelations[],
          total: count || 0
        },
        error: null
      };
    } catch (err) {
      // エラーハンドリングの改善
      console.error('Unexpected error in search:', err);
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました';
      console.error('Error details:', {
        type: err instanceof Error ? 'Error' : typeof err,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      return { 
        data: null, 
        error: errorMessage
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
        console.error('Error fetching politicians:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        return { data: null, error }
      }

      return { data: data as unknown as SpeakerWithRelations[], error: null }
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
          ),
          statements (
            id,
            content,
            created_at,
            statement_tag (
              tags (
                id,
                name
              )
            )
          )
        `)
        .eq('id', id)
        .eq('speaker_type', 1)
        .single();

      if (error) throw error;

      // データ構造を変換して、statement_tagをtagsに変換
      const transformedData = {
        ...data,
        statements: data.statements?.map(statement => ({
          ...statement,
          tags: statement.statement_tag?.map(st => st.tags) || []
        }))
      };

      return { data: transformedData as SpeakerWithRelations, error: null };
    } catch (err) {
      console.error('Error fetching politician detail:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : '政治家データの取得に失敗しました'
      };
    }
  }
};
