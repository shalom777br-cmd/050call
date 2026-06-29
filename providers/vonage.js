const BaseProvider = require(”./base”);

/**

- Vonage (Nexmo) プロバイダー — 追加例
- 
- 必要な環境変数:
- VONAGE_API_KEY
- VONAGE_API_SECRET
- VONAGE_APPLICATION_ID
- VONAGE_PRIVATE_KEY_PATH   (例: /etc/secrets/vonage_key.pem)
- VONAGE_FROM_NUMBER
- VONAGE_ANSWER_URL
- 
- providers/index.js の REGISTRY に以下を追加するだけで有効になります:
- vonage: () => require(”./vonage”),
  */
  class VonageProvider extends BaseProvider {
  constructor(config = {}) {
  super(config);
  this.name = “vonage”;

```
this.apiKey         = config.apiKey         || process.env.VONAGE_API_KEY;
this.apiSecret      = config.apiSecret      || process.env.VONAGE_API_SECRET;
this.applicationId  = config.applicationId  || process.env.VONAGE_APPLICATION_ID;
this.privateKeyPath = config.privateKeyPath || process.env.VONAGE_PRIVATE_KEY_PATH;
this.fromNumber     = config.fromNumber     || process.env.VONAGE_FROM_NUMBER;
this.answerUrl      = config.answerUrl      || process.env.VONAGE_ANSWER_URL;
```

}

validate() {
const missing = [“apiKey”, “apiSecret”, “applicationId”, “privateKeyPath”, “fromNumber”, “answerUrl”]
.filter((k) => !this[k]);
if (missing.length > 0) {
throw new Error(`Vonage: 設定不足 → ${missing.join(", ")}`);
}
return true;
}

async call(to, from, options = {}) {
this.validate();

```
const Vonage = _requireVonage();
const fs = require("fs");

const vonage = new Vonage({
  apiKey:        this.apiKey,
  apiSecret:     this.apiSecret,
  applicationId: this.applicationId,
  privateKey:    fs.readFileSync(this.privateKeyPath),
});

return new Promise((resolve, reject) => {
  vonage.calls.create(
    {
      to:       [{ type: "phone", number: to }],
      from:     { type: "phone", number: from || this.fromNumber },
      answer_url: [this.answerUrl],
      ...options,
    },
    (err, res) => {
      if (err) return reject(err);
      resolve(this._buildResult({
        callId: res.uuid,
        status: _normalizeStatus(res.status),
        raw: res,
      }));
    }
  );
});
```

}

async hangup(callId) {
this.validate();
const Vonage = _requireVonage();
const vonage = new Vonage({ apiKey: this.apiKey, apiSecret: this.apiSecret });
return new Promise((resolve, reject) => {
vonage.calls.update(callId, { action: “hangup” }, (err) =>
err ? reject(err) : resolve()
);
});
}

async getStatus(callId) {
this.validate();
const Vonage = _requireVonage();
const vonage = new Vonage({ apiKey: this.apiKey, apiSecret: this.apiSecret });
return new Promise((resolve, reject) => {
vonage.calls.get(callId, (err, res) => {
if (err) return reject(err);
resolve(this._buildResult({
callId: res.uuid,
status: _normalizeStatus(res.status),
raw: res,
}));
});
});
}
}

function _normalizeStatus(status = “”) {
const map = {
started:    “queued”,
ringing:    “ringing”,
answered:   “in-progress”,
completed:  “completed”,
failed:     “failed”,
busy:       “failed”,
timeout:    “failed”,
cancelled:  “failed”,
rejected:   “failed”,
};
return map[status.toLowerCase()] ?? status.toLowerCase();
}

function _requireVonage() {
try {
return require(”@vonage/server-sdk”);
} catch {
throw new Error(“vonage パッケージが未インストールです: npm install @vonage/server-sdk”);
}
}

module.exports = VonageProvider;
