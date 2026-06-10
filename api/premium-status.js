// ═══════════════════════════════════════════════════
// Trả về trạng thái Premium của user từ KV (nguồn sự thật)
// App gọi lúc mở để đồng bộ Pro (kể cả khi webhook kích hoạt lúc app đóng)
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

  let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { userId } = body || {};
  if (!userId) return res.status(200).json({ premium: false });
  if (!KV_ENABLED) return res.status(200).json({ premium: false, kv: false });

  try {
    const raw = await kv(['GET', `premium:${userId}`]);
    if (!raw) return res.status(200).json({ premium: false });
    const p = JSON.parse(raw);
    const active = p.expiresAt && new Date(p.expiresAt) > new Date();
    return res.status(200).json({ premium: !!active, plan: p.plan, expiresAt: p.expiresAt });
  } catch (e) {
    return res.status(200).json({ premium: false, error: e.message });
  }
};
