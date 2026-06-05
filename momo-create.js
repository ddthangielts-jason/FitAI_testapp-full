// ═══════════════════════════════════════════════════
// MoMo Payment - Create Order (All-in-one gateway)
// Docs: https://developers.momo.vn/v3/
// Test: https://test-payment.momo.vn/v2/gateway/api/create
// ═══════════════════════════════════════════════════
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
  const MOMO_ACCESS_KEY   = process.env.MOMO_ACCESS_KEY;
  const MOMO_SECRET_KEY   = process.env.MOMO_SECRET_KEY;
  const APP_URL           = process.env.APP_URL || 'https://fit-ai-rho-eight.vercel.app';
  // Use sandbox for dev, production URL for live
  const MOMO_ENDPOINT = process.env.MOMO_ENV === 'production'
    ? 'https://payment.momo.vn/v2/gateway/api/create'
    : 'https://test-payment.momo.vn/v2/gateway/api/create';

  if (!MOMO_PARTNER_CODE || !MOMO_ACCESS_KEY || !MOMO_SECRET_KEY) {
    return res.status(500).json({ error: 'MoMo chưa được cấu hình. Liên hệ admin.' });
  }

  const { plan, userEmail, userId } = req.body || {};

  const PLANS = {
    monthly:  { amount: 79000,  name: 'FitAI Premium 1 tháng'  },
    quarterly:{ amount: 199000, name: 'FitAI Premium 3 tháng'  },
    yearly:   { amount: 599000, name: 'FitAI Premium 12 tháng' },
  };

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) return res.status(400).json({ error: 'Plan không hợp lệ' });

  const orderId      = `FITAI_${Date.now()}_${plan}`;
  const requestId    = orderId;
  const orderInfo    = selectedPlan.name;
  const redirectUrl  = `${APP_URL}/app?payment=success&plan=${plan}&userId=${userId||''}`;
  const ipnUrl       = `${APP_URL}/api/momo-webhook`;
  const amount       = selectedPlan.amount;
  const requestType  = 'payWithMethod'; // supports QR + app deeplink
  const extraData    = Buffer.from(JSON.stringify({userId, plan})).toString('base64');

  // Build HMAC signature
  const rawSignature = [
    `accessKey=${MOMO_ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${MOMO_PARTNER_CODE}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join('&');

  const signature = crypto
    .createHmac('sha256', MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  const body = {
    partnerCode: MOMO_PARTNER_CODE,
    partnerName: 'FitAI',
    storeId:     'FitAI_Store',
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    lang:        'vi',
    signature,
  };

  try {
    const response = await fetch(MOMO_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const data = await response.json();

    if (data.resultCode === 0) {
      return res.status(200).json({
        success:     true,
        payUrl:      data.payUrl,      // redirect URL
        deeplink:    data.deeplink,    // MoMo app deeplink
        qrCodeUrl:   data.qrCodeUrl,   // QR code
        orderId,
        amount,
        plan,
      });
    } else {
      return res.status(400).json({
        error: data.message || 'MoMo lỗi',
        code:  data.resultCode,
      });
    }
  } catch (err) {
    console.error('MoMo error:', err);
    return res.status(500).json({ error: 'Không thể kết nối MoMo: ' + err.message });
  }
};
