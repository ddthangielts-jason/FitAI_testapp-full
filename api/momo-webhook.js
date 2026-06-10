// ═══════════════════════════════════════════════════
// MoMo IPN Webhook - nhận callback từ MoMo
// ═══════════════════════════════════════════════════
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const MOMO_SECRET_KEY   = process.env.MOMO_SECRET_KEY;
  const MOMO_ACCESS_KEY   = process.env.MOMO_ACCESS_KEY;
  const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;

  try {
    const {
      partnerCode, orderId, requestId, amount, orderInfo,
      orderType, transId, resultCode, message, payType,
      responseTime, extraData, signature,
    } = req.body || {};

    // Verify signature
    const rawSignature = [
      `accessKey=${MOMO_ACCESS_KEY}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join('&');

    const expectedSig = crypto
      .createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature).digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // resultCode 0 = success
    if (resultCode === 0) {
      const planMatch = orderId.match(/FITAI_\d+_(\w+)/);
      const plan = planMatch?.[1] || 'monthly';
      const monthsMap = { monthly: 1, quarterly: 3, halfyear: 6, yearly: 12 };
      const months = monthsMap[plan] || 1;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // Parse userId from extraData
      let userId = null;
      try {
        const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString());
        userId = decoded.userId;
      } catch {}

      console.log('✅ MoMo payment success:', {
        orderId, amount, plan, transId, userId,
        expiresAt: expiresAt.toISOString(),
      });

      // TODO: save to DB and activate premium for userId
    }

    return res.status(204).end();
  } catch (err) {
    console.error('MoMo webhook error:', err);
    return res.status(500).json({ message: err.message });
  }
};
