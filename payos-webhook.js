// ═══════════════════════════════════════════════════
// PayOS Webhook - Xử lý khi thanh toán thành công
// Setup webhook URL tại: https://my.payos.vn → Developer
// ═══════════════════════════════════════════════════
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

  try {
    const { code, data, signature } = req.body || {};

    // Verify signature
    if (PAYOS_CHECKSUM_KEY && signature) {
      const sortedData = Object.keys(data||{}).sort()
        .map(k => `${k}=${data[k]}`).join('&');
      const expectedSig = crypto
        .createHmac('sha256', PAYOS_CHECKSUM_KEY)
        .update(sortedData).digest('hex');
      if (expectedSig !== signature) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    // Payment successful
    if (code === '00' && data?.status === 'PAID') {
      const { orderCode, amount, description } = data;

      // Determine plan from amount
      const planMap = { 79000: 'monthly', 199000: 'quarterly', 599000: 'yearly' };
      const plan = planMap[amount] || 'monthly';
      const monthsMap = { monthly: 1, quarterly: 3, yearly: 12 };
      const months = monthsMap[plan] || 1;

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // In production: save to database (Vercel KV, PlanetScale, Supabase)
      // For now: log the event
      console.log('✅ Payment success:', {
        orderCode, amount, plan,
        expiresAt: expiresAt.toISOString(),
      });

      // TODO: Update user's premium status in your DB
      // Example with Vercel KV:
      // const { kv } = require('@vercel/kv');
      // await kv.set(`premium:${userId}`, { plan, expiresAt }, { ex: months * 30 * 86400 });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};
