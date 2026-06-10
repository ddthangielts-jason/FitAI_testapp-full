// ═══════════════════════════════════════════════════
// PayOS Webhook — kích hoạt Premium khi thanh toán thành công
// Setup tại: https://my.payos.vn → Developer → Webhook URL:
//   https://fit-ai-testapp-full.vercel.app/api/payos-webhook
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
  if (req.method !== 'POST') return res.status(405).end();
  const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

  try {
    let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
    const { code, data, signature } = b || {};

    // Verify signature
    if (PAYOS_CHECKSUM_KEY && signature) {
      const sortedData = Object.keys(data||{}).sort().map(k => `${k}=${data[k]}`).join('&');
      const expectedSig = crypto.createHmac('sha256', PAYOS_CHECKSUM_KEY).update(sortedData).digest('hex');
      if (expectedSig !== signature) return res.status(400).json({ error: 'Invalid signature' });
    }

    if (code === '00' && data?.status === 'PAID') {
      const { orderCode, amount } = data;
      const planMap = { 79000: 'monthly', 199000: 'quarterly', 599000: 'yearly' };
      const plan = planMap[amount] || 'monthly';
      const months = { monthly: 1, quarterly: 3, yearly: 12 }[plan] || 1;
      const expiresAt = new Date(); expiresAt.setMonth(expiresAt.getMonth() + months);

      if (KV_ENABLED) {
        try {
          const mapRaw = await kv(['GET', `order:${orderCode}`]);
          const map = mapRaw ? JSON.parse(mapRaw) : null;
          if (map?.userId) {
            await kv(['SET', `premium:${map.userId}`, JSON.stringify({ plan, expiresAt: expiresAt.toISOString(), gateway: 'payos' })]);
            await kv(['EXPIRE', `premium:${map.userId}`, months * 31 * 86400]);
          }
        } catch (e) {}
      }
      console.log('✅ PayOS PAID:', { orderCode, amount, plan });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};
