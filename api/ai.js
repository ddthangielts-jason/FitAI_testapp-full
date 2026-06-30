// ═══════════════════════════════════════════════════════════════
// FitAI — AI proxy route (Vercel Serverless Function)
// Path: /api/ai
//
// Bảo vệ API key, đếm quota theo user, cache kết quả, dùng model rẻ (Haiku).
// App gọi POST /api/ai  với body: { task, payload, userId, isPro }
//   task = 'meal' | 'food_photo' | 'coach'
//
// ── BẬT QUOTA + CACHE (khuyến nghị) ──
// Cần Vercel KV (Redis). Tạo ở: Vercel Dashboard → Storage → KV → Create.
// Nó tự thêm các biến KV_REST_API_URL / KV_REST_API_TOKEN vào env.
// Nếu CHƯA có KV: route vẫn chạy, nhưng KHÔNG giới hạn quota (rủi ro chi phí) —
// chỉ dùng tạm khi dev. Production PHẢI bật KV.
// ═══════════════════════════════════════════════════════════════

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

// ── Cấu hình quota / model theo từng task ──
const TASKS = {
  meal:       { model: 'claude-haiku-4-5-20251001', maxTokens: 1200, freeLimit: 3,  proLimit: 30, cacheTtl: 86400 },
  food_photo: { model: 'claude-haiku-4-5-20251001', maxTokens: 400,  freeLimit: 2,  proLimit: 50, cacheTtl: 0     },
  coach:      { model: 'claude-haiku-4-5-20251001', maxTokens: 300,  freeLimit: 5,  proLimit: 100, cacheTtl: 3600 },
  bodyAnalysis:{ model: 'claude-haiku-4-5-20251001', maxTokens: 700, freeLimit: 3,  proLimit: 30,  cacheTtl: 0 },
};

// ── Vercel KV (Redis REST) — chỉ dùng nếu đã cấu hình ──
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_ENABLED = !!(KV_URL && KV_TOKEN);

async function kv(command) {
  // command là mảng, vd ['INCR','key'] — gọi Upstash/Vercel KV REST
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const data = await res.json();
  return data.result;
}

// Khoá quota theo user + task + tháng hiện tại (reset mỗi tháng)
function quotaKey(userId, task) {
  const ym = new Date().toISOString().slice(0, 7); // 2026-06
  return `quota:${task}:${userId}:${ym}`;
}

// Đơn giản hoá chuỗi để làm khoá cache
function cacheKey(task, str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return `cache:${task}:${h}`;
}

export default async function handler(req, res) {
  // CORS (nếu app và api cùng domain Vercel thì không cần, để cho chắc)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Health check: GET /api/ai → cho app tự kiểm tra cấu hình ──
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      hasKey: !!process.env.ANTHROPIC_API_KEY,
      kvEnabled: KV_ENABLED,
      model: TASKS.meal.model,
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'server_misconfigured', message: 'Thiếu ANTHROPIC_API_KEY' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { task, payload, userId = 'anon' } = body || {};

  const cfg = TASKS[task];
  if (!cfg) return res.status(400).json({ error: 'bad_task' });

  // Xác thực Pro từ KV (nguồn sự thật) — KHÔNG tin isPro do client gửi
  let isPro = false;
  if (KV_ENABLED && userId && userId !== 'anon') {
    try {
      const praw = await kv(['GET', `premium:${userId}`]);
      if (praw) {
        const prem = JSON.parse(praw);
        if (prem.expiresAt && new Date(prem.expiresAt) > new Date()) isPro = true;
      }
    } catch (e) {}
  }

  // ── 1) QUOTA ──
  const limit = isPro ? cfg.proLimit : cfg.freeLimit;
  if (KV_ENABLED) {
    try {
      const key = quotaKey(userId, task);
      const used = parseInt(await kv(['GET', key]) || '0', 10);
      if (used >= limit) {
        return res.status(429).json({
          error: 'quota_exceeded',
          message: isPro
            ? `Bạn đã dùng hết ${limit} lượt ${task} trong tháng này.`
            : `Hết lượt miễn phí. Nâng cấp Pro để dùng tới ${cfg.proLimit} lượt/tháng.`,
          used, limit, isPro,
        });
      }
    } catch (e) { /* nếu KV lỗi, không chặn — nhưng nên theo dõi */ }
  }

  // ── 2) CACHE (chỉ cho task có cacheTtl > 0) ──
  let ck = null;
  if (KV_ENABLED && cfg.cacheTtl > 0) {
    try {
      ck = cacheKey(task, JSON.stringify(payload));
      const cached = await kv(['GET', ck]);
      if (cached) {
        return res.status(200).json({ result: JSON.parse(cached), cached: true });
      }
    } catch (e) { ck = null; }
  }

  // ── 3) GỌI ANTHROPIC ──
  const messages = buildMessages(task, payload);
  let aiResult;
  try {
    const r = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: cfg.model, max_tokens: cfg.maxTokens, messages }),
    });
    const data = await r.json();
    if (data.error) return res.status(502).json({ error: 'ai_error', message: data.error.message });
    aiResult = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  } catch (e) {
    return res.status(502).json({ error: 'ai_unreachable', message: 'Không gọi được AI' });
  }

  // ── 4) Tăng quota + lưu cache (best-effort) ──
  if (KV_ENABLED) {
    try {
      const key = quotaKey(userId, task);
      await kv(['INCR', key]);
      await kv(['EXPIRE', key, 60 * 60 * 24 * 35]); // tự xoá sau ~35 ngày
      if (ck) { await kv(['SET', ck, JSON.stringify(aiResult)]); await kv(['EXPIRE', ck, cfg.cacheTtl]); }
    } catch (e) { /* không chặn response */ }
  }

  return res.status(200).json({ result: aiResult, cached: false });
}

