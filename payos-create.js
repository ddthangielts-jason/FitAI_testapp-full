// ═══════════════════════════════════════════════════
// PayOS Payment - Create Order
// Docs: https://payos.vn/docs/api/
// ═══════════════════════════════════════════════════
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const PAYOS_CLIENT_ID     = process.env.PAYOS_CLIENT_ID;
  const PAYOS_API_KEY       = process.env.PAYOS_API_KEY;
  const PAYOS_CHECKSUM_KEY  = process.env.PAYOS_CHECKSUM_KEY;
  const APP_URL             = process.env.APP_URL || 'https://fit-ai-rho-eight.vercel.app';

  if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
    return res.status(500).json({ error: 'PayOS chưa được cấu hình. Liên hệ admin.' });
  }

  const { plan, userEmail, userId } = req.body || {};
  if (!plan) return res.status(400).json({ error: 'Thiếu thông tin plan' });

  // Pricing (VNĐ)
  const PLANS = {
    monthly:  { amount: 79000,  desc: 'FitAI Premium - 1 tháng',   months: 1  },
    quarterly:{ amount: 199000, desc: 'FitAI Premium - 3 tháng',   months: 3  },
    yearly:   { amount: 599000, desc: 'FitAI Premium - 12 tháng',  months: 12 },
  };

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) return res.status(400).json({ error: 'Plan không hợp lệ' });

  // Unique order code (PayOS requires integer, max 9999999999)
  const orderCode = Date.now() % 9999999999;

  // Build signature for PayOS
  // Format: amount={}&cancelUrl={}&description={}&orderCode={}&returnUrl={}
  const signData = [
    `amount=${selectedPlan.amount}`,
    `cancelUrl=${APP_URL}/app?payment=cancel`,
    `description=${selectedPlan.desc.replace(/\s/g,'_').substring(0,25)}`,
    `orderCode=${orderCode}`,
    `returnUrl=${APP_URL}/app?payment=success&plan=${plan}`,
  ].join('&');

  const signature = crypto
    .createHmac('sha256', PAYOS_CHECKSUM_KEY)
    .update(signData)
    .digest('hex');

  const body = {
    orderCode,
    amount: selectedPlan.amount,
    description: selectedPlan.desc.substring(0, 25),
    buyerEmail: userEmail || '',
    buyerName:  'FitAI User',
    items: [{
      name:     'FitAI Premium',
      quantity: 1,
      price:    selectedPlan.amount,
    }],
    cancelUrl:  `${APP_URL}/app?payment=cancel`,
    returnUrl:  `${APP_URL}/app?payment=success&plan=${plan}&userId=${userId||''}`,
    expiredAt:  Math.floor(Date.now()/1000) + 3600, // 1 hour
    signature,
  };

  try {
    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id':  PAYOS_CLIENT_ID,
        'x-api-key':    PAYOS_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.code === '00') {
      // Store pending order (in production: use a real DB like Vercel KV or PlanetScale)
      return res.status(200).json({
        success: true,
        checkoutUrl:  data.data.checkoutUrl,
        qrCode:       data.data.qrCode,
        orderCode:    orderCode,
        amount:       selectedPlan.amount,
        plan,
      });
    } else {
      return res.status(400).json({ error: data.desc || 'PayOS lỗi', raw: data });
    }
  } catch (err) {
    console.error('PayOS error:', err);
    return res.status(500).json({ error: 'Không thể kết nối PayOS: ' + err.message });
  }
};
