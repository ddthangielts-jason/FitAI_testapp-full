# ✅ Sửa lỗi: dinh dưỡng không reset qua ngày mới

## Lỗi
Qua ngày mới mà phần dinh dưỡng vẫn còn món ăn hôm qua.

## Nguyên nhân (2 lỗi)
1. Hàm save() luôn ghi ngày = HÔM NAY mỗi lần lưu (20 giây/lần). Nếu app mở qua nửa đêm, ngày lưu thành hôm nay nhưng món ăn vẫn là hôm qua → lần mở sau không nhận ra đã sang ngày mới → không reset.
2. App dạng PWA không tự reload qua nửa đêm, nên đoạn reset (chỉ chạy lúc mở app) không kích hoạt nếu bạn để app chạy nền.

## Đã sửa
- save() giờ ghi ĐÚNG ngày hoạt động cuối (không phải luôn hôm nay).
- Thêm hàm checkDailyReset() chạy:
  • Mỗi khi bạn mở lại app (quay về từ nền)
  • Mỗi 60 giây khi app đang mở
  → Tự phát hiện sang ngày mới → LƯU món hôm qua vào Lịch sử dinh dưỡng → xoá món + reset nước cho ngày mới → cập nhật màn hình ngay.
- Món ăn hôm qua KHÔNG mất — được lưu vào "📅 Lịch sử" trong tab Dinh dưỡng.

Đã test: log món hôm qua → sang ngày mới → món tự xoá, lưu vào lịch sử đúng ngày, nước reset về 0.

## Deploy
Upload toàn bộ thư mục lên GitHub (giữ api/). Sau deploy mở app đợi service worker cập nhật.
Lưu ý: lần đầu sau khi deploy, nếu đang còn món hôm qua, mở app sẽ tự dọn sang ngày mới.
