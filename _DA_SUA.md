# ✅ Cập nhật lần này

## 1. 🔧 SỬA cardio hiện "MỨC TẠ·LBS" (lỗi Image 1)
Bài cardio giờ cột hiện "THỜI GIAN (phút)" thay vì "MỨC TẠ·LBS / REPS". Khớp với ô nhập phút. Không còn khó hiểu.

## 2. 🔧 Tổng kg ở Progress = MỨC TẠ CAO NHẤT (tính lại từ lịch sử)
Số "TOTAL KG" cũ bị tính kiểu nhân (kg×reps) nên to vô lý. Giờ TÍNH LẠI từ toàn bộ lịch sử theo cách: cộng dồn mức tạ cao nhất mỗi bài.
Ví dụ: buổi 1 (Bench 100 + Squat 140) + buổi 2 (Deadlift 160) = 400kg. Áp dụng cho Progress, đồng bộ cloud, và bảng xếp hạng.

## 3. Hình nộm có MŨI TÊN chỉ nhóm cơ (như hình bạn gửi)
Hình cơ thể chi tiết (ngực 2 múi, bụng 6 múi, vai, tay, đùi, bắp chân) + đường kẻ + mũi tên chỉ ra từng nhóm:
- Bên trái: ↑Ngực, ↓Tay, ↑Chân
- Bên phải: Vai, ↓Bụng, Lưng
↑ = trội (xanh lá), ↓ = cần thêm (cam), • = đủ (xám). Nhìn phát hiểu ngay nhóm nào mạnh/yếu.

## 4. Thêm 54 món ăn & đồ uống
- Ức gà: luộc/áp chảo/nướng/xé/sốt cam/teriyaki/salad/cơm gạo lứt/wrap + đùi gà, cánh gà
- Trái cây: lê, kiwi, dâu, việt quất, cherry, lựu, mãng cầu, nho, đu đủ, thanh long, bưởi...
- Rau củ: bông cải xanh, súp lơ, cải bó xôi, ớt chuông, măng tây, đậu Hà Lan, bắp cải, cà rốt, nấm...
- Nước ngọt/đồ uống: Coca, Pepsi, Sprite, Fanta, 7Up, Mirinda, Number 1, Coca Zero, C2, trà xanh không độ, Gong Cha, nước ép, soda...
→ Tổng 421 món.

## Ghi chú
- Hình ColorMetric/InBody bạn gửi là của app khác (3D scan + máy đo chuyên dụng). Mình KHÔNG sao chép thiết kế của họ — mình làm hình nộm riêng kiểu sơ đồ có mũi tên cho app bạn.
- Phần AI nhận xét bằng chữ cần ANTHROPIC_API_KEY trên Vercel mới chạy. Chưa có thì app vẫn hiện hình nộm + phân tích cơ bản.

## Deploy
Upload toàn bộ thư mục lên GitHub. Sau deploy mở app đợi service worker cập nhật.
