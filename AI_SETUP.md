# FitAI — Hướng dẫn bật AI (Vercel)

## File trong repo
```
/api/ai.js          ← serverless function (proxy AI, quota, cache)
/app.html           ← app (đã gọi /api/ai, không còn lộ API key)
/.env.example       ← mẫu biến môi trường
/vercel.json        ← routing
```

## Bước 1 — Thêm API key (bắt buộc)
Vercel Dashboard → Project → **Settings → Environment Variables**, thêm:
```
ANTHROPIC_API_KEY = sk-ant-...   (lấy ở console.anthropic.com)
```
Chỉ cần biến này là AI đã chạy. Key nằm ở server, **không bao giờ gửi xuống máy khách**.

## Bước 2 — Bật quota + cache (rất nên làm, chống cháy túi)
Vercel Dashboard → **Storage → KV → Create Database → Connect to project**.
Vercel tự thêm `KV_REST_API_URL` và `KV_REST_API_TOKEN`. Không cần điền tay.

Khi có KV:
- **Quota**: mỗi user bị giới hạn lượt AI/tháng (free: 3 meal · 2 ảnh · 5 coach; Pro: 30 · 50 · 100). Sửa số trong `TASKS` ở đầu `api/ai.js`.
- **Cache**: 2 user cùng mục tiêu → trả kết quả cũ, không gọi AI lần 2 → tiết kiệm.

Không có KV: vẫn chạy nhưng **không giới hạn** — chỉ dùng khi dev.

## Bước 3 — Deploy
Push lên Git → Vercel tự build. Hoặc `vercel --prod`.

## Chi phí (tham khảo, giá Haiku 4.5 = $1/$5 mỗi triệu token)
- Meal plan: ~330đ/lần · Nhận diện ảnh: ~230đ/lần · Coach tip: ~150đ/lần
- 1 user Pro dùng tới hạn quota ≈ vài nghìn đồng/tháng → vẫn lãi đậm so với phí Pro.

## Đổi mức quota / model
Mở `api/ai.js`, sửa object `TASKS`:
```js
meal: { model:'claude-haiku-4-5-20251001', maxTokens:1200, freeLimit:3, proLimit:30, cacheTtl:86400 }
```
- Muốn chất lượng cao hơn (tốn hơn): đổi `model` sang `'claude-sonnet-4-6'`.
- Muốn chặt hơn: giảm `proLimit`.

## Lưu ý
- `userId` được app tạo ngẫu nhiên và lưu máy khách. Quota theo thiết bị; xoá app là reset.
  Muốn quota chắc chắn theo tài khoản → gắn `userId` = id user sau khi đăng nhập/thanh toán.
- Trạng thái Pro hiện do client gửi (`isPro`). Để chống gian lận, nên xác thực Pro ở server
  (kiểm tra trong KV/DB sau khi PayOS xác nhận thanh toán) trước khi cấp quota Pro.
