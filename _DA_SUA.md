# ✅ Cập nhật lần này

## 1. ⭐ SỬA LỖI QUAN TRỌNG: lịch tập không đánh dấu ngày đã tập (trên iPhone)
**Nguyên nhân:** code đọc ngày buổi tập kiểu `new Date("2026-6-22")` — iPhone/Safari coi đây là ngày KHÔNG hợp lệ (vì thiếu số 0, phải là "2026-06-22"). Nên dù bạn tập 3 ngày, lịch không bao giờ khớp được ngày → không hiện chấm xanh lá "đã tập".
**Đã sửa:** chuyển sang dùng hàm parseViDate an toàn cho iOS ở TẤT CẢ 4 chỗ (lịch tập, lịch tháng ở Tiến độ, thống kê tuần, lọc theo ngày). Giờ buổi tập xong sẽ hiện đúng màu lime "đã tập" trên lịch, kể cả trên iPhone.

## 2. Thêm bộ lọc ngang ở thư viện bài tập (như Hình 3)
Thêm 3 nút lọc mới vào thanh ngang: **Cẳng tay** (forearm), **Cardio**, **🏠 Tại nhà** (bài tập với trọng lượng cơ thể / calisthenic — 56 bài).
Thanh lọc cuộn ngang được nên thêm bao nhiêu nút cũng gọn.

## 3. Cardio (đã thêm ở bản trước, vẫn còn)
13 bài cardio: Running, Cycling, Elliptical, Sprint, Assault Bike, Jump Rope, Burpee, Box Jump, Battle Rope... đều có hình + tô đúng nhóm cơ.

## 4. Mượt trên điện thoại (bản trước)
- Chặn iOS tự zoom khi gõ (input ≥16px), bỏ spinner số, bỏ delay chạm.
- Thumbnail hình thật ở mọi nơi; đổi ảnh đại diện; đổi đơn vị lbs cho ô tạ; bỏ "thêm bài tùy chỉnh".

---
## ⚠️ Còn 1 việc cần bạn xác nhận
**"Hình nộm tô sai cơ"**: mình đã kiểm tra các bài cẳng tay đều ĐÚNG. Nếu vẫn thấy bài nào sai, nhắn CHÍNH XÁC tên bài đó (vd "Bench Press tô vào vai") để mình sửa đúng bài.

## Deploy
Upload toàn bộ thư mục lên GitHub (giữ api/). Sau deploy: mở app, vào Tập luyện hoàn thành 1 buổi → kiểm tra tab Plan > Lịch tập xem ngày đó có hiện chấm lime không. Gỡ icon cũ + cài lại để nhận icon cơ bắp.
