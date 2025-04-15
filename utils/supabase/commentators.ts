import { supabase } from '@/lib/supabase'
import type { 
  PaginationParams,
  SearchResponse 
} from '@/utils/supabase/types'
import type { SupabaseResponse } from '@/utils/supabase/index'

export interface Commentator {
  id: string;
  speaker_type: number;
  last_name: string;
  first_name: string;
  last_name_kana: string | null;
  first_name_kana: string | null;
  age?: string | null;
  gender?: string | null;
  biography?: string | null;
  image_path?: string | null;
  official_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  line_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface StatementTag {
  tags: Tag;
}

export interface Statement {
  id: string;
  title: string;
  content: string;
  statement_date: string;
  image_path: string;
  video_path: string | null;
  video_thumbnail_path: string | null;
  created_at: string;
  statement_tag?: StatementTag[];
  tags?: Tag[];
}

export interface CommentatorWithStatements extends Commentator {
  statements?: Statement[];
}

interface SearchCommentatorParams {
  s?: string;
  gender?: string;
  speaker_type?: string;
  page?: number;
  per_page?: number;
}

interface CommentatorSearchResponse {
  data: CommentatorWithStatements[];
  total: number;
}

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

export const commentatorAPI = {
  /**
   * 発言者の検索
   */
  search: async (params: SearchCommentatorParams): Promise<SupabaseResponse<CommentatorSearchResponse>> => {
    try {
      console.log('検索開始 - 受け取ったパラメータ:', params);
      
      let query = supabase
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
          updated_at
        `, { count: 'exact' })
        .neq('speaker_type', 1);

      // 検索条件の適用
      if (params.s) {
        const searchTerm = params.s.trim();
        const hiragana = katakanaToHiragana(searchTerm);
        const katakana = hiraganaToKatakana(searchTerm);

        query = query.or(`last_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name_kana.ilike.%${hiragana}%,first_name_kana.ilike.%${hiragana}%,last_name_kana.ilike.%${katakana}%,first_name_kana.ilike.%${katakana}%`);
      }

      if (params.speaker_type) {
        query = query.eq('speaker_type', params.speaker_type);
      }

      const page = params.page || 1;
      const perPage = params.per_page || 20;
      const start = (page - 1) * perPage;
      const end = start + perPage - 1;

      const { data, error, count } = await query
        .range(start, end)
        .order('last_name_kana', { ascending: true })
        .order('first_name_kana', { ascending: true });

      if (error) throw error;

      return {
        data: {
          data: data as CommentatorWithStatements[],
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
   * 発言者の一覧を取得
   */
  getAll: async ({ page = 1, per_page = 20 }: PaginationParams = {}): Promise<SupabaseResponse<CommentatorWithStatements[]>> => {
    try {
      const offset = (page - 1) * per_page;

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
          updated_at
        `)
        .neq('speaker_type', 1)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .range(offset, offset + per_page - 1);

      if (error) throw error;

      return { data: data as CommentatorWithStatements[], error: null };
    } catch (error) {
      console.error('Error in getAll:', error);
      return { data: null, error };
    }
  },

  /**
   * 発言者の詳細情報を取得
   */
  getDetail: async (id: string): Promise<SupabaseResponse<CommentatorWithStatements>> => {
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
          statements (
            id,
            title,
            content,
            statement_date,
            image_path,
            video_path,
            video_thumbnail_path,
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
        .neq('speaker_type', 1)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        statements: data.statements?.map((statement) => {
          const rawStatement = statement as any;
          return {
            id: rawStatement.id,
            title: rawStatement.title,
            content: rawStatement.content,
            statement_date: rawStatement.statement_date,
            image_path: rawStatement.image_path,
            video_path: rawStatement.video_path,
            video_thumbnail_path: rawStatement.video_thumbnail_path,
            created_at: rawStatement.created_at,
            statement_tag: rawStatement.statement_tag,
            tags: rawStatement.statement_tag?.map((st: StatementTag) => st.tags) || []
          } as Statement;
        })
      };

      return { data: transformedData as CommentatorWithStatements, error: null };
    } catch (err) {
      console.error('Error fetching commentator detail:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : '発言者データの取得に失敗しました'
      };
    }
  }
};
