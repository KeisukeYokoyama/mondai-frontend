import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const commentAPI = {
  // コメント投稿前のチェック
  checkSpam: async (ipAddress: string) => {
    const supabase = createClientComponentClient();
    
    // IP制限のチェック
    const { data: ipRestriction } = await supabase
      .from('ip_restrictions')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    if (ipRestriction?.is_blocked) {
      throw new Error('このIPアドレスはブロックされています');
    }

    // 投稿制限のチェック
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (ipRestriction?.last_comment_at && new Date(ipRestriction.last_comment_at) > oneHourAgo) {
      throw new Error('投稿は1時間に1回までです');
    }

    return true;
  },

  // コメント投稿
  create: async (data: {
    statement_id: string;
    content: string;
    ip_address: string;
    user_agent: string;
  }) => {
    const supabase = createClientComponentClient();

    // コメント投稿
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return comment;
  },

  // コメント一覧取得
  getByStatement: async (statementId: string) => {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('statement_id', statementId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // コメント報告
  report: async (commentId: string) => {
    const supabase = createClientComponentClient();
    
    const { data: currentComment } = await supabase
      .from('comments')
      .select('report_count')
      .eq('id', commentId)
      .single();

    const { error } = await supabase
      .from('comments')
      .update({ report_count: (currentComment?.report_count || 0) + 1 })
      .eq('id', commentId);

    if (error) throw error;
  },
}; 