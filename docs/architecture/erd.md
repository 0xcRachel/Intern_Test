# ExamPlatform — ERD

Sơ đồ dưới đây phản ánh schema hiện tại trong các migration Laravel. Các bảng
nghiệp vụ dùng MySQL; `attempts`, `activity_logs` và `preview_logs` được model
chạy trên MongoDB khi `MONGODB_ENABLED=true` (khi tắt Mongo, chúng fallback về
connection mặc định để test).

```mermaid
erDiagram
    USERS ||--o{ ATTEMPTS : starts
    EXAMS ||--o{ QUESTIONS : contains
    QUESTIONS ||--o{ OPTIONS : offers
    EXAMS ||--o{ ATTEMPTS : receives
    USERS o|--o{ ACTIVITY_LOGS : creates

    PACKAGES ||--o{ UNITS : groups
    UNITS ||--o{ DOCUMENTS : contains
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : includes
    PACKAGES o|--o{ ORDER_ITEMS : sold_as
    USERS ||--o{ ENROLLMENTS : owns
    PACKAGES ||--o{ ENROLLMENTS : has
    ORDERS o|--o{ ENROLLMENTS : creates
    USERS o|--o{ PREVIEW_LOGS : views
    DOCUMENTS ||--o{ PREVIEW_LOGS : tracked_in

    USERS {
        bigint id PK
        string name
        string email UK
        enum role
        string avatar
        string provider
        string provider_id
        decimal target_band
        text bio
        timestamp created_at
    }
    EXAMS {
        bigint id PK
        string title
        text description
        int duration_minutes
        int passing_score
    }
    QUESTIONS {
        bigint id PK
        bigint exam_id FK
        text question_text
        enum type
        int points
    }
    OPTIONS {
        bigint id PK
        bigint question_id FK
        text option_text
        boolean is_correct
    }
    PACKAGES {
        bigint id PK
        string title
        string slug UK
        string level
        decimal price
        int duration_hours
        decimal rating
        int students_count
        boolean is_active
    }
    UNITS {
        bigint id PK
        bigint package_id FK
        string title
        int order
    }
    DOCUMENTS {
        bigint id PK
        bigint unit_id FK
        string title
        enum type
        string file_path
        int total_pages
        int preview_pages
        json preview_content
    }
    ORDERS {
        bigint id PK
        bigint user_id FK
        string code UK
        string status
        decimal subtotal
        decimal discount
        decimal total
        string coupon_code
        timestamp paid_at
    }
    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint package_id FK
        string package_title
        decimal price
        int quantity
    }
    ENROLLMENTS {
        bigint id PK
        bigint user_id FK
        bigint package_id FK
        bigint order_id FK
        timestamp enrolled_at
    }
    COUPONS {
        bigint id PK
        string code UK
        string type
        decimal value
        boolean is_active
        timestamp expires_at
        int usage_limit
        int used_count
    }
    ATTEMPTS {
        string _id PK "MongoDB"
        int user_id FK
        int exam_id FK
        json questions
        json answers
        json submitted_answers
        string status
        datetime start_time
        datetime submitted_at
    }
    ACTIVITY_LOGS {
        string _id PK "MongoDB"
        int user_id FK
        string action
        text description
        json metadata
        string ip_address
        datetime created_at
    }
    PREVIEW_LOGS {
        string _id PK "MongoDB"
        int user_id FK
        int document_id FK
        string ip_address
        datetime expires_at
        datetime accessed_at
    }
```

`COUPONS` không có khóa ngoại trực tiếp: `orders.coupon_code` lưu snapshot mã
được áp dụng tại thời điểm checkout. `ATTEMPTS` và `PREVIEW_LOGS` giữ ID của
thực thể MySQL để liên kết chéo giữa hai database; các liên kết này được kiểm
tra ở tầng service/controller thay vì bằng foreign key vật lý.

