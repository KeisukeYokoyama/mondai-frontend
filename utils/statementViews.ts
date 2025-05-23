import { getCookie, setCookie } from './cookie';
import { getSupabaseClient } from './supabase/client';

const VIEW_COOKIE_PREFIX = 'statement_view_';
const COOKIE_EXPIRY_DAYS = 1;
const BATCH_INTERVAL = 60 * 60 * 1000; // 1時間間隔でバッチ処理を実行

// ローカルストレージに保存するビュー履歴のキー
const VIEW_HISTORY_KEY = 'statement_views_history';
const LAST_BATCH_TIME_KEY = 'last_batch_processing_time';
const IP_ADDRESS_KEY = 'last_ip_address';

interface ViewHistory {
  statementId: string;
  date: string; // YYYY-MM-DD形式
}

// バッチ処理の実行状態を管理
let isBatchProcessing = false;

// IPアドレスを取得する関数（キャッシュ付き）
const getIpAddress = async (): Promise<string> => {
  const cachedIp = localStorage.getItem(IP_ADDRESS_KEY);
  if (cachedIp) {
    return cachedIp;
  }

  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipResponse.json();
    localStorage.setItem(IP_ADDRESS_KEY, ip);
    return ip;
  } catch (err) {
    console.error('IPアドレスの取得に失敗しました:', err);
    return 'unknown';
  }
};

export const recordStatementView = async (statementId: string) => {
  const cookieName = `${VIEW_COOKIE_PREFIX}${statementId}`;
  const today = new Date().toISOString().split('T')[0];

  // Cookieから今日の閲覧記録を確認
  const lastViewDate = getCookie(cookieName);

  // 今日まだ閲覧していない場合のみ記録
  if (lastViewDate !== today) {
    // ローカルストレージにビュー履歴を保存
    const history = JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]');
    
    // 同じ発言の同じ日付の記録が存在しない場合のみ追加
    const isAlreadyRecorded = history.some(
      (item: ViewHistory) => item.statementId === statementId && item.date === today
    );

    if (!isAlreadyRecorded) {
      history.push({
        statementId,
        date: today
      });
      localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(history));

      // Cookieに今日の日付を保存
      setCookie(cookieName, today, COOKIE_EXPIRY_DAYS);

      // 最後のバッチ処理から1時間以上経過している場合は即時実行
      const lastBatchTime = parseInt(localStorage.getItem(LAST_BATCH_TIME_KEY) || '0', 10);
      const now = Date.now();
      if (now - lastBatchTime >= BATCH_INTERVAL && !isBatchProcessing) {
        await processBatch();
      } else {
        startBatchProcessing();
      }
    }
  }
};

let batchTimeout: NodeJS.Timeout | null = null;

const startBatchProcessing = () => {
  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }

  batchTimeout = setTimeout(async () => {
    if (!isBatchProcessing) {
      await processBatch();
    }
  }, BATCH_INTERVAL);
};

const processBatch = async () => {
  if (isBatchProcessing) return;
  
  isBatchProcessing = true;
  const supabase = getSupabaseClient();
  const history = JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]');
  
  if (history.length === 0) {
    isBatchProcessing = false;
    return;
  }

  try {
    const ip = await getIpAddress();
    const userAgent = navigator.userAgent;

    // まず、有効なstatement_idのリストを取得
    const { data: validStatements } = await supabase
      .from('statements')
      .select('id')
      .in('id', history.map((item: ViewHistory) => item.statementId));

    // 有効なstatement_idのセットを作成
    const validStatementIds = new Set(validStatements?.map(s => s.id) || []);

    // 有効なstatement_idのみをフィルタリング
    const validHistory = history.filter((item: ViewHistory) => 
      validStatementIds.has(item.statementId)
    );

    if (validHistory.length === 0) {
      localStorage.removeItem(VIEW_HISTORY_KEY);
      localStorage.setItem(LAST_BATCH_TIME_KEY, Date.now().toString());
      isBatchProcessing = false;
      return;
    }

    // UPSERTを使用して重複を回避
    const { error } = await supabase
      .from('statement_views')
      .upsert(
        validHistory.map((item: ViewHistory) => ({
          statement_id: item.statementId,
          ip_address: ip,
          user_agent: userAgent,
          viewed_at: isValidDate(item.date) ? new Date(item.date).toISOString() : new Date().toISOString(),
          view_date: item.date
        })),
        { onConflict: 'statement_id,ip_address,user_agent,view_date' }
      );

    if (error) {
      console.error('バッチ処理のエラー:', error);
      isBatchProcessing = false;
      return;
    }

    // 処理済みのデータをクリア
    localStorage.removeItem(VIEW_HISTORY_KEY);
    localStorage.setItem(LAST_BATCH_TIME_KEY, Date.now().toString());
  } catch (err) {
    console.error('バッチ処理のエラー:', err);
  } finally {
    isBatchProcessing = false;
  }
};

// 日付のバリデーション関数
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
} 