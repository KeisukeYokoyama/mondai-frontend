import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Statement, StatementWithRelations } from './types'

// Fileライクなオブジェクトの型定義
type FileObject = {
  name: string;
  type: string;
  size: number;
};

export const statementAPI = {
  // バケットの存在確認
  checkBucket: async () => {
    const supabase = createClientComponentClient()
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.find(b => b.name === 'statements') !== undefined;
  },

  // 一覧取得
  getAll: async () => {
    const supabase = createClientComponentClient()
    return await supabase
      .from('statements')
      .select('*')
  },

  // 新規発言登録
  create: async (data: Omit<Statement, 'id' | 'created_at' | 'updated_at'>) => {
    const supabase = createClientComponentClient()
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
        statement_date,
        image_path: finalImagePath,
        evidence_url,
        user_id
      }])
      .select()
      .single();

    if (error) throw error;
    return statement;
  },

  // タグの関連付け
  attachTags: async (statementId: string, tagIds: number[]) => {
    const supabase = createClientComponentClient()
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
  getDetail: async (id: string) => {
    const supabase = createClientComponentClient()
    try {
      const { data, error } = await supabase
        .from('statements')
        .select(`
          *,
          speaker:speakers(*, parties(*)),
          tags:statement_tag(tags(*))
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabaseエラー:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('予期せぬエラー:', err);
      return { data: null, error: err };
    }
  }
}
