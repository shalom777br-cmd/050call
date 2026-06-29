/**

- providers/index.js  —  プロバイダーファクトリ
- 
- 使い方:
- const { call } = require("./providers");
- const result = await call("+819012345678");
- 
- プロバイダー切り替え:
- 環境変数 CALL_PROVIDER に "twilio" / “telnyx” / “plivo” を設定するだけ。
- 
- 新プロバイダー追加手順:
- 1. providers/vonage.js を作り BaseProvider を継承
- 1. 下の REGISTRY に 1行追加: vonage: () => require(”./vonage”)
- 1. .env に CALL_PROVIDER=vonage を設定
   */

const REGISTRY = {
twilio:  () => require("./twilio"),
telnyx:  () => require("./telnyx"),
plivo:   () => require("./plivo"),
// vonage: () => require("./vonage"),  ← 追加例
};

// ————————————————
// アクティブプロバイダーをシングルトンで保持
// ————————————————
let _activeProvider = null;

/**

- プロバイダーインスタンスを取得する
- @param {string} [providerName] - 明示指定 (省略時は CALL_PROVIDER 環境変数)
- @returns {BaseProvider}
  */
  function getProvider(providerName) {
  const name = (providerName || process.env.CALL_PROVIDER || "twilio").toLowerCase();

if (!REGISTRY[name]) {
throw new Error(
`未知のプロバイダー: "${name}"\n` +
`利用可能: ${Object.keys(REGISTRY).join(", ")}`
);
}

// 同じプロバイダーなら再利用
if (_activeProvider?.name === name) return _activeProvider;

const ProviderClass = REGISTRY[name]();
_activeProvider = new ProviderClass();
return _activeProvider;
}

/**

- 発信する（メインAPI）
- 
- @param {string} to      - 発信先 (E.164: +819012345678)
- @param {string} [from]  - 発信元（省略時はプロバイダーのデフォルト番号）
- @param {object} [opts]  - プロバイダー固有オプション
- @returns {Promise<CallResult>}
- 
- @example
- const { call } = require("./providers");
- const result = await call("+819012345678");
- console.log(result.callId, result.provider);
  */
  async function call(to, from, opts = {}) {
  if (!to) throw new Error(“発信先番号 (to) は必須です”);
  return getProvider().call(to, from, opts);
  }

/**

- 通話を切断する
- @param {string} callId
  */
  async function hangup(callId) {
  if (!callId) throw new Error(“callId は必須です”);
  return getProvider().hangup(callId);
  }

/**

- 通話ステータスを取得する
- @param {string} callId
- @returns {Promise<CallResult>}
  */
  async function getStatus(callId) {
  if (!callId) throw new Error(“callId は必須です”);
  return getProvider().getStatus(callId);
  }

module.exports = { call, hangup, getStatus, getProvider };
