import twilio from "twilio";

export default async function handler(req, res) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const { number } = req.body;

  try {
const call = await client.calls.create({
  to: number,
  from: process.env.TWILIO_PHONE_NUMBER,
  url: "https://demo.twilio.com/docs/voice.xml",
  timeout: 30
});

    res.json({ sid: call.sid });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
