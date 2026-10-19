# ExamPlatform — bàn giao thiết kế và triển khai

Ngày rà soát: 19/10/2026. Nguồn đối chiếu: mã frontend, routes API, controllers, resources, services và seeders trong repository. Tài liệu này không xác nhận dữ liệu hoặc dịch vụ đang chạy.

## Phạm vi và trạng thái

Yêu cầu thiết kế: tiếp tục từ dự án hiện tại, sử dụng các skill do người dùng cung cấp, xây dựng giao diện hiện đại, tối giản, tránh cảm giác dashboard tạo tự động. Giữ tên **ExamPlatform**. Phần điều hướng, trợ giúp và thông báo dùng tiếng Việt; tên tài liệu và nội dung học/đề IELTS giữ tiếng Anh.

Mục tiêu bàn giao là bộ màn hình desktop rộng 1440 px và mobile rộng 390 px, đủ rõ để chuyển thành component React và luồng hoạt động thực tế. Các số liệu trong mockup là **dữ liệu minh họa**, không phải số liệu lấy từ hệ thống đang chạy. Khi dùng nội dung seed, cần giữ đúng số lượng và quan hệ của seed; không trình bày số liệu minh họa như thành tích thật của người dùng.

Người dùng đã đăng nhập Figma web và mở file thiết kế. Bộ màn hình đang được dựng và kiểm tra qua trình duyệt trong [file Figma](https://www.figma.com/design/G1Qyagu7kovztnyGI3zZwU/). Không sử dụng Figma MCP trong phiên này. Xem design-brief.md để biết trạng thái kiểm tra cuối cùng.

Tài liệu này chỉ bổ sung hồ sơ thiết kế; không thay đổi ứng dụng, API hay database.

## Kiến trúc giao diện hiện tại

- `frontend/package.json`: React 19, React Router 8.4 ở framework mode, Tailwind CSS 4, GSAP và Lucide. Đây là hướng phát triển kế thừa Remix; không nên giả định repository đang dùng package `@remix-run/react`.
- `frontend/app/routes.ts`: hiện chỉ đăng ký một route `/` tới `routes/home.tsx`.
- `frontend/app/routes/home.tsx`: một component lớn quản lý bốn tab bằng state: `packages`, `quiz`, `analytics`, `inspector`. Đổi tab không tạo URL riêng.
- Luồng xem trước và kết quả hiện là modal. Phiên làm bài được giữ trong state nên mất sau reload.
- Giao diện hiện tự đăng nhập bằng tài khoản seed khi chuyển vai trò. Đây là cơ chế demo, chưa phải trải nghiệm đăng nhập hoàn chỉnh.
- `frontend/vite.config.ts`: frontend dùng cổng 3000, proxy `/api` tới Laravel ở `127.0.0.1:8080`.
- Backend có API quản trị đề và câu hỏi nhưng frontend hiện chưa có màn hình CRUD tương ứng.

## Hướng thiết kế

Nền sáng hơi ấm, chữ đậm dễ đọc, đường phân cách mảnh, một màu xanh trầm làm điểm nhấn. Bố cục ưu tiên tài liệu và đề thi, sử dụng bảng/danh sách khi cần so sánh. Khoảng trắng và phân cấp chữ tạo tính hiện đại; tránh glow, glassmorphism, gradient tím và việc đặt mọi thông tin trong nhiều lớp card.

- Desktop: khung nội dung có giới hạn chiều rộng, vùng đọc câu hỏi gọn; không kéo một câu hỏi thành dòng dài hết 1440 px.
- Mobile: một cột, điều hướng gọn, CTA rõ, thanh thời gian không che nội dung. Bộ chọn câu hỏi có thể thu gọn thành panel.
- Learner: điều hướng chính **Đề luyện tập** và **Tài liệu IELTS**.
- Admin: **Đề thi** và **Thống kê**. Luồng quản trị không xuất hiện trong menu học viên.
- Dùng “Đã lưu”, “Đang lưu”, “Thời gian còn lại”, “Nộp bài”, “Xem trước”; không đưa MongoDB, cache, signed URL hoặc API status vào hành trình học.
- Trạng thái phải có chữ hoặc biểu tượng kèm nhãn; màu sắc không phải tín hiệu duy nhất.

## Danh sách màn hình cần có

| Màn hình | Desktop 1440 | Mobile 390 | Nội dung và hành động chính |
| --- | --- | --- | --- |
| Thư viện tài liệu IELTS | Có | Có | Danh sách gói, mô tả, số học phần/tài liệu, mức giá nếu hiển thị, mở chi tiết |
| Chi tiết gói học | Có | Có | Tên, mô tả, danh sách học phần theo thứ tự, tài liệu PDF/audio, giới hạn xem trước |
| Danh sách đề luyện tập | Có | Có | Tìm kiếm, phân trang, tên đề, mô tả, thời lượng, số câu, ngưỡng đạt, bắt đầu |
| Làm bài | Có | Có | Câu hỏi trắc nghiệm một đáp án, số câu đã trả lời, bộ điều hướng câu hỏi, thời gian, trạng thái lưu, nộp bài |
| Kết quả | Có | Có | Điểm/tổng điểm, phần trăm, đạt/chưa đạt, xem lại câu sai, về danh sách đề |
| Thống kê quản trị theo đề | Có | Có | Chọn đề, số lượt hoàn thành, điểm trung bình/cao nhất/thấp nhất, bảng học viên, câu thường sai |
| Trạng thái xem trước | Có | Có | Thông tin tài liệu, số trang cho phép, thời hạn, hết hạn và thử lại; không giả định đã có trình phát thật |

Màn hình đăng nhập, quản lý đề, sửa đề và sửa câu hỏi là phần tiếp nối hợp lý vì API đã có. Chỉ đưa chúng vào bộ frame chính nếu đã thống nhất mở rộng phạm vi; ghi rõ các route tương ứng còn phải triển khai.

Các frame làm bài nên dùng bộ câu hỏi seed gồm **2 câu, mỗi câu 10 điểm** nếu được ghi là dữ liệu seed. Muốn minh họa đề dài hơn, phải gắn nhãn dữ liệu mẫu và không mô tả đó là bộ đề hiện có.

## Route frontend: hiện tại và đề xuất

Tất cả URL bên dưới ngoài `/` đều là đề xuất tổ chức frontend, chưa tồn tại trong `frontend/app/routes.ts`.

| Route đề xuất | Mục đích | Nguồn dữ liệu |
| --- | --- | --- |
| `/` | Điểm vào: danh sách đề hoặc điều hướng đến thư viện | Quyết định điều hướng khi triển khai |
| `/login` | Đăng nhập | `POST /api/login`, `GET /api/user` |
| `/packages` | Thư viện IELTS | `GET /api/packages` |
| `/packages/:packageId` | Chi tiết gói | `GET /api/packages/{id}` |
| `/exams` | Danh sách đề | `GET /api/exams` |
| `/attempts/:attemptId` | Làm bài hoặc tiếp tục phiên đã biết ID | `POST /api/exams/{id}/attempts`, `GET /api/attempts/{id}/resume` |
| `/attempts/:attemptId/result` | Kết quả phiên | `GET /api/attempts/{id}` |
| `/admin/exams` | Quản lý đề | `GET /api/admin/exams` và API CRUD |
| `/admin/exams/:examId/edit` | Sửa thông tin đề và câu hỏi | API exam/question tương ứng |
| `/admin/exams/:examId/statistics` | Thống kê của một đề | `GET /api/admin/exams/{id}/statistics` |

Xem trước có thể là dialog hoặc trang con sau này; không cần invent URL chứa đường dẫn lưu file hoặc token nội bộ.

## Đối chiếu API và trường dữ liệu

### Đăng nhập và phân quyền

| Endpoint thực tế | Quyền | UI và dữ liệu |
| --- | --- | --- |
| `POST /api/login` | Public | Gửi `email`, `password`; frontend hiện dùng `token` và `user.name` trong phản hồi |
| `POST /api/logout` | Đăng nhập | Đăng xuất và xóa trạng thái xác thực ở frontend |
| `GET /api/user` | Đăng nhập | Khôi phục danh tính; phân biệt `admin`/`student` từ người dùng thực tế |

Chưa có route đăng ký, quên mật khẩu, chỉnh hồ sơ hoặc đổi mật khẩu trong `routes/api.php`. Không vẽ các CTA đó như tính năng đã hoạt động.

### Tài liệu IELTS

| Endpoint thực tế | Trường | Cách dùng |
| --- | --- | --- |
| `GET /api/packages` | `data`, `total` | Danh sách gói đang hoạt động, đã tải `units.documents` |
| `GET /api/packages/{id}` | `data` | Chi tiết gói cùng học phần và tài liệu |
| Package | `id`, `title`, `description`, `price`, `is_active` | Tên, nội dung giới thiệu, giá; không có trường tiền tệ riêng |
| Unit | `id`, `package_id`, `title`, `description`, `order`, `documents` | Accordion/danh sách học phần, số lượng tài liệu tính từ `documents.length` |
| Document | `id`, `unit_id`, `title`, `type`, `total_pages`, `preview_pages` | `type` phân biệt PDF/audio; với audio không dùng nhãn “trang” như một thời lượng phát |
| `POST /api/documents/{id}/preview` | `document_id`, `title`, `type`, `total_pages`, `preview_pages`, `preview_url`, `expires_at` | Yêu cầu quyền xem trước trong 15 phút; giới hạn 10 request/phút |
| `GET /api/documents/{document}/stream` | `status`, `document`, `message` | Kiểm tra chữ ký URL và ghi log; hiện trả JSON metadata, không stream bytes PDF/audio |

Giá seed là `49.99`; UI cũ hiển thị `$`, nhưng database không mô hình hóa currency. Không tự đổi sang VND. Không có purchase, payment, enrollment hay quyền truy cập sau mua. CTA đúng với khả năng hiện có là **Xem tài liệu**/**Xem trước**.

### Đề thi và phiên làm bài

| Endpoint thực tế | Trường/đầu vào | Cách dùng |
| --- | --- | --- |
| `GET /api/exams` | Query `search`, `page`, `per_page`; phản hồi collection có `data`, thông tin phân trang và `cache_status` | Tìm theo tiêu đề, phân trang. Cache không cần xuất hiện trong UI học viên |
| Exam resource | `id`, `title`, `description`, `duration_minutes`, `passing_score`, `questions`, `questions_count` khi được load count | Số câu lấy từ trường count nếu có, nếu không từ `questions.length`; `passing_score` là phần trăm |
| Question | `id`, `question_text`, `type`, `points`, `options` | Câu hỏi và trọng số điểm |
| Option | `id`, `option_text` | Nhãn đáp án; không lấy thứ tự A/B/C/D làm ID vì câu hỏi và lựa chọn được xáo trộn |
| `POST /api/exams/{id}/attempts` | `attempt_id`, `id`, `exam_id`, `exam_title`, `duration_minutes`, `start_time`, `questions` | Tạo snapshot câu hỏi, bắt đầu đồng hồ; chỉ student |
| `POST` hoặc `PATCH /api/attempts/{id}/save` | Gửi `answers: [{question_id, option_id}]`; phản hồi `saved_at`, `answers` | Lưu lựa chọn, chỉ thông báo thành công khi API xác nhận |
| `GET /api/attempts/{id}/resume` | `status`, `remaining_seconds`, `questions`, `saved_answers`, `exam_title` | Tiếp tục phiên đã biết ID; phục hồi câu trả lời và thời gian server |
| `POST /api/attempts/{id}/submit` | Gửi `answers`; trả `score`, `total_points`, `percentage`, `is_passed`, `wrong_questions`, `correct_answers`, `status` | Nộp bài và chấm điểm |
| `GET /api/attempts/{id}` | Thông tin kết quả, `exam_id`, `start_time`, `end_time`, câu sai và đáp án đúng | Trang kết quả; chỉ chủ sở hữu xem được |

Kết quả trả ID đáp án đúng/sai, không cung cấp đầy đủ text của mọi option. Trang xem lại cần giữ hoặc khôi phục snapshot câu hỏi để ghép ID với nhãn. Không sáng tác lời giải chi tiết vì backend chưa có trường giải thích.

Không có API liệt kê lịch sử mọi phiên của học viên. Một liên kết **Tiếp tục làm bài** chỉ hoạt động khi frontend đã lưu được attempt ID hoặc có nguồn lấy ID thực tế. Không vẽ danh sách lịch sử và tiến độ tổng như chức năng đã có.

`StoreQuestionRequest` chấp nhận `multiple_choice`, nhưng frontend hiện chỉ gửi một `option_id` và service chấm theo đáp án đúng đầu tiên. Phạm vi sử dụng hiện tại nên là **trắc nghiệm một đáp án** cho tới khi hợp đồng dữ liệu và chấm điểm đa đáp án được hoàn thiện.

### Quản trị

| Endpoint thực tế | Nội dung |
| --- | --- |
| `GET/POST /api/admin/exams` | Danh sách và tạo đề |
| `GET/PUT/PATCH/DELETE /api/admin/exams/{exam}` | Đọc, sửa, xóa đề |
| `GET /api/admin/exams/{exam}/questions` | Danh sách câu hỏi thuộc đề |
| `POST /api/admin/questions` | Tạo câu hỏi |
| `GET/PUT/PATCH/DELETE /api/admin/questions/{question}` | Đọc, sửa, xóa câu hỏi |
| `GET /api/admin/exams/{id}/statistics` | Thống kê theo đề |
| `GET /api/admin/dashboard` | Hiện chỉ trả lời chào, không có metrics cho dashboard |

Ràng buộc form tạo đề: `title` bắt buộc, tối đa 255 ký tự; `description` tùy chọn, tối đa 5000; `duration_minutes` từ 1 đến 480; `passing_score` từ 0 đến 100. Tạo câu hỏi: đề bắt buộc, nội dung tối đa 5000 ký tự, điểm từ 1 đến 100 nếu truyền, tối thiểu hai option; mỗi option tối đa 1000 ký tự và có `is_correct`. Phải có ít nhất một option đúng; với UX single choice, chọn đúng một option.

| Trường thống kê | Cách trình bày |
| --- | --- |
| `exam_id`, `exam_title` | Bộ chọn đề và ngữ cảnh trang |
| `total_completed_attempts` | Lượt đã hoàn thành, không đồng nghĩa số học viên |
| `average_score`, `highest_score`, `lowest_score` | Điểm thô, không tự gắn `%` hoặc quy đổi IELTS band |
| `top_students` | Tên, điểm cao nhất, điểm trung bình, số lượt làm; tối đa 10 |
| `most_incorrect_questions` | Nội dung câu hỏi và `incorrect_count`; không tự quy đổi thành tỷ lệ thiếu mẫu số |

Chưa có trường trạng thái nháp/xuất bản, độ khó, kỹ năng, category, lịch mở đề hay ngày hết hạn. Không dùng các badge/filter đó như dữ liệu đã được backend hỗ trợ. Thống kê không có chuỗi thời gian, so sánh tuần/tháng hoặc tỷ lệ hoàn thành.

## Nội dung seed để dùng trong frame

| Thực thể | Nội dung có thật trong seeder |
| --- | --- |
| Gói học | `IELTS Comprehensive Band 8.0+ Prep`; giá `49.99` |
| Mô tả gói | `Master all 4 IELTS modules with authentic Cambridge practice tests, audio tracks, and strategies.` |
| Học phần 1 | `Unit 1: Academic & General Reading Mastery` |
| PDF 1 | `Academic Reading Official Handbook.pdf`; 36 trang, xem trước 5 |
| Học phần 2 | `Unit 2: Listening Section 1-4 Immersion` |
| Audio | `Listening Practice Test 1 - Audio Track.mp3`; không có thời lượng audio trong model |
| PDF 2 | `Listening Transcripts & Answer Keys.pdf`; 18 trang, xem trước 3 |
| Đề | `IELTS General Reading Test 1`; 60 phút; đạt từ 70%; 2 câu, 20 điểm |
| Câu 1 | `What is the primary objective of Section 1 in IELTS Reading?` |
| Câu 2 | `How many total sections are in the IELTS Reading exam?` |

Seed giới thiệu bao quát bốn kỹ năng, nhưng dữ liệu chi tiết hiện có chỉ gồm hai học phần nêu trên. Không tạo thêm Writing/Speaking như dữ liệu thật chỉ vì câu mô tả gói.

## Luồng được hỗ trợ và luồng cần bổ sung

**Có API và có thể thiết kế để triển khai:** đăng nhập; xem gói/học phần; yêu cầu quyền xem trước; tìm và phân trang đề; bắt đầu, lưu, tiếp tục phiên đã biết ID, nộp bài, xem kết quả; quản trị đề/câu hỏi; thống kê từng đề.

**Cần phần frontend bổ sung:** URL cho từng màn hình; auth state; menu theo vai trò; state loading/error/empty; dialog nộp bài; bảo toàn attempt ID; radio input accessible; khôi phục phiên sau reload; actual admin CRUD UI.

**Cần backend hoặc tích hợp bổ sung:** phát PDF/audio thực; mua gói và thanh toán; tiến độ học theo tài khoản; lịch sử làm bài tổng; phân tích kỹ năng/band; biểu đồ theo thời gian; profile và reset mật khẩu; multiple-choice grading; các trạng thái xuất bản đề.

**Điểm cần sửa trước một luồng thi dùng thực tế:** resource đáp án hiện trả `is_correct` qua danh sách đề chung; không được tuyên bố đáp án được bảo mật chỉ dựa vào UI. Hợp đồng student API cần loại bỏ thông tin này. Đây là ghi nhận từ mã nguồn, chưa có thay đổi backend trong công việc thiết kế.

## Trạng thái bắt buộc trong component và frame

| Vùng | Loading | Empty | Error / edge case |
| --- | --- | --- | --- |
| Đăng nhập | Nút đang xử lý, giữ nguyên chiều rộng | Chưa nhập dữ liệu | Sai thông tin, lỗi kết nối, phiên hết hạn; lỗi gắn với form |
| Danh sách gói/đề | Skeleton đúng cấu trúc, không hiển thị số 0 như dữ liệu đã tải | Không có gói/đề; tìm kiếm không có kết quả | CTA Thử lại; giữ query/filter khi thử lại |
| Chi tiết gói | Placeholder tiêu đề/học phần | Học phần chưa có tài liệu | Không tìm thấy gói hoặc không tải được nội dung |
| Bắt đầu đề | Nút Bắt đầu bị khóa trong lúc tạo attempt | Đề chưa có câu hỏi | Không có quyền, token hết hạn, API lỗi; không tạo nhiều phiên do double-click |
| Làm bài | Khôi phục phiên | Chưa trả lời câu nào | Đang lưu, đã lưu, chưa lưu được; câu trả lời chưa lưu không bị xóa |
| Nộp bài | Nút đang nộp, chống gửi trùng | Còn câu chưa trả lời: hiển thị số lượng trước khi xác nhận | API lỗi: giữ bài và cho thử lại; hết giờ: thể hiện kết quả server, không tự giả định chấm thành công |
| Kết quả | Đang lấy kết quả | Không có kết quả hoàn thành cho phiên | Phiên không tồn tại/không thuộc người dùng; không hiển thị đáp án khi chưa có result phù hợp |
| Preview | Đang xin quyền xem trước | Chưa có nội dung có thể phát | Link hết hạn, 403, vượt giới hạn 429, lỗi tải; có nút yêu cầu lại hợp lý |
| Thống kê | Skeleton metrics/bảng | Chưa có lượt hoàn thành; chưa có câu sai | Không có quyền, đề bị xóa, lỗi tải; giá trị 0 phải phân biệt với chưa tải |

Luồng submit phải có xác nhận ngắn: số câu đã trả lời/tổng số câu, số câu còn trống, nút quay lại và nút nộp. Không thêm nhiều lớp xác nhận. Thời gian phải tính từ trạng thái server khi khôi phục, không khởi động lại 60 phút sau mỗi reload.

## Yêu cầu responsive và accessibility

- Kiểm tra ở 1440 px và 390 px; thêm kiểm tra 320 px khi triển khai để phát hiện overflow. Nội dung và hành động chính không phụ thuộc hover.
- Cỡ chữ thân bài hướng tới 16 px; nhãn phụ đủ đọc trên điện thoại. Tránh dùng 10–11 px cho nội dung cần quyết định.
- Mục tiêu vùng chạm tối thiểu 44 × 44 px. Icon button có accessible name; không dùng biểu tượng đóng đơn độc mà thiếu nhãn.
- Contrast mục tiêu: chữ thường tối thiểu 4.5:1; thành phần tương tác, viền focus và dấu trạng thái quan trọng tối thiểu 3:1 với nền liên quan.
- Mọi control có trạng thái focus rõ. Thứ tự Tab theo thứ tự đọc; không có focus ẩn sau sticky header hoặc sticky footer.
- Câu hỏi dùng `fieldset` + `legend` và radio input có label. Chọn bằng bàn phím hoạt động chuẩn; trạng thái chọn không chỉ dựa vào màu nền.
- Accordion dùng button với `aria-expanded` và `aria-controls`. Panel bị đóng không giữ nội dung tương tác trong tab order.
- Dialog preview/xác nhận có tên, `aria-modal`, đặt và giữ focus phù hợp, Escape khi hành động cho phép, trả focus về nút mở khi đóng.
- Trạng thái lưu và lỗi dùng vùng thông báo phù hợp; không đọc lại countdown mỗi giây qua screen reader. Chỉ thông báo các mốc thời gian cần thiết.
- Loading không dùng chuyển động bắt buộc. Tôn trọng `prefers-reduced-motion`; bỏ animation dịch chuyển/GSAP không cần thiết khi người dùng yêu cầu giảm chuyển động.
- Bảng admin giữ header semantic và caption/ngữ cảnh. Trên mobile có thể chuyển thành các hàng xếp chồng; nếu scroll ngang, phải có dấu hiệu rõ và không làm cả trang overflow.
- Tiêu đề trang theo cấp heading hợp lý. Shell dùng ngôn ngữ Việt; nội dung học bằng Anh có thể đánh dấu `lang="en"` khi cần.
- Error form có text giải thích và liên kết tới field; không chỉ viền đỏ. Dữ liệu đã nhập vẫn còn sau request thất bại.

## Component nên tách khi triển khai

`AppShell`, `StudentNavigation`, `AdminNavigation`, `PageHeading`, `ExamListItem`, `PackageSummary`, `UnitAccordion`, `DocumentRow`, `AttemptHeader`, `QuestionFieldset`, `QuestionNavigator`, `AutosaveStatus`, `SubmitDialog`, `ResultSummary`, `AnswerReview`, `StatisticsSummary`, `DataTable`, `EmptyState`, `InlineError`, `LoadingSkeleton`.

Component cần quy định rõ default, hover, focus, disabled, loading, selected và error nếu có. Giữ token màu, spacing, typography và radius dùng chung giữa desktop/mobile. Giới hạn biến thể theo nhu cầu thực của các màn hình, không tạo design system lớn hơn sản phẩm.

## Ghi nhận triển khai cần chú ý

- Frontend hiện fetch danh sách đề trước khi auto-login trả token và không tự fetch lại khi token đổi; màn hình đầu tiên có thể rỗng dù có đề.
- Bộ đếm thời gian hiện có nguy cơ giữ closure của câu trả lời cũ khi tự nộp. Khi triển khai lại phải nộp tập câu trả lời mới nhất và xử lý phản hồi server.
- API lỗi hiện phần lớn chỉ ghi console; thiết kế cần được triển khai thành thông báo nhìn thấy và thao tác khôi phục.
- Dropdown thống kê hiện hardcode đề; cần lấy danh sách đề thực từ API.
- UI hiện hiển thị menu không đúng vai trò rồi để API từ chối. Menu và hành động phải dựa trên vai trò đã xác thực.
- Preview URL hiện được lưu nhưng không dùng để hiển thị nội dung thật. Không biến mockup player thành cam kết tính năng đã hoàn thành.

## Tệp nguồn đối chiếu

- `frontend/app/routes.ts`
- `frontend/app/routes/home.tsx`
- `frontend/app/app.css`
- `frontend/app/root.tsx`
- `frontend/package.json`
- `frontend/vite.config.ts`
- `routes/api.php`
- `app/Http/Controllers/PackageController.php`
- `app/Http/Controllers/DocumentController.php`
- `app/Http/Controllers/Student/AttemptController.php`
- `app/Http/Controllers/Admin/ExamController.php`
- `app/Http/Requests/StoreExamRequest.php`
- `app/Http/Requests/StoreQuestionRequest.php`
- `app/Http/Resources/ExamResource.php`
- `app/Http/Resources/QuestionResource.php`
- `app/Http/Resources/OptionResource.php`
- `app/Services/ExamService.php`
- `app/Services/AnalyticsService.php`
- `database/seeders/DatabaseSeeder.php`
- `database/seeders/IeltsPackageSeeder.php`
