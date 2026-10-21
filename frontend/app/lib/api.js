const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export function apiUrl(path = "") {
  return `${API_BASE}${path}`;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function api(path, { method = "GET", body, token, headers = {} } = {}) {
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      cache: method === "GET" ? "no-store" : undefined,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Không kết nối được API. Kiểm tra backend hoặc kết nối mạng.",
      0,
      null,
    );
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(
      firstErrorMessage(data) || `Yêu cầu thất bại (${response.status}).`,
      response.status,
      data,
    );
  }

  return data;
}

const MESSAGE_TRANSLATIONS = {
  "Invalid credentials.": "Email hoặc mật khẩu không đúng.",
  "Unauthenticated.": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  "This action is unauthorized.": "Bạn không có quyền thực hiện thao tác này.",
  "Unauthorized. Admin access required.": "Chỉ tài khoản quản trị mới truy cập được khu vực này.",
  "Unauthorized. Student access required.": "Chỉ tài khoản học viên mới thực hiện được thao tác này.",
  "Unauthorized. You can only submit your own attempt.": "Bạn chỉ có thể nộp bài làm của chính mình.",
  "Unauthorized. You can only view your own attempt.": "Bạn chỉ có thể xem bài làm của chính mình.",
  "Unauthorized. You can only save your own attempt.": "Bạn chỉ có thể lưu bài làm của chính mình.",
  "This attempt has already been submitted.": "Bài làm này đã được nộp trước đó.",
  "Cannot autosave on a completed attempt.": "Không thể lưu thêm vì bài làm đã hoàn thành.",
  "This attempt has expired.": "Thời gian làm bài đã hết; đáp án đã lưu được giữ lại.",
  "Preview file is unavailable.": "Bản xem trước hiện chưa sẵn sàng. Vui lòng thử lại sau.",
  "Invalid or expired preview URL signature.": "Liên kết xem trước không hợp lệ hoặc đã hết hạn.",
  "Preview URL is missing the user context.": "Liên kết xem trước thiếu thông tin tài khoản.",
  "This preview URL belongs to another user.": "Liên kết xem trước thuộc về tài khoản khác.",
  "At least one option must be marked as correct.": "Cần đánh dấu ít nhất một đáp án đúng.",
  "Too Many Attempts.": "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
  "The name field is required.": "Vui lòng nhập họ tên.",
  "The email field is required.": "Vui lòng nhập email.",
  "The email field must be a valid email address.": "Email chưa đúng định dạng.",
  "The email has already been taken.": "Email này đã được sử dụng.",
  "The password field is required.": "Vui lòng nhập mật khẩu.",
  "The password field confirmation does not match.": "Mật khẩu nhập lại không khớp.",
  "The password field must be at least 8 characters.": "Mật khẩu cần ít nhất 8 ký tự.",
  "The title field is required.": "Vui lòng nhập tên đề.",
  "The question text field is required.": "Vui lòng nhập nội dung câu hỏi.",
  "The options field is required.": "Cần có danh sách lựa chọn.",
  "The options field must have at least 2 items.": "Cần ít nhất hai lựa chọn.",
  "The duration minutes field is required.": "Vui lòng nhập thời lượng.",
  "The passing score field is required.": "Vui lòng nhập ngưỡng đạt.",
  "The points field must be at least 1.": "Điểm tối thiểu là 1.",
  "Bạn đã sở hữu một hoặc nhiều khóa học trong đơn hàng.":
    "Bạn đã sở hữu một hoặc nhiều khóa học trong đơn hàng.",
  "Mã giảm giá không hợp lệ hoặc đã hết hạn.":
    "Mã giảm giá không hợp lệ hoặc đã hết hạn.",
  "Một hoặc nhiều khóa học không còn khả dụng.":
    "Một hoặc nhiều khóa học không còn khả dụng.",
  "Mã đăng nhập OAuth không hợp lệ hoặc đã hết hạn.":
    "Phiên đăng nhập OAuth không hợp lệ hoặc đã hết hạn.",
};

function translateMessage(message) {
  if (!message) return message || "";
  if (MESSAGE_TRANSLATIONS[message]) return MESSAGE_TRANSLATIONS[message];
  if (message.startsWith("No query results for model")) return "Không tìm thấy dữ liệu yêu cầu.";
  if (message.startsWith("The options.")) return "Danh sách lựa chọn chưa hợp lệ.";
  return message;
}

export function firstErrorMessage(data) {
  if (!data) return "";
  if (data.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first)) return translateMessage(first[0]);
    if (typeof first === "string") return translateMessage(first);
  }
  return translateMessage(data.message || "");
}

export function errorMessage(error) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra.";
}
