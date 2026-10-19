# ExamPlatform — Figma design brief

Ngày: 19/10/2026. Trạng thái: đề xuất thiết kế đã đối chiếu API; nội dung frame Figma chưa được xác minh từ repository này.

File tham chiếu (chưa xác minh): https://www.figma.com/design/G1Qyagu7kovztnyGI3zZwU/

## Mục tiêu

Thiết kế giao diện hiện đại, tối giản cho dự án hiện có. Người học tìm học liệu IELTS, chọn đề, làm bài có giới hạn thời gian và đọc kết quả. Quản trị viên xem thống kê theo từng đề. Đây là bản thiết kế giao diện có thể chỉnh sửa, chưa phải triển khai vào ứng dụng.

Frontend thực tế: React 19, React Router 8 framework mode (cùng dòng phát triển Remix), Tailwind 4. Giữ thương hiệu ExamPlatform và các chức năng có trong mã nguồn. UI điều hướng tiếng Việt; câu hỏi và tên học liệu giữ tiếng Anh.

## Hướng thị giác

Không gian học tập sáng, gọn, dễ đọc. Phân cấp bằng typography, căn chỉnh, khoảng trắng và đường phân cách. Top navigation cho người học. Dùng danh sách/bảng khi phù hợp. Màu nhấn xanh xám chỉ dùng cho trạng thái hoặc hành động cần chú ý. Không dùng gradient tím, glow, glassmorphism, bóng đậm, quá nhiều badge hay những thẻ chỉ số trang trí.

| Token | Giá trị |
|---|---|
| Canvas | #FAFAF7 |
| Surface | #FFFFFF |
| Text primary | #20251F |
| Text secondary | #62685F |
| Border | #E1E5DC |
| Accent | #3D6254 |
| Accent subtle | #EDF2EC |
| Primary button | #20251F / #FFFFFF |
| Font | Geist, 400 / 500 / 600 |
| Type | 40/48, 24/32, 16/24, 14/20 |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64 |
| Radius | Controls 6px; grouped panels 8px |
| Desktop | 1440 × 1024; content ≤1216px; nav 76px |
| Mobile | 390 × 844; gutter 20px; touch targets ≥44px |
| Motion | Feedback 120–180ms; reduced motion static |

## Màn hình

1. Tài liệu IELTS: gói học thật, số bài/tài liệu và giá tham khảo; CTA xem nội dung.
2. Nội dung gói học: 2 units và 3 tài liệu; trạng thái xem trước không khả dụng/cần thử lại.
3. Đề luyện tập: tìm kiếm, đề mẫu, thời lượng, số câu và ngưỡng đạt; CTA bắt đầu.
4. Làm bài desktop: câu hỏi single choice, bộ đếm thời gian, trạng thái lưu, điều hướng câu hỏi, nộp bài.
5. Kết quả: điểm, phần trăm, đạt/chưa đạt, xem lại câu trả lời.
6. Thống kê quản trị: theo từng đề; số lượt nộp, điểm trung bình/cao/thấp, bảng học viên, số lần sai theo câu.
7. Làm bài mobile: cùng nội dung, bố cục một cột, nút chạm đủ lớn.
8. Component và trạng thái: token, typography, button, radio, input, loading, empty, error, xác nhận nộp, preview hết hạn.

## Dữ liệu và giới hạn

- Tên gói: IELTS Comprehensive Band 8.0+ Prep; giá 49.99 theo seed (UI hiện tại hiển thị USD; schema không có currency).
- Hai units: Academic & General Reading Mastery; Listening Section 1-4 Immersion.
- Ba documents: Reading Handbook 36 trang, xem trước 5; audio; Transcripts 18 trang, xem trước 3.
- Đề: IELTS General Reading Test 1; 60 phút; ngưỡng đạt 70%; 2 câu, mỗi câu 10 điểm.
- Câu 1: mục tiêu Section 1, đáp án Social survival situations. Câu 2: số sections, đáp án 3.
- Ví dụ kết quả 10/20, 50%, 1/2 câu đúng là dữ liệu minh họa, không phải dữ liệu tài khoản.
- Ví dụ thống kê 4 lượt có điểm 20,20,10,0: trung bình 12.5, cao nhất 20, thấp nhất 0; câu 1 sai 1 lần, câu 2 sai 2 lần. Đây là fixture minh họa.
- Không thêm mua gói/thanh toán, enrollment, lịch sử toàn bộ, streak, progress, thông báo, band quy đổi, difficulty hoặc draft/published status.
- Preview backend trả metadata JSON, chưa stream PDF/audio. Endpoint tạo preview yêu cầu đăng nhập; signed URL 15 phút gắn với user và được kiểm tra lại khi stream. Giao diện viewer đầy đủ là hạng mục cần backend bổ sung; không mô tả là đã hoạt động.
- Các phép kiểm định với người dùng thật chưa được thực hiện. Rà soát hiện tại là đối chiếu mã nguồn, kiểm tra thị giác và heuristic.

## Quy trình Figma (đề xuất, chưa xác minh)

Nếu tiếp tục dựng frame, dùng brief này với công cụ tạo design của Figma, sau đó kiểm tra canvas/layers và chỉnh sửa các sai lệch. Trong phạm vi repository này không có ảnh chụp, export hoặc bằng chứng kiểm tra frame; không tuyên bố các màn hình đã hoàn tất trên Figma. Không thay đổi quyền chia sẻ và không sửa giao diện production trong bước này.
