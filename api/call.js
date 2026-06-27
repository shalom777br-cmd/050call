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
      url: "https://demo.twilio.com/docs/voice.xml"
    });

    res.json({ sid: call.sid });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}async function call() {
  const number = document.getElementById("display").innerText;

  const res = await fetch("/api/call", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number })
  });

  const data = await res.json();

  alert("発信開始: " + data.sid);
}

