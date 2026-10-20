import { Link } from "react-router";
import { Button } from "../components/ui";
import { Logo } from "../components/logo";

export function meta() {
  return [{ title: "Không tìm thấy trang — ExamPlatform" }];
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-steel">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          Trang bạn tìm không tồn tại
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Có thể đường dẫn đã thay đổi hoặc bạn không có quyền truy cập.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/">
            <Button>Về trang chủ</Button>
          </Link>
          <Link to="/exams">
            <Button variant="secondary">Đề luyện tập</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