// ── Dựng messages cho từng task ──
function buildMessages(task, payload = {}) {
  if (task === 'meal') {
    const { goalVi, cal, protein, carbs, fat, kg, cm, age, prompt } = payload;
    return [{
      role: 'user',
      content: `Bạn là chuyên gia dinh dưỡng người Việt. Tạo thực đơn 1 ngày bằng MÓN ĂN VIỆT NAM thực tế, dễ mua/dễ nấu.
Mục tiêu: ${goalVi}. Calo: ${cal} kcal/ngày. Protein: ${protein}g. Carbs: ${carbs}g. Fat: ${fat}g.
Người dùng: ${kg || '?'}kg, ${cm || '?'}cm, ${age || '?'} tuổi.
${prompt ? 'Yêu cầu riêng: "' + prompt + '". TUÂN THỦ nghiêm túc.' : ''}
Trả về DUY NHẤT một JSON array, KHÔNG markdown, KHÔNG giải thích. Mỗi phần tử:
{"time":"🌅 Sáng 7h","desc":"mô tả ngắn","cal":number,"p":number,"foods":["món + khối lượng"]}
Tạo 4-5 bữa, tổng calo gần ${cal}. Foods ghi rõ khối lượng.`,
    }];
  }
  if (task === 'food_photo') {
    const { imageBase64 } = payload;
    return [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: 'Nhận diện món ăn Việt Nam trong ảnh và ước lượng dinh dưỡng cho khẩu phần thấy được. Trả về DUY NHẤT JSON, không markdown: {"name":"tên món tiếng Việt","serving":"mô tả khẩu phần","cal":number,"protein":number,"carbs":number,"fat":number}' },
      ],
    }];
  }
  if (task === 'coach') {
    return [{ role: 'user', content: payload.prompt || '' }];
  }
  if (task === 'bodyAnalysis') {
    const p = payload || {};
    const en = p.lang === 'en';
    const volStr = Object.entries(p.muscleVolume || {}).map(([m,v]) => `${m}: ${Math.round(v)}kg (${(p.muscleSets||{})[m]||0} sets)`).join(', ');
    const prStr = Object.entries(p.keyPRs || {}).map(([n,kg]) => `${n}: ${kg}kg`).join(', ') || 'none';
    const m1 = p.measurementsFirst, m2 = p.measurementsLast;
    const measStr = (m1 && m2)
      ? `First (${m1.date}): chest ${m1.chest||'?'}cm, arm ${m1.arm||'?'}cm, waist ${m1.waist||'?'}cm, thigh ${m1.thigh||'?'}cm, weight ${m1.weight||'?'}kg. Latest (${m2.date}): chest ${m2.chest||'?'}cm, arm ${m2.arm||'?'}cm, waist ${m2.waist||'?'}cm, thigh ${m2.thigh||'?'}cm, weight ${m2.weight||'?'}kg.`
      : 'No body measurements logged yet.';
    const prof = p.profile || {};
    const content = en
      ? `You are an experienced strength coach. Analyze this lifter's data and give a concise, encouraging, practical assessment.
Profile: ${prof.sex||'?'}, goal ${prof.goal||'?'}, level ${prof.level||'?'}, ${prof.weight||'?'}kg, ${prof.height||'?'}cm.
Training volume by muscle: ${volStr || 'none'}.
Key lifts (best): ${prStr}.
Measurements: ${measStr}
Total workouts: ${p.totalWorkouts||0}.

Write 4 short sections with these headers exactly:
💪 Strengths
📈 Lagging / needs more
🎯 Recommendations (2-3 concrete actions)
🔥 Motivation (1 warm sentence)
Keep it under 180 words total. Be specific to the numbers. No markdown symbols like ** or #.`
      : `Bạn là HLV thể hình giàu kinh nghiệm. Phân tích dữ liệu của người tập này và đưa nhận xét ngắn gọn, tích cực, thực tế bằng TIẾNG VIỆT.
Hồ sơ: ${prof.sex||'?'}, mục tiêu ${prof.goal||'?'}, trình độ ${prof.level||'?'}, ${prof.weight||'?'}kg, ${prof.height||'?'}cm.
Khối lượng tập theo nhóm cơ: ${volStr || 'chưa có'}.
Mức tạ tốt nhất: ${prStr}.
Số đo: ${measStr}
Tổng số buổi tập: ${p.totalWorkouts||0}.

Viết 4 phần ngắn với đúng các tiêu đề sau:
💪 Điểm mạnh
📈 Nhóm yếu / cần tập thêm
🎯 Gợi ý (2-3 hành động cụ thể)
🔥 Động viên (1 câu ấm lòng)
Tổng dưới 180 từ. Bám sát con số cụ thể. KHÔNG dùng ký hiệu markdown như ** hay #.`;
    return [{ role: 'user', content }];
  }
  return [{ role: 'user', content: 'Hello' }];
}
