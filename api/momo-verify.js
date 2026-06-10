// ═══════════════════════════════════════════════════
// MoMo — Verify payment status + activate Premium (KV)
// Docs: POST https://payment.momo.vn/v2/gateway/api/query
// ═══════════════════════════════════════════════════
const crypto = require('crypto');
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_ENABLED = !!(KV_URL && KV_TOKEN);
async function kv(cmd){
  const r = await fetch(KV_URL,{method:'POST',headers:{Authorization:`Bearer ${KV_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(cmd)});
  return (await r.json()).result;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const PARTNER = process.env.MOMO_PARTNER_CODE;
  const ACCESS  = process.env.MOMO_ACCESS_KEY;
  const SECRET  = process.env.MOMO_SECRET_KEY;
  const ENDPOINT = process.env.MOMO_ENV === 'production'
    ? 'https://payment.momo.vn/v2/gateway/api/query'
    : 'https://test-payment.momo.vn/v2/gateway/api/query';

  let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { orderId, userId } = body || {};
  if (!orderId) return res.status(400).json({ error: 'Thiếu orderId' });

  try {
    const requestId = orderId + '_q' + Date.now();
    const raw = `accessKey=${ACCESS}&orderId=${orderId}&partnerCode=${PARTNER}&requestId=${requestId}`;
    const signature = crypto.createHmac('sha256', SECRET).update(raw).digest('hex');
    const r = await fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerCode: PARTNER, requestId, orderId, lang: 'vi', signature }),
    });
    const data = await r.json();
    const isPaid = data.resultCode === 0;
    const planMatch = orderId.match(/FITAI_\d+_(\w+)/);
    const plan = planMatch?.[1] || 'monthly';
    const months = { monthly: 1, quarterly: 3, halfyear: 6, yearly: 12 }[plan] || 1;
    const expiresAt = new Date(); expiresAt.setMonth(expiresAt.getMonth() + months);

    if (isPaid && KV_ENABLED && userId) {
      try {
        await kv(['SET', `premium:${userId}`, JSON.stringify({ plan, expiresAt: expiresAt.toISOString(), gateway: 'momo' })]);
        await kv(['EXPIRE', `premium:${userId}`, months * 31 * 86400]);
      } catch (e) {}
    }
    return res.status(200).json({
      paid: isPaid, status: data.resultCode,
      plan: isPaid ? plan : null,
      expiresAt: isPaid ? expiresAt.toISOString() : null,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
