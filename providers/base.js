/**

- BaseProvider — すべてのプロバイダーが実装すべきインターフェース
- 
- 新しいプロバイダーを追加する場合は、このクラスを継承し
- call() / hangup() / getStatus() を必ずオーバーライドしてください。
  */
  class BaseProvider {
  constructor(config = {}) {
  if (new.target === BaseProvider) {
  throw new Error(“BaseProvider は直接インスタンス化できません”);
  }
  this.config = config;
  this.name = “base”;
  }

/**

- 発信する
- @param {string} to   - 発信先電話番号 (E.164形式: +819012345678)
- @param {string} from - 発信元番号 (省略時はconfig.fromNumber)
- @param {object} options - プロバイダー固有の追加オプション
- @returns {Promise<CallResult>}
  */
  async call(to, from, options = {}) {
  throw new Error(`${this.name}.call() が実装されていません`);
  }

/**

- 通話を切断する
- @param {string} callId - call() が返した callResult.callId
- @returns {Promise<void>}
  */
  async hangup(callId) {
  throw new Error(`${this.name}.hangup() が実装されていません`);
  }

/**

- 通話ステータスを取得する
- @param {string} callId
- @returns {Promise<CallStatus>}
  */
  async getStatus(callId) {
  throw new Error(`${this.name}.getStatus() が実装されていません`);
  }

/**

- 設定が揃っているか検証する（起動時チェック用）
- @returns {boolean}
  */
  validate() {
  return true;
  }

/**

- 統一レスポンス形式を作る
- 各プロバイダーはこのメソッドを使って戻り値を正規化すること
  */
  _buildResult({ callId, status, raw = {} }) {
  return {
  provider: this.name,
  callId: String(callId),
  status,        // “queued” | “ringing” | “in-progress” | “completed” | “failed”
  raw,           // プロバイダー固有の生レスポンス（デバッグ用）
  createdAt: new Date().toISOString(),
  };
  }
  }

module.exports = BaseProvider;
