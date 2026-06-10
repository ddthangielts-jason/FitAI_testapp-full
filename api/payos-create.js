// ═══════════════════════════════════════════════════
// PayOS Payment - Create Order
// Docs: https://payos.vn/docs/api/
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

  const PAYOS_CLIENT_ID     = process.env.PAYOS_CLIENT_ID;
  const PAYOS_API_KEY       = process.env.PAYOS_API_KEY;
  const PAYOS_CHECKSUM_KEY  = process.env.PAYOS_CHECKSUM_KEY;
  const APP_URL             = process.env.APP_URL || 'https://fit-ai-testapp-full.vercel.app';

  if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
    return res.status(500).json({ error: 'PayOS chưa được cấu hình. Liên hệ admin.' });
  }

  const { plan, userEmail, userId } = req.body || {};
  if (!plan) return res.status(400).json({ error: 'Thiếu thông tin plan' });

  // Pricing (VNĐ)
  const PLANS = {
    monthly:  { amount: 99000,  desc: 'FitAI Premium - 1 thang',   months: 1  },
    quarterly:{ amount: 267000, desc: 'FitAI Premium - 3 thang',   months: 3  },
    halfyear: { amount: 474000, desc: 'FitAI Premium - 6 thang',   months: 6  },
    yearly:   { amount: 599000, desc: 'FitAI Premium - 12 thang',  months: 12 },
  };

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) return res.status(400).json({ error: 'Plan không hợp lệ' });

  // Unique order code (PayOS requires integer, max 9999999999)
  const orderCode = Date.now() % 9999999999;

  // Các giá trị sẽ gửi đi — PHẢI ký đúng y hệt các giá trị này
  const amount = selectedPlan.amount;
  const description = selectedPlan.desc.substring(0, 25); // <=25 ký tự
  const cancelUrl = `${APP_URL}/app?payment=cancel`;
  const returnUrl = `${APP_URL}/app?payment=success&plan=${plan}&userId=${userId || ''}`;

  // Chữ ký PayOS: HMAC_SHA256 theo thứ tự alphabet, dùng CHÍNH giá trị gửi đi
  // Format bắt buộc: amount=&cancelUrl=&description=&orderCode=&returnUrl=
  const signData =
    `amount=${amount}` +
    `&cancelUrl=${cancelUrl}` +
    `&description=${description}` +
    `&orderCode=${orderCode}` +
    `&returnUrl=${returnUrl}`;

  const signature = crypto
    .createHmac('sha256', PAYOS_CHECKSUM_KEY)
    .update(signData)
    .digest('hex');

  const body = {
    orderCode,
    amount,
    description,
    buyerEmail: userEmail || '',
    buyerName:  'FitAI User',
    items: [{
      name:     'FitAI Premium',
      quantity: 1,
      price:    amount,
    }],
    cancelUrl,
    returnUrl,
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
      // Lưu map orderCode → userId để webhook kích hoạt đúng người
      if (KV_ENABLED && userId) {
        try { await kv(['SET', `order:${orderCode}`, JSON.stringify({ userId, plan })]); await kv(['EXPIRE', `order:${orderCode}`, 7*86400]); } catch(e){}
      }
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
