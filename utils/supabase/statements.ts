import { getSupabaseClient } from './client'
import { Statement, StatementWithRelations, Speaker, StatementTag } from './types'
import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestError } from '@supabase/supabase-js'

// Fileライクなオブジェクトの型定義
type FileObject = {
  name: string;
  type: string;
  size: number;
};

interface RelatedSpeaker {
  speakers: Speaker;
}

interface StatementResponse {
  data: StatementWithRelations | null;
  error: PostgrestError | Error | null;
}

export const statementAPI = {
  // バケットの存在確認
  checkBucket: async () => {
    const supabase = getSupabaseClient()
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.find(b => b.name === 'statements') !== undefined;
  },

  // 一覧取得
  getAll: async () => {
    const supabase = getSupabaseClient()
    return await supabase
      .from('statements')
      .select(`
        *,
        speaker:speakers (
          *,
          parties (*)
        )
      `)
  },

  // 新規発言登録
  create: async (data: Omit<Statement, 'id' | 'created_at' | 'updated_at'>) => {
    const supabase = getSupabaseClient()
    const { title, content, speaker_id, party_id, statement_date, image_path, evidence_url, user_id } = data;
    
    // 画像アップロード処理
    let finalImagePath = image_path;
    const file = image_path as unknown as File;
    if (file && typeof file === 'object' && 'name' in file) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('statements')
        .upload(`${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;
      finalImagePath = uploadData.path;
    }

    // データ登録
    const { data: statement, error } = await supabase
      .from('statements')
      .insert([{
        title,
        content,
        speaker_id,
        party_id,
        statement_date: statement_date || null,
        image_path: finalImagePath,
        evidence_url,
        user_id
      }])
      .select(`
        *,
        speaker:speakers(
          speaker_type
        )
      `)
      .single();

    if (error) throw error;
    return statement;
  },

  // タグの関連付け
  attachTags: async (statementId: string, tagIds: number[]) => {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('statement_tags')
      .insert(
        tagIds.map(tagId => ({
          statement_id: statementId,
          tag_id: tagId
        }))
      );

    if (error) throw error;
  },

  // 詳細取得
  getDetail: async (id: string): Promise<StatementResponse> => {
    const supabase = getSupabaseClient()
    try {
      const { data, error } = await supabase
        .from('statements')
        .select(`
          *,
          speaker:speakers(*, parties(*)),
          tags:statement_tag(tags(*)),
          related_speakers:statement_speaker(
            speakers(
              *,
              parties(*)
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabaseエラー:', error);
        return { data: null, error };
      }
      
      // データの整形
      if (data) {
        const formattedData = {
          ...data,
          related_speakers: data.related_speakers.map((rel: RelatedSpeaker) => rel.speakers)
        };
        return { data: formattedData as StatementWithRelations, error: null };
      }
      
      return { data: null, error: null };
    } catch (err) {
      console.error('予期せぬエラー:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
    }
  },

  // 関連発言の取得
  getRelated: async (currentStatement: StatementWithRelations): Promise<StatementWithRelations[]> => {
    const supabase = getSupabaseClient()
    try {
      // 1. 関連人物に基づく発言を取得
      const { data: relatedSpeakerStatements } = await supabase
        .from('statements')
        .select(`
          *,
          speaker:speakers (*),
          tags:statement_tag (
            tags (*)
          )
        `)
        .in('id', (currentStatement.related_speakers || []).map(s => s.id))
        .neq('id', currentStatement.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // 2. 同じタグを持つ発言を取得
      const currentTags = (currentStatement.tags || []).map((t: StatementTag) => t.tags.id);
      const { data: relatedTagStatements } = await supabase
        .from('statements')
        .select(`
          *,
          speaker:speakers (*),
          tags:statement_tag (
            tags (*)
          )
        `)
        .neq('id', currentStatement.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // タグが一致する発言をフィルタリング
      const tagMatchStatements = (relatedTagStatements || []).filter((statement: StatementWithRelations) => {
        const statementTags = (statement.tags || []).map((t: StatementTag) => t.tags.id);
        return statementTags.some(tag => currentTags.includes(tag));
      });

      // 結果を結合して重複を除去
      const allRelatedStatements = [
        ...(relatedSpeakerStatements || []),
        ...tagMatchStatements
      ];

      // 重複を除去して最大5件に制限
      const uniqueStatements = Array.from(
        new Map(allRelatedStatements.map(item => [item.id, item])).values()
      ).slice(0, 5) as StatementWithRelations[];

      return uniqueStatements;
    } catch (error) {
      console.error('関連発言の取得に失敗しました:', error);
      return [];
    }
  }
}

export const getRelatedStatements = async (
  supabase: SupabaseClient,
  currentStatement: StatementWithRelations
): Promise<StatementWithRelations[]> => {
  try {
    // 1. 関連人物に基づく発言を取得
    const { data: relatedSpeakerStatements } = await supabase
      .from('statements')
      .select(`
        *,
        speaker:speakers (*),
        tags:statement_tag (
          tags (*)
        )
      `)
      .in('id', (currentStatement.related_speakers || []).map(s => s.id))
      .neq('id', currentStatement.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 2. 同じタグを持つ発言を取得
    const currentTags = (currentStatement.tags || []).map((t: StatementTag) => t.tags.id);
    const { data: relatedTagStatements } = await supabase
      .from('statements')
      .select(`
        *,
        speaker:speakers (*),
        tags:statement_tag (
          tags (*)
        )
      `)
      .neq('id', currentStatement.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // タグが一致する発言をフィルタリング
    const tagMatchStatements = (relatedTagStatements || []).filter((statement: StatementWithRelations) => {
      const statementTags = (statement.tags || []).map((t: StatementTag) => t.tags.id);
      return statementTags.some(tag => currentTags.includes(tag));
    });

    // 結果を結合して重複を除去
    const allRelatedStatements = [
      ...(relatedSpeakerStatements || []),
      ...tagMatchStatements
    ];

    // 重複を除去して最大5件に制限
    const uniqueStatements = Array.from(
      new Map(allRelatedStatements.map(item => [item.id, item])).values()
    ).slice(0, 5) as StatementWithRelations[];

    return uniqueStatements;
  } catch (error) {
    console.error('関連発言の取得に失敗しました:', error);
    return [];
  }
};