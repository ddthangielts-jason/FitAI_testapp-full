# ✅ Cập nhật lần này

## 1. 🔧 Lỗi xác nhận email (localhost refused) — SỬA Ở SUPABASE
Lỗi này KHÔNG phải lỗi app, mà do cấu hình Supabase chuyển hướng về localhost. Sửa:
→ Supabase → Authentication → URL Configuration → "Site URL" đổi thành URL app thật của bạn (vd https://fit-ai-testapp-full.vercel.app). Thêm URL đó vào "Redirect URLs". Save.

## 2. Tổng kg mỗi buổi = cộng MỨC TẠ CAO NHẤT (dễ hiểu)
Trước: nhân kg × reps → số to khó hiểu. Giờ: cộng mức tạ cao nhất của mỗi bài.
Ví dụ: Bench cao nhất 100kg + Squat cao nhất 140kg = 240kg. Áp dụng cho cả màn tập, badge từng bài, và AI phân tích.

## 3. Cardio tính theo PHÚT (không phải reps)
Bài cardio (treadmill, đạp xe, chạy bộ...) giờ nhập THỜI GIAN (phút) thay vì kg×reps. Phù hợp tập cardio sau buổi tạ.

## 4. Hình nộm AI đẹp & cơ bắp hơn nhiều
Thay hình nộm cũ (khối vuông) bằng hình cơ thể chi tiết: ngực 2 múi, bụng 6 múi, vai/delt, tay, đùi + bắp chân rõ ràng. Nhóm trội tô xanh lá, nhóm yếu tô cam — nhìn phát biết ngay nhóm nào mạnh/yếu. Đặt làm tâm điểm + 2 ô tóm tắt Trội/Cần thêm.

## 5. Thêm nhiều món: ức gà + trái cây + rau (36 món)
- Ức gà: luộc, áp chảo, nướng, xé, sốt cam, sốt teriyaki, salad ức gà, cơm gạo lứt ức gà, wrap ức gà... (đồ high-protein)
- Trái cây: lê, kiwi, dâu, việt quất, cherry, lựu, mãng cầu, nho, đu đủ, thanh long, bưởi...
- Rau củ: bông cải xanh, súp lơ, cải bó xôi, ớt chuông, măng tây, đậu Hà Lan, bắp cải, cà rốt, dưa leo, cà chua, nấm, xà lách...
→ Tổng 403 món.

## Deploy
Upload toàn bộ thư mục lên GitHub. Sau deploy mở app đợi service worker cập nhật.
