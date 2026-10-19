# Database ERD — TestIntern

Sơ đồ được dựng từ mã nguồn ngày 19/10/2026; chưa đối chiếu schema của database đang chạy.
Mở `testintern-erd.drawio` tại https://app.diagrams.net bằng File → Open From → Device. Có hai trang: nghiệp vụ và hạ tầng.
SVG là bản xem nhanh; file drawio cho phép sửa từng bảng và đường nối.

## Cách đọc và các điểm cần chú ý

- 18 bảng được khai báo trong migrations; bảng quản lý `migrations` do Laravel tạo không nằm trong 18 bảng này.
- 10 thực thể nghiệp vụ, bao gồm users; trang hạ tầng có 8 bảng khác và lặp lại users để thể hiện liên kết.
- `attempts`, `activity_logs`, `preview_logs` dùng MongoDB khi PHP nạp extension mongodb. Nếu không có extension, model dùng database mặc định. Không tự fallback khi MongoDB mất kết nối.
- Các cột và dấu nullable thể hiện schema SQL. MongoDB không có migration validator trong những file đã đọc; các trường tương ứng được suy ra từ fillable, casts và các lệnh ghi của ứng dụng.
- SQL có 6 FK cascade: questions.exam_id, options.question_id, units.package_id, documents.unit_id, attempts.user_id và attempts.exam_id. Hai FK của attempts chỉ có tác dụng ở nhánh SQL.
- activity_logs.user_id, preview_logs.user_id, preview_logs.document_id và sessions.user_id là tham chiếu logic, không được migration ràng buộc FK. Log có thể tồn tại sau khi đối tượng nguồn bị xóa.
- personal_access_tokens dùng quan hệ polymorphic (tokenable_type, tokenable_id). User sử dụng HasApiTokens; migration không giới hạn tokenable chỉ là User.
- password_reset_tokens.email là PK, không có FK đến users.email.
- attempts.questions lưu snapshot câu hỏi và options; submitted_answers, answers, wrong_questions là JSON/array nhúng, không phải bảng trung gian.
- activity_logs.metadata/properties có thể chứa exam_id và attempt_id tùy sự kiện; không phải FK hay cột độc lập.
- Chưa có quan hệ giữa packages và exams, cũng chưa thấy bảng mua gói/enrollment trong migrations hiện tại.
- Cardinality trên đường tham chiếu logic thể hiện ý định của ứng dụng, không bảo đảm toàn vẹn bằng database.

## Từ điển cột (SQL migration)

### users

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| name | varchar |  |
| email | varchar | UQ |
| role | enum |  |
| email_verified_at | timestamp | ? |
| password | varchar |  |
| remember_token | varchar(100) | ? |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### password_reset_tokens

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| email | varchar | PK |
| token | varchar |  |
| created_at | timestamp | ? |

### sessions

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | varchar | PK |
| user_id | bigint | REF  ? |
| ip_address | varchar | ? |
| user_agent | text | ? |
| payload | longText |  |
| last_activity | int |  |

### cache

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| key | varchar | PK |
| value | mediumText |  |
| expiration | bigint |  |

### cache_locks

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| key | varchar | PK |
| owner | varchar |  |
| expiration | bigint |  |

### jobs

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| queue | varchar |  |
| payload | longText |  |
| attempts | ushort |  |
| reserved_at | uint | ? |
| available_at | uint |  |
| created_at | uint |  |

### job_batches

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | varchar | PK |
| name | varchar |  |
| total_jobs | int |  |
| pending_jobs | int |  |
| failed_jobs | int |  |
| failed_job_ids | longText |  |
| options | mediumText | ? |
| cancelled_at | int | ? |
| created_at | int |  |
| finished_at | int | ? |

### failed_jobs

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| uuid | varchar | UQ |
| connection | varchar |  |
| queue | varchar |  |
| payload | longText |  |
| exception | longText |  |
| failed_at | timestamp |  |

### exams

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| title | varchar |  |
| description | text | ? |
| duration_minutes | int |  |
| passing_score | int |  |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### questions

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| exam_id | bigint | FK |
| question_text | text |  |
| type | enum |  |
| points | int |  |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### options

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| question_id | bigint | FK |
| option_text | text |  |
| is_correct | boolean |  |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### attempts

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| user_id | bigint | FK |
| exam_id | bigint | FK |
| questions | json | ? |
| submitted_answers | json | ? |
| answers | json | ? |
| wrong_questions | json | ? |
| score | float |  |
| total_points | float |  |
| percentage | float |  |
| is_passed | boolean |  |
| status | varchar |  |
| start_time | timestamp | ? |
| end_time | timestamp | ? |
| started_at | timestamp | ? |
| submitted_at | timestamp | ? |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### activity_logs

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| user_id | bigint | REF  ? |
| user_name | varchar | ? |
| action | varchar |  |
| description | text | ? |
| metadata | json | ? |
| properties | json | ? |
| ip_address | varchar | ? |
| user_agent | varchar | ? |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### packages

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| title | varchar |  |
| description | text | ? |
| price | decimal(10,2) |  |
| is_active | boolean |  |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### units

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| package_id | bigint | FK |
| title | varchar |  |
| description | text | ? |
| order | int |  |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### documents

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| unit_id | bigint | FK |
| title | varchar |  |
| type | enum |  |
| file_path | varchar | ? |
| total_pages | int |  |
| preview_pages | int |  |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### preview_logs

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| user_id | bigint | REF  ? |
| document_id | bigint | REF |
| ip_address | varchar | ? |
| user_agent | varchar | ? |
| expires_at | timestamp | ? |
| accessed_at | timestamp | ? |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

### personal_access_tokens

| Cột | Kiểu Laravel / SQL | Khóa / nullable |
|---|---|---|
| id | bigint | PK |
| tokenable_type | varchar | IDX |
| tokenable_id | bigint | REF IDX |
| name | text |  |
| token | varchar | UQ |
| abilities | text | ? |
| last_used_at | timestamp | ? |
| expires_at | timestamp | ? |
| created_at | timestamp | ? |
| updated_at | timestamp | ? |

## Nguồn kiểm tra

- database/migrations/*.php
- app/Models/*.php
- config/database.php
- app/Services/ExamService.php
- app/Http/Controllers/DocumentController.php
- app/Listeners/LogAttemptActivity.php
- app/Listeners/LogExamActivity.php
