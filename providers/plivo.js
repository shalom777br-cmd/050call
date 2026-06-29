const BaseProvider = require(”./base”);

/**

- Plivo プロバイダー
- 
- 必要な環境変数:
- PLIVO_AUTH_ID
- PLIVO_AUTH_TOKEN
- PLIVO_FROM_NUMBER   (+819000000000 形式)
- PLIVO_ANSWER_URL    (発信時に実行するXML URL)
  */
  class PlivoProvider extends BaseProvider {
  constructor(config = {}) {
  super(config);
  this.name = “plivo”;

```
this.authId     = config.authId     || process.env.PLIVO_AUTH_ID;
this.authToken  = config.authToken  || process.env.PLIVO_AUTH_TOKEN;
this.fromNumber = config.fromNumber || process.env.PLIVO_FROM_NUMBER;
this.answerUrl  = config.answerUrl  || process.env.PLIVO_ANSWER_URL;
```

}

validate() {
const missing = [“authId”, “authToken”, “fromNumber”, “answerUrl”]
.filter((k) => !this[k]);
if (missing.length > 0) {
throw new Error(`Plivo: 設定不足 → ${missing.join(", ")}`);
}
return true;
}

async call(to, from, options = {}) {
this.validate();

```
const plivo = _requirePlivo();
const client = new plivo.Client(this.authId, this.authToken);

const res = await client.calls.create(
  from || this.fromNumber,
  to,
  this.answerUrl,
  options
);

return this._buildResult({
  callId: res.requestUuid[0],   // Plivo は配列で返す
  status: "queued",
  raw: res,
});
```

}

async hangup(callId) {
this.validate();
const plivo = _requirePlivo();
const client = new plivo.Client(this.authId, this.authToken);
await client.calls.hangup(callId);
}

async getStatus(callId) {
this.validate();
const plivo = _requirePlivo();
const client = new plivo.Client(this.authId, this.authToken);
const res = await client.calls.get(callId);
return this._buildResult({
callId: res.callUuid,
status: _normalizeStatus(res.callState),
raw: res,
});
}
}

// Plivo の callState を共通ステータスにマップ
function _normalizeStatus(state = “”) {
const map = {
“INITIATED”:  “queued”,
“RINGING”:    “ringing”,
“ANSWER”:     “in-progress”,
“COMPLETED”:  “completed”,
“FAILED”:     “failed”,
“BUSY”:       “failed”,
“NOANSWER”:   “failed”,
“CANCEL”:     “failed”,
};
return map[state.toUpperCase()] ?? state.toLowerCase();
}

function _requirePlivo() {
try {
return require(“plivo”);
} catch {
throw new Error(“plivo パッケージが未インストールです: npm install plivo”);
}
}

module.exports = PlivoProvider;
