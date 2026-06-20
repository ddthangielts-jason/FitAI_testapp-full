# ✅ Cập nhật lần này

## 1. Thêm bài tập CARDIO mới (đã thiếu)
Thêm 5 bài cardio: Running (Chạy bộ), Cycling (Đạp xe), Elliptical, Sprint (Chạy nước rút), Assault Bike — đều có hình + tô đúng nhóm cơ trên hình nộm (chân/mông/tim mạch).
(Box Jump và Battle Rope đã có sẵn nên không thêm trùng.)
→ Giờ có 13 bài cardio. Tất cả 206 bài đều có hình.

## 2. ⭐ Sửa lỗi iOS tự phóng to khi gõ số/chữ
Trước: ô nhập chữ (tên, tìm kiếm...) cỡ 14px → iPhone TỰ ZOOM mỗi lần chạm vào ô, rất khó chịu.
Đã sửa: tất cả ô nhập tối thiểu 16px → không còn bị zoom giật. Bỏ luôn mũi tên spinner ở ô số và độ trễ 300ms khi chạm nút → app phản hồi nhanh, mượt hơn rõ rệt.

## 3. Lịch tập trên điện thoại
Đã thêm CSS chống lỗi co chiều cao (nested flex) cho khu vực Lịch tập — đảm bảo vùng lịch + chi tiết luôn có chiều cao và cuộn được trên điện thoại.
> LƯU Ý: mình chưa tái hiện được chính xác lỗi bạn gặp. Nếu sau khi deploy vẫn lỗi, gửi mình ẢNH CHỤP màn Lịch tập bị lỗi (trống? bị cắt? không cuộn được? đè lên nhau?) để mình sửa đúng chỗ.

## 4. Các bản trước (vẫn còn)
- Thumbnail hình thật ở mọi nơi (thư viện, đổi bài, tìm bài, tạo plan, thẻ bài khi tập)
- Đổi ảnh đại diện ở mục Cá nhân (đã sửa, chọn ảnh từ máy là hiện)
- Đổi đơn vị lbs: ô tạ trong bài tập cũng đổi theo (lưu ngầm bằng kg để không sai lịch sử)
- Bỏ "Thêm bài tập không có trong thư viện"
- Plan + Lịch đã gộp; đổi bài hết trùng; icon "F"+Safari đã sửa; logo cơ bắp

---
## ⚠️ Cần bạn cho thêm thông tin
**"Hình nộm chỉ vào bắp tay không đúng"**: mình đã kiểm tra các bài forearm (Wrist Curl→cẳng tay, Hammer Curl→tay trước+cẳng tay) — đều ĐÚNG giải phẫu, và mình render thử thấy vùng cẳng tay tô đúng. Nên mình cần bạn cho biết CHÍNH XÁC tên bài nào tô sai cơ, mình sẽ sửa đúng bài đó (sửa mò dễ làm hỏng bài đang đúng).

## Deploy
Upload toàn bộ thư mục lên GitHub (giữ api/). Sau deploy: mở app đợi service worker cập nhật; gỡ icon cũ + cài lại để nhận icon cơ bắp.
