# ✅ Bước B — Bảng xếp hạng bạn bè (Supabase) ĐÃ TÍCH HỢP VÀO APP

## Đã làm
1. Nhúng thư viện Supabase + kết nối tới project của bạn (URL + publishable key).
2. **Đăng nhập / Đăng ký** bằng email + mật khẩu + username.
3. **Đồng bộ điểm tự động** lên cloud: streak, tổng buổi, tổng kg, level, số buổi/tuần — cập nhật khi đăng nhập và sau mỗi buổi tập.
4. **Màn "Bạn bè & Xếp hạng"**: vào tab Cá nhân → "🏆 Bạn bè & Xếp hạng".
   - Tìm & kết bạn qua username
   - Nhận/chấp nhận lời mời kết bạn
   - **Bảng xếp hạng**: xem bạn bè đứng đâu, xếp theo Tổng kg / Streak / Buổi mỗi tuần / Tổng buổi
   - Top 3 có huy chương vàng/bạc/đồng, dòng của bạn được tô sáng
   Song ngữ Việt/Anh.

## ⚠️ QUAN TRỌNG khi deploy & test
- Tính năng này CHỈ chạy khi app online (cần tải thư viện Supabase + kết nối database).
- Sau khi deploy lên Vercel:
  1. Mở app → tab Cá nhân → "🏆 Bạn bè & Xếp hạng"
  2. Bấm "Đăng ký" → nhập username + email + mật khẩu
  3. Nếu bạn ĐÃ TẮT "Confirm email" ở Supabase → dùng được ngay
     Nếu CÒN BẬT → phải vào email bấm xác nhận trước khi đăng nhập
- Để test bảng xếp hạng: tạo 2 tài khoản (2 email khác nhau), kết bạn với nhau, mỗi tài khoản tập vài buổi → xem xếp hạng.

## Bảo mật
- Publishable key nhúng trong app là AN TOÀN (Supabase xác nhận). RLS đã bật: mỗi người chỉ sửa được dữ liệu của mình.
- KHÔNG bao giờ nhúng "secret key" vào app.

## Deploy
Upload toàn bộ thư mục lên GitHub (giữ api/ + supabase/). Sau deploy mở app đợi service worker cập nhật.
Nếu sau này đổi project Supabase: sửa SB_URL và SB_KEY ở đầu phần script trong app.html.
