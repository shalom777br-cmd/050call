/**

- api/call.js  —  Vercel Function
- 
- POST /api/call
- Body: { “to”: “+819012345678” }
- 
- プロバイダー切り替えは環境変数 CALL_PROVIDER だけで完結。
- このファイルはプロバイダーを一切知らなくてよい。
  */

const { call } = require(”../providers”);

module.exports = async (req, res) => {
if (req.method !== “POST”) {
return res.status(405).json({ error: “POST only” });
}

const { to, from } = req.body ?? {};

if (!to) {
return res.status(400).json({ error: ‘発信先 “to” が未指定です’ });
}

try {
const result = await call(to, from);
return res.status(200).json(result);
} catch (err) {
console.error(”[050call] call error:”, err);
return res.status(500).json({
error: err.message,
provider: process.env.CALL_PROVIDER ?? “twilio”,
});
}
};
