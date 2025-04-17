import { SupabaseClient } from '@supabase/supabase-js';
import { StatementWithRelations, StatementTag } from '@/utils/supabase/types';

export const statementAPI = {
  // ここにstatementAPIの実装を追加
};

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