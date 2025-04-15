import supabase from './client';
import type { 
  PaginationParams,
  SearchCommentatorParams,
  SearchResponse,
  Commentator,
  CommentatorWithStatements,
  Statement,
  StatementTag,
  Tag
} from './types';
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

export const commentatorAPI = {
  /**
   * 発言者の検索
   */
  search: async (params: SearchCommentatorParams): Promise<{ data: SearchResponse<Commentator> | null; error: string | null }> => {
    try {
      console.log('検索開始 - 受け取ったパラメータ:', params);
      
      let query = supabase
        .from('speakers')
        .select('*', { count: 'exact' })
        .in('speaker_type', [2, 3, 4, 5]);

      if (params.s) {
        const searchTerm = params.s;
        const hiragana = katakanaToHiragana(searchTerm);
        const katakana = hiraganaToKatakana(searchTerm);
        
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
          data: data as Commentator[],
          total: count || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error in search:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : '予期せぬエラーが発生しました'
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
  getDetail: async (id: string): Promise<{ data: CommentatorWithStatements | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select(`
          *,
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
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        statements: data.statements?.map((statement: any) => {
          return {
            id: statement.id,
            title: statement.title,
            content: statement.content,
            statement_date: statement.statement_date,
            image_path: statement.image_path,
            video_path: statement.video_path,
            video_thumbnail_path: statement.video_thumbnail_path,
            created_at: statement.created_at,
            statement_tag: statement.statement_tag,
            tags: statement.statement_tag?.map((st: StatementTag) => st.tags) || []
          } as Statement;
        })
      };

      return { data: transformedData as CommentatorWithStatements, error: null };
    } catch (error) {
      console.error('Error fetching commentator:', error);
      return { data: null, error: '言論人データの取得に失敗しました' };
    }
  }
};
