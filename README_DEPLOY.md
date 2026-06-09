# 🚀 FitAI v3.0 — Deploy ra sản phẩm thật

## ⚠️ QUAN TRỌNG: repo cũ của bạn đang lỗi
Repo hiện tại có file rác và app.html CŨ (v2.1.0). Hãy thay bằng bản trong thư mục này.
**Xoá khỏi repo:** `app (3).html`, `sw (1).js`, `env.example` (trùng), `chat.js`, `checkout.js`,
`webhook.js` (đều của Stripe — không dùng), và mọi file .js nằm ở thư mục gốc.

## Cấu trúc ĐÚNG (file .js phải nằm trong api/)
```
fitai/
├── app.html          (v3.0.0 — bản mới nhất)
├── index.html
├── exercises.html
├── sw.js
├── vercel.json
├── .env.example
└── api/
    ├── ai.js              (AI: meal, food photo, coach)
    ├── payos-create.js    (tạo đơn PayOS)
    ├── payos-verify.js    (xác nhận + mở Pro)
    ├── payos-webhook.js   (PayOS gọi khi thanh toán xong)
    ├── momo-create.js     (tạo đơn MoMo)
    ├── momo-verify.js     (xác nhận MoMo)
    ├── momo-webhook.js    (MoMo gọi khi xong)
    └── premium-status.js  (app hỏi "user này Pro chưa")
```

## BƯỚC 1 — Thay code & deploy
Upload toàn bộ thư mục này lên GitHub (giữ đúng thư mục api/) → Vercel tự build.
Hoặc trong thư mục: `vercel --prod`.

## BƯỚC 2 — Bật Vercel KV (BẮT BUỘC)
Vercel → Storage → Create Database → **KV** → Connect to Project.
KV lưu: ai đã Pro + đếm quota AI. Không có KV thì thanh toán KHÔNG mở khoá được.

## BƯỚC 3 — Thêm Environment Variables
Vercel → Settings → Environment Variables (xem .env.example):
- `APP_URL` = https://fit-ai-testapp-full.vercel.app
- `ANTHROPIC_API_KEY` = sk-ant-... (cho AI)
- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` (lấy ở my.payos.vn)
- MoMo: chỉ thêm khi tài khoản MoMo Business đã được duyệt.
→ Sau khi thêm: vào Deployments → Redeploy.

## BƯỚC 4 — Cấu hình Webhook PayOS
my.payos.vn → Developer → Webhook URL:
   https://fit-ai-testapp-full.vercel.app/api/payos-webhook
(Đây là cách kích hoạt Pro chắc chắn nhất, kể cả khi user đóng app.)

## BƯỚC 5 — Người dùng cài app về điện thoại (PWA)
Gửi link https://fit-ai-testapp-full.vercel.app cho người dùng:
- iPhone (Safari): nút Chia sẻ → "Thêm vào MH chính"
- Android (Chrome): menu ⋮ → "Cài đặt ứng dụng"
→ App hiện icon, mở toàn màn hình như app thật. (Chưa lên App Store/CH Play — đó là bước sau.)

## KIỂM TRA
- Mở app → Cá nhân → Cài đặt → "🔍 Kiểm tra trạng thái AI" → thấy "🎉 AI đã sẵn sàng".
- Test thanh toán: bấm Nâng cấp Pro → PayOS → trả tiền thật (vài nghìn) →
  quay lại app → Pro tự kích hoạt. Nếu không, đợi 1-2 phút (webhook) rồi mở lại.

## BẢO MẬT (đã xử lý)
- Pro được xác thực ở SERVER (KV), không tin client → không ai giả Pro được.
- AI key không bao giờ lộ xuống máy khách.
- Trang `?payment=success` KHÔNG tự cấp Pro — phải verify với PayOS server.

## MoMo — vì sao chưa dùng được
Ảnh bạn gửi báo "Không tìm thấy tài khoản Doanh Nghiệp" = MoMo Business chưa duyệt.
Code MoMo đã sẵn sàng; khi duyệt xong, thêm 3 biến MOMO_* + đổi MOMO_ENV=production là chạy.
Trước mắt PayOS là đủ để bán.
