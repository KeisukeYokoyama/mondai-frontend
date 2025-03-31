import { supabase } from '@/lib/supabase'
import { Statement } from './types'

export const statementAPI = {
  // バケットの存在確認
  checkBucket: async () => {
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.find(b => b.name === 'statements') !== undefined;
  },

  // 一覧取得
  getAll: async () => {
    return await supabase
      .from('statements')
      .select('*')
  },

  // 新規発言登録
  create: async (data: Omit<Statement, 'id' | 'created_at' | 'updated_at'>) => {
    const { title, content, speaker_id, party_id, statement_date, image_path, evidence_url } = data;
    
    // 画像アップロード処理
    let finalImagePath = image_path;
    if (image_path && image_path instanceof File) {
      // バケットの存在確認
      const bucketExists = await statementAPI.checkBucket();
      if (!bucketExists) {
        throw new Error('statements バケットが存在しません');
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('statements')
        .upload(`${Date.now()}-${image_path.name}`, image_path);

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
        evidence_url
      }])
      .select()
      .single();

    if (error) throw error;
    return statement;
  },

  // タグの関連付け
  attachTags: async (statementId: string, tagIds: number[]) => {
    const { error } = await supabase
      .from('statement_tags')
      .insert(
        tagIds.map(tagId => ({
          statement_id: statementId,
          tag_id: tagId
        }))
      );

    if (error) throw error;
  }
}
