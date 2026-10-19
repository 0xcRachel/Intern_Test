# Rà soát skill cho thiết kế ExamPlatform

Ngày: 19/10/2026. Phạm vi: thiết kế UI/UX cho nền tảng luyện thi IELTS đang dùng React/Remix; chuẩn bị màn hình có thể đưa sang Figma. Tài liệu này không xác nhận đã tạo file trong Figma.

Đã rà soát catalog gồm **136 skill** tại `D:\skills\.agents\skills`. Các skill áp dụng trực tiếp đã được đọc; các skill còn lại được phân loại theo tên, mô tả và phạm vi. Yêu cầu của người dùng — hiện đại, tối giản, tránh cảm giác khuôn mẫu do AI tạo — là nguyên tắc ưu tiên khi các skill xung đột. Không thể trộn đồng thời mọi phong cách: một số skill yêu cầu brutalism, cinematic motion hoặc ảnh marketing, trong khi sản phẩm này cần sự tập trung và rõ ràng.

## Hướng thiết kế đã chọn

- Nội dung và thao tác thực của ExamPlatform quyết định bố cục: gói học, unit, tài liệu PDF/audio, bài thi, làm bài có thời gian, tự lưu, nộp bài và kết quả.
- Nền trắng/off-white, chữ charcoal, một màu sage dịu cho thao tác hoặc thông tin cần nhấn; đường phân tách mảnh và khoảng trắng tạo cấu trúc.
- Typography rõ, cân bằng, hỗ trợ đầy đủ tiếng Việt. Geist là lựa chọn trong đặc tả; Segoe UI là fallback tiện dụng cho bản xem thử cục bộ.
- Ưu tiên danh sách, bảng và khu vực làm bài. Chỉ dùng card khi nó thực sự nhóm một đối tượng; tránh card lồng card, marketing hero, ảnh trang trí và badge vô nghĩa.
- Trạng thái loading, empty, error, selected, disabled và focus cần có trong component/handoff. Nội dung mẫu phải được ghi rõ là minh họa.

## Cách áp dụng chart-designer

Chỉ đưa biểu đồ vào màn quản trị khi có một câu hỏi rõ ràng. Với API hiện tại, dùng bar chart so sánh số lượt sai theo câu hỏi; không có dữ liệu chuỗi thời gian nên không thêm line chart. Bar chart bắt đầu từ 0; trục có đơn vị; nhãn và giá trị dùng độ chính xác hợp lý. Màu sage làm điểm nhấn, neutral dành cho phần so sánh. Giảm gridline và trang trí, cung cấp giá trị cụ thể, không dùng chỉ màu để diễn đạt trạng thái. Không tự tạo số liệu thật; dữ liệu demo phải được đánh dấu.

Nguồn: [chart-designer/SKILL.md](D:/skills/.agents/skills/chart-designer/SKILL.md).

## Cách áp dụng motion-design

Ưu tiên phản hồi chức năng: hover/focus khoảng 100–150 ms, nhấn hoặc đổi trạng thái khoảng 120–180 ms, mở/đóng panel hoặc dialog khoảng 240–320 ms nếu cần. Dùng easing nhất quán `cubic-bezier(0.2, 0, 0, 1)`; chuyển động nhỏ bằng opacity/transform. Không có GSAP, parallax, cuộn khóa, rung lỗi, bounce hay loop trang trí. Khi bật reduced motion, chuyển trạng thái trực tiếp hoặc fade ngắn, không dịch chuyển không gian. Bộ đếm giờ và trạng thái tự lưu truyền thông tin bằng chữ rõ ràng.

Skill motion-design có chỉ dẫn chung về ba lớp chuyển động và ambient; không áp dụng yêu cầu đó cho giao diện luyện thi này vì người dùng đã ưu tiên tối giản. Đây là điều chỉnh theo yêu cầu sản phẩm, không phải yêu cầu mới cần người dùng phê duyệt.

Nguồn: [motion-design/SKILL.md](D:/skills/.agents/skills/motion-design/SKILL.md), [context-adaptation.md](D:/skills/.agents/skills/motion-design/director/context-adaptation.md).

## Phân loại đầy đủ

- **Áp dụng**: tham gia trực tiếp vào hướng thiết kế hoặc đặc tả tương tác.
- **Liên quan**: có thể hữu ích ở bước triển khai tiếp theo hoặc khi phạm vi mở rộng; chưa áp dụng ở bước này.
- **Không áp dụng**: ngoài phạm vi, sai công cụ/sản phẩm hoặc xung đột với hướng đã chọn. Các skill bảo mật chỉ được phân loại, không thực thi kiểm thử hay kỹ thuật tấn công.

