const BaseProvider = require(”./base”);

/**

- Telnyx プロバイダー
- 
- 必要な環境変数:
- TELNYX_API_KEY
- TELNYX_FROM_NUMBER      (+819000000000 形式)
- TELNYX_CONNECTION_ID    (Telnyx ポータルで確認)
- TELNYX_WEBHOOK_URL      (通話イベント受信URL、任意)
  */
  class TelnyxProvider extends BaseProvider {
  constructor(config = {}) {
  super(config);
  this.name = “telnyx”;

```
this.apiKey       = config.apiKey       || process.env.TELNYX_API_KEY;
this.fromNumber   = config.fromNumber   || process.env.TELNYX_FROM_NUMBER;
this.connectionId = config.connectionId || process.env.TELNYX_CONNECTION_ID;
this.webhookUrl   = config.webhookUrl   || process.env.TELNYX_WEBHOOK_URL;
```

}

validate() {
const missing = [“apiKey”, “fromNumber”, “connectionId”]
.filter((k) => !this[k]);
if (missing.length > 0) {
throw new Error(`Telnyx: 設定不足 → ${missing.join(", ")}`);
}
return true;
}

async call(to, from, options = {}) {
this.validate();

```
const telnyx = _requireTelnyx()(this.apiKey);

const payload = {
  connection_id:     this.connectionId,
  to,
  from: from || this.fromNumber,
  ...( this.webhookUrl && { webhook_url: this.webhookUrl }),
  ...options,
};

const { data: res } = await telnyx.calls.create(payload);

return this._buildResult({
  callId: res.call_control_id,
  status: _normalizeStatus(res.state),
  raw: res,
});
```

}

async hangup(callId) {
this.validate();
const telnyx = _requireTelnyx()(this.apiKey);
await telnyx.calls.hangup(callId);
}

async getStatus(callId) {
this.validate();
const telnyx = _requireTelnyx()(this.apiKey);
const { data: res } = await telnyx.calls.retrieve(callId);
return this._buildResult({
callId: res.call_control_id,
status: _normalizeStatus(res.state),
raw: res,
});
}
}

// Telnyx の state を共通ステータスにマップ
function _normalizeStatus(state) {
const map = {
parked:       “queued”,
bridging:     “ringing”,
bridged:      “in-progress”,
active:       “in-progress”,
held:         “in-progress”,
done:         “completed”,
hangup:       “completed”,
};
return map[state] ?? state;
}

function _requireTelnyx() {
try {
return require(“telnyx”);
} catch {
throw new Error(“telnyx パッケージが未インストールです: npm install telnyx”);
}
}

module.exports = TelnyxProvider;
