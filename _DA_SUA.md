# ✅ Cập nhật: TẤT CẢ bài tập giờ đều có hình (201/201)

15 bài trước đây chỉ có emoji (Burpee, Wall Sit, Bear Crawl, Bird Dog, Z Press, Pike Push Up, Rowing Machine, Stair Climber, Battle Rope, Belt Squat, Curtsy Lunge, Decline Cable Fly, Frog Pump, Jump Squat, Pseudo Planche Push Up) giờ đã có hình.

- 4 bài có hình CHÍNH XÁC: Battle Rope, Jump Squat, Rowing Machine, Stair Climber
- 11 bài còn lại dùng hình ĐỘNG TÁC GẦN GIỐNG (database miễn phí không có đúng bài đó), được gắn nhãn "Hình minh hoạ gần đúng" để người dùng biết. Ví dụ: Burpee → dùng hình Mountain Climber (cùng kiểu toàn thân), Wall Sit → hình ngồi squat tĩnh, Z Press → hình đẩy vai ngồi.

→ Giờ thư viện, đổi bài, tìm bài, chọn bài khi tạo plan — KHÔNG còn bài nào chỉ có emoji nữa.

---
# Đã có sẵn từ các bản trước

- Thumbnail hình bài tập ở 4 chỗ: thư viện, đổi bài, tìm bài khi tập, chọn bài tạo plan (lazy-load, lỗi mạng thì hiện emoji đỡ)
- Plan + Lịch đã gộp; đổi bài hết trùng (201 bài, 0 lặp)
- Lỗi icon "F" + nhảy Safari đã sửa (manifest + apple-touch-icon + service worker + tự vào /app)
- Logo cơ bắp; tính kg/reps cập nhật ngay; PayOS + vercel.json đã sửa; service worker v7

## Lưu ý
Hình tải từ GitHub (hơi chậm ở VN, nhưng lazy-load + có emoji đỡ nên không cản app). 11 bài "gần đúng" là vì database miễn phí thiếu — nếu sau này muốn hình đúng 100% thì cần tự quay/thêm ảnh riêng cho các bài đó.

## Deploy
Upload toàn bộ thư mục lên GitHub (giữ api/). Sau deploy: mở app đợi service worker v7 cập nhật; gỡ icon cũ + cài lại để nhận icon cơ bắp.
