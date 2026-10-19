# Tài liệu dự án — ExamPlatform

Cập nhật: 19/10/2026. Đây là điểm vào cho hồ sơ thiết kế, ERD và các ghi chú
triển khai. Hướng dẫn chạy ứng dụng đầy đủ nằm ở [`../README.md`](../README.md).

## Trạng thái xác minh

- Docker Compose chạy 4 container (`exam_nginx`, `exam_php`, `exam_mysql`,
  `exam_mongo`); ứng dụng trả HTTP 200 tại `http://localhost:8080`.
- MySQL 8.0.46 và MongoDB 7.0.45 kết nối thành công; migration và seed chạy
  trong entrypoint PHP.
- Bộ test: **56 passed (263 assertions)** trên SQLite in-memory. Test đặt
  `MONGO_ENABLED=false`, không ghi dữ liệu vào MongoDB.
- MongoDB có index cho `attempts`, `activity_logs`, `preview_logs`
  (`php artisan app:ensure-mongo-indexes`).
- ERD: 18 bảng ứng dụng (10 thực thể nghiệp vụ + 8 bảng hạ tầng), không tính
  bảng `migrations` của Laravel.
- Preview tài liệu: tạo URL yêu cầu đăng nhập; signed URL 15 phút mang theo
  `user`; stream kiểm tra chữ ký và ghi `preview_logs`.
- Figma: chỉ còn link tham chiếu. Nội dung frame chưa được xác minh trong
  repository này; các màn hình trong hồ sơ là đề xuất đã đối chiếu API.
- Frontend: `npm run typecheck` và `npm run build` đã pass trên Node 22.12.0;
  React Router 8 vẫn in cảnh báo khuyến nghị Node `>=22.22.0`.

## Cấu trúc tài liệu

| Tệp | Nội dung |
|---|---|
| [`../README.md`](../README.md) | Quick start, tài khoản demo, cổng, quyết định kỹ thuật, API overview và các phần chưa hoàn thiện |
| [`../postman_collection.json`](../postman_collection.json) | Postman collection cho toàn bộ API, gồm cache, đăng ký, preview có xác thực và signed stream URL |
| [`database/README.md`](database/README.md) | ERD, từ điển cột SQL, collection MongoDB và danh sách index |
| [`database/generate_erd.py`](database/generate_erd.py) | Script stdlib tái tạo SVG, drawio và README ERD từ migrations |
| [`design/design-brief.md`](design/design-brief.md) | Brief thị giác, token, phạm vi màn hình và giới hạn dữ liệu |
| [`design/implementation-handoff.md`](design/implementation-handoff.md) | Đối chiếu route/API với màn hình, trạng thái UI và các điểm đã sửa |
| [`design/skill-audit.md`](design/skill-audit.md) | Audit việc dùng skill thiết kế, không xác nhận file Figma |
| [`design/design-tokens.json`](design/design-tokens.json) | Token màu, typography, spacing và radius |

## Tái tạo ERD

```powershell
python docs/database/generate_erd.py
```

Script tạo lại `erd-domain.svg`, `erd-infrastructure.svg`,
`testintern-erd.drawio` và `database/README.md`. Script giữ nguyên 18 bảng đã
khai báo trong migrations và sẽ báo lỗi nếu số bảng thay đổi mà chưa cập nhật
tài liệu.

## Kiểm tra nhanh

```powershell
docker compose up -d --build
docker compose exec php php artisan app:check-connections
docker compose exec php php artisan app:ensure-mongo-indexes
docker compose exec php php artisan test
```

## Ghi chú dữ liệu

- Tài khoản seed: `admin@example.com` / `student@example.com`, mật khẩu
  `password123`.
- Gói seed có 2 unit và 3 tài liệu. Các tệp PDF/MP3 là placeholder thật trong
  `storage/app/private/documents/` để đường dẫn seed không còn `null`.
- Điểm và thống kê trong tài liệu thiết kế là fixture minh họa, không phải dữ
  liệu tài khoản thật.
