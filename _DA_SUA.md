# ✅ Cập nhật mới: Hình thu nhỏ bài tập (dễ chọn hơn)

## ⭐ Thêm hình minh hoạ vào danh sách bài tập
Giờ người mới nhìn HÌNH là biết bài tập đó tập thế nào, không cần thêm vào buổi rồi mới xem GIF/video.
Đã thêm thumbnail (ảnh thật của động tác) vào 4 chỗ:
1. **Thư viện bài tập** (các thẻ bài) — ảnh lớn + nhãn ▶ VIDEO
2. **Đổi bài tập** (swap sheet) — ảnh nhỏ bên trái mỗi bài
3. **Tìm bài khi đang tập** (thanh tìm trong buổi) — ảnh nhỏ
4. **Chọn bài khi tạo Plan** (day picker) — ảnh nhỏ

Cách hoạt động: ảnh tải nhẹ (lazy-load, chỉ tải khi cuộn tới), nếu chưa tải xong/lỗi mạng thì hiện emoji thay thế → không bao giờ vỡ giao diện. 186/201 bài có ảnh thật; số còn lại hiện emoji.

---
# Các sửa lỗi trước đó (vẫn còn trong bản này)

- **Plan + Lịch đã gộp** (tab Plan có sub-tab Giáo án/Lịch tập, không còn tab Lịch riêng)
- **Đổi bài hết trùng** (xoá 10 bài lặp, 211→201 bài)
- **GIF**: 186/201 bài có hình (thêm 34), sửa 5 bài trỏ nhầm video, không còn ô đen khi lỗi mạng
- **Lỗi icon chữ "F" + nhảy Safari**: thêm manifest + apple-touch-icon + service worker vào index, tạo icon-180/512 còn thiếu, tự chuyển vào /app khi mở từ icon đã cài, viết lại hướng dẫn cài đúng
- **Logo** index đổi thành hình cơ bắp
- Tính kg/reps cập nhật ngay khi sửa; đổi bài chèn đúng vị trí
- PayOS + vercel.json đã sửa; service worker v7 tự xoá cache cũ

## Lưu ý
- Thumbnail tải từ GitHub (hơi chậm ở VN nhưng lazy-load nên không cản app). Nếu sau này muốn nhanh tuyệt đối, có thể tải sẵn ảnh vào repo — việc lớn hơn, để dịp khác.
- "Thông tin vào cơ": hệ thống đúng giải phẫu cho các bài chính. Nếu thấy bài CỤ THỂ nào sai, nhắn tên bài đó.

## Deploy
Upload toàn bộ thư mục lên GitHub (giữ nguyên api/). Sau khi deploy, mở app đợi service worker v7 cập nhật; gỡ icon cũ + cài lại để nhận icon cơ bắp mới.
