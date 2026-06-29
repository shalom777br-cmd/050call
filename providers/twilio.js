const BaseProvider = require(”./base”);

/**

- Twilio プロバイダー
- 
- 必要な環境変数:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER   (+819000000000 形式)
- TWILIO_TWIML_URL     (発信時に実行するTwiML URL)
  */
  class TwilioProvider extends BaseProvider {
  constructor(config = {}) {
  super(config);
  this.name = “twilio”;

```
this.accountSid  = config.accountSid  || process.env.TWILIO_ACCOUNT_SID;
this.authToken   = config.authToken   || process.env.TWILIO_AUTH_TOKEN;
this.fromNumber  = config.fromNumber  || process.env.TWILIO_FROM_NUMBER;
this.twimlUrl    = config.twimlUrl    || process.env.TWILIO_TWIML_URL;
```

}

validate() {
const missing = [“accountSid”, “authToken”, “fromNumber”, “twimlUrl”]
.filter((k) => !this[k]);
if (missing.length > 0) {
throw new Error(`Twilio: 設定不足 → ${missing.join(", ")}`);
}
return true;
}

async call(to, from, options = {}) {
this.validate();

```
const Twilio = _requireTwilio();
const client = new Twilio(this.accountSid, this.authToken);

const res = await client.calls.create({
  to,
  from: from || this.fromNumber,
  url:  this.twimlUrl,
  ...options,
});

return this._buildResult({
  callId: res.sid,
  status: res.status,
  raw: res,
});
```

}

async hangup(callId) {
this.validate();
const Twilio = _requireTwilio();
const client = new Twilio(this.accountSid, this.authToken);
await client.calls(callId).update({ status: “completed” });
}

async getStatus(callId) {
this.validate();
const Twilio = _requireTwilio();
const client = new Twilio(this.accountSid, this.authToken);
const res = await client.calls(callId).fetch();
return this._buildResult({ callId: res.sid, status: res.status, raw: res });
}
}

function _requireTwilio() {
try {
return require(“twilio”);
} catch {
throw new Error(“twilio パッケージが未インストールです: npm install twilio”);
}
}

module.exports = TwilioProvider;