| Skill | Trạng thái | Lý do |
|---|---|---|
| `401-403-bypass-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `active-directory-acl-abuse` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `active-directory-certificate-services` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `active-directory-kerberos-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `ai-ml-security` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `android-pentesting-tricks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `anti-debugging-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `api-auth-and-jwt-abuse` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `api-authorization-and-bola` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `api-designer` | Liên quan | Có ích khi triển khai API cho màn hình; lần này không thiết kế lại hợp đồng API. |
| `api-recon-and-docs` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `api-sec` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `arbitrary-write-to-rce` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `auth-sec` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `authbypass-authentication-flaws` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `bencium-innovative-ux-designer` | Không áp dụng | Quy trình 10 hướng typography-only và khóa hướng thiết kế không phù hợp với bước thiết kế các luồng sản phẩm đã xác định; cấm SVG/visual QA cũng xung đột với bàn giao có kiểm chứng. |
| `binary-protection-bypass` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `brandkit` | Không áp dụng | Tạo board nhận diện bằng ảnh; không phải màn hình sản phẩm có cấu trúc chỉnh sửa. |
| `browser-exploitation-v8` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `business-logic-vuln` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `business-logic-vulnerabilities` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `chart-designer` | Áp dụng | Dùng cho màn quản trị/analytics: chọn biểu đồ đúng câu hỏi, trục có đơn vị, giá trị rõ, màu có ý nghĩa. |
| `classical-cipher-analysis` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `clickjacking` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `cmdi-command-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `code-obfuscation-deobfuscation` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `container-escape-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `cors-cross-origin-misconfiguration` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `crlf-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `csp-bypass-advanced` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `csrf-cross-site-request-forgery` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `csv-formula-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `dangling-markup-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `defi-attack-patterns` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `dependency-confusion` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `deserialization-insecure` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `design-taste-frontend` | Liên quan | Đã xem phạm vi; skill loại trừ dashboard/admin và luồng form. Chỉ dùng cho trang marketing nếu làm ở bước sau. |
| `design-taste-frontend-v1` | Không áp dụng | Bản tương thích cũ; dùng design-taste-frontend hiện tại thay cho hai bộ chỉ dẫn trùng nhau. |
| `dns-rebinding-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `email-header-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `expression-language-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `file-access-vuln` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `fintrack-spring-boot` | Không áp dụng | Hướng dẫn riêng dự án FinTrack/Spring Boot; không phải ExamPlatform. |
| `fintrack-tauri-react` | Không áp dụng | Hướng dẫn riêng dự án desktop FinTrack/Tauri; không phải ExamPlatform React/Remix. |
| `format-string-exploitation` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `full-output-enforcement` | Liên quan | Tham khảo nguyên tắc bàn giao đầy đủ; không thay đổi phạm vi từ thiết kế sang viết toàn bộ ứng dụng. |
| `ghost-bits-cast-attack` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `gpt-taste` | Không áp dụng | AIDA, random layout, cinematic GSAP và khoảng cách kiểu landing page không phù hợp với ứng dụng luyện thi tối giản. |
| `graphql-and-hidden-parameters` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `gsap-core` | Không áp dụng | Hướng dẫn triển khai GSAP; thiết kế lần này chỉ cần chuyển trạng thái nhẹ, không thêm GSAP. |
| `gsap-frameworks` | Không áp dụng | Hướng dẫn triển khai GSAP; thiết kế lần này chỉ cần chuyển trạng thái nhẹ, không thêm GSAP. |
| `gsap-performance` | Không áp dụng | Hướng dẫn triển khai GSAP; thiết kế lần này chỉ cần chuyển trạng thái nhẹ, không thêm GSAP. |
| `gsap-plugins` | Không áp dụng | Hướng dẫn triển khai GSAP; thiết kế lần này chỉ cần chuyển trạng thái nhẹ, không thêm GSAP. |
| `gsap-react` | Không áp dụng | Hướng dẫn triển khai GSAP; thiết kế lần này chỉ cần chuyển trạng thái nhẹ, không thêm GSAP. |
| `gsap-scrolltrigger` | Không áp dụng | Hướng dẫn triển khai GSAP; thiết kế lần này chỉ cần chuyển trạng thái nhẹ, không thêm GSAP. |
| `gsap-timeline` | Không áp dụng | Hướng dẫn triển khai GSAP; thiết kế lần này chỉ cần chuyển trạng thái nhẹ, không thêm GSAP. |
| `gsap-utils` | Không áp dụng | Hướng dẫn triển khai GSAP; thiết kế lần này chỉ cần chuyển trạng thái nhẹ, không thêm GSAP. |
| `hack` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `hash-attack-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `heap-exploitation` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `high-end-visual-design` | Không áp dụng | Các yêu cầu double-bezel, pill, glass, chuyển động dày và typography quá lớn trái với hướng phẳng, gọn, tập trung bài thi. |
| `http-host-header-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `http-parameter-pollution` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `http2-specific-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `idor-broken-object-authorization` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `image-to-code` | Không áp dụng | Quy trình tạo ảnh trước rồi viết website; đầu ra lần này là thiết kế sản phẩm và bản xem thử có thể đối chiếu. |
| `imagegen-frontend-mobile` | Không áp dụng | Tạo ảnh mockup ứng dụng di động; không phù hợp với thiết kế web responsive có cấu trúc. |
| `imagegen-frontend-web` | Không áp dụng | Tạo ảnh từng section marketing/landing page; ứng dụng học và thi không cần bộ ảnh tham chiếu này. |
| `industrial-brutalist-ui` | Không áp dụng | Mỹ thuật quân sự/terminal, chữ cực lớn, scanline và độ đậm đặc không phù hợp với yêu cầu hiện đại tối giản. |
| `injection-checking` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `insecure-source-code-management` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `ios-pentesting-tricks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `jndi-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `jwt-oauth-token-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `kernel-exploitation` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `kubernetes-pentesting` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `lattice-crypto-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `linux-lateral-movement` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `linux-privilege-escalation` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `linux-security-bypass` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `llm-prompt-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `macos-process-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `macos-security-bypass` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `memory-forensics-volatility` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `minimalist-ui` | Áp dụng | Hướng hình ảnh chính: nền trắng/off-white, chữ charcoal, nhấn sage, bố cục phẳng và khoảng trắng có mục đích. |
| `mobile-ssl-pinning-bypass` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `motion-design` | Áp dụng | Chỉ dùng phản hồi thao tác và chuyển trạng thái nhẹ; giới hạn chuyển động theo yêu cầu tối giản. |
| `network-protocol-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `nodejs-backend-patterns` | Không áp dụng | Thiết kế backend Node.js; không thuộc bước thiết kế UI và không thay backend Laravel hiện có. |
| `nosql-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `ntlm-relay-coercion` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `oauth-oidc-misconfiguration` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `open-redirect` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `path-traversal-lfi` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `php-best-practices` | Liên quan | Có ích khi sửa PHP; không cần cho tài liệu và màn hình thiết kế. |
| `php-pro` | Liên quan | Có ích khi triển khai Laravel; không yêu cầu thay backend ở bước thiết kế. |
| `product-designer` | Áp dụng | Nền tảng chính: luồng học viên, ưu tiên nội dung, hệ component, trạng thái và khả năng truy cập. |
| `prototype-pollution` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `prototype-pollution-advanced` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `race-condition` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `recon-and-methodology` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `recon-for-sec` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `redesign-existing-projects` | Áp dụng | Đối chiếu tính năng thật trước khi thiết kế; giữ các luồng học, làm bài, nộp bài và xem kết quả. |
| `request-smuggling` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `reverse-shell-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `rsa-attack-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `saml-sso-assertion-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `sandbox-escape-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `security-and-hardening` | Liên quan | Có ích khi triển khai input, phiên đăng nhập và tích hợp; hiện không sửa luồng xác thực hay dữ liệu. |
| `smart-contract-vulnerabilities` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `sqli-sql-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `ssrf-server-side-request-forgery` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `ssti-server-side-template-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `stack-overflow-and-rop` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `steganography-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `stitch-design-taste` | Không áp dụng | Dành riêng cho Google Stitch; dự án đang ưu tiên Figma và bản thiết kế cục bộ. |
| `subdomain-takeover` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `svg-logo-designer` | Liên quan | Chỉ phù hợp khi cần thiết kế logo/biểu tượng mới; hiện giữ tên và nhận diện ExamPlatform. |
| `symbolic-execution-tools` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `symmetric-cipher-attacks` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `traffic-analysis-pcap` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `tunneling-and-pivoting` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `type-juggling` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `unauthorized-access-common-services` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `upload-insecure-files` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `v0` | Không áp dụng | Tạo React qua dịch vụ v0; không cần thêm dịch vụ ngoài để chuẩn bị thiết kế Figma. |
| `vm-and-bytecode-reverse` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `waf-bypass-techniques` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `web-cache-deception` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `websocket-security` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `windows-av-evasion` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `windows-lateral-movement` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `windows-privilege-escalation` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `xslt-injection` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `xss-cross-site-scripting` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |
| `xxe-xml-external-entity` | Không áp dụng | Thuộc kiểm thử bảo mật, khai thác, phân tích hệ thống hoặc mật mã; không thuộc yêu cầu thiết kế UI/UX. |

Tổng cộng: 136 skill; 5 áp dụng; 7 liên quan; 124 không áp dụng trong bước thiết kế này.
