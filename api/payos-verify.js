// ═══════════════════════════════════════════════════
// PayOS — Verify payment + activate Premium (KV-backed)
// App gọi sau khi user quay lại từ trang thanh toán.
// Xác nhận với PayOS server (KHÔNG tin URL), rồi lưu Pro vào KV.
// ═══════════════════════════════════════════════════
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

  const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
  const PAYOS_API_KEY   = process.env.PAYOS_API_KEY;

  let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { orderCode, userId } = body || {};
  if (!orderCode) return res.status(400).json({ error: 'Thiếu orderCode' });

  try {
    const response = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`, {
      headers: { 'x-client-id': PAYOS_CLIENT_ID, 'x-api-key': PAYOS_API_KEY },
    });
    const data = await response.json();

    if (data.code === '00') {
      const isPaid = data.data?.status === 'PAID';
      const amount = data.data?.amount;
      const planMap = { 99000: 'monthly', 267000: 'quarterly', 474000: 'halfyear', 599000: 'yearly' };
      const plan = planMap[amount] || 'monthly';
      const monthsMap = { monthly: 1, quarterly: 3, halfyear: 6, yearly: 12 };
      const months = monthsMap[plan] || 1;
      const expiresAt = new Date(); expiresAt.setMonth(expiresAt.getMonth() + months);

      if (isPaid && KV_ENABLED && userId) {
        try {
          await kv(['SET', `premium:${userId}`, JSON.stringify({ plan, expiresAt: expiresAt.toISOString(), gateway: 'payos' })]);
          await kv(['EXPIRE', `premium:${userId}`, months * 31 * 86400]);
        } catch (e) {}
      }

      return res.status(200).json({
        paid: isPaid,
        status: data.data?.status,
        plan: isPaid ? plan : null,
        expiresAt: isPaid ? expiresAt.toISOString() : null,
        amount,
      });
    }
    return res.status(400).json({ error: 'Không thể xác nhận thanh toán' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
