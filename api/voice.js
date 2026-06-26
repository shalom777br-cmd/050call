const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const twiml = new VoiceResponse();
  const to = req.body?.To || req.query?.To;

  if (!to) {
    twiml.say({ language: 'ja-JP' }, '番号が指定されていません。');
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  const dial = twiml.dial({
    callerId: process.env.TWILIO_PHONE_NUMBER,
    answerOnBridge: true,
    timeout: 30
  });

  if (to.startsWith('+') || to.match(/^[0-9]/)) {
    dial.number(to);
  } else {
    dial.client(to);
  }

  res.type('text/xml');
  res.send(twiml.toString());
};
