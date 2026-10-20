import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, UserPlus } from "lucide-react";
import { useAuth } from "../context/auth";
import { errorMessage } from "../lib/api";
import { Logo } from "../components/logo";
import { Alert, Button, Card, Field, Input, Spinner } from "../components/ui";

export function meta() {
  return [{ title: "Đăng ký — ExamPlatform" }];
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate("/exams", { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10 sm:px-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Card className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">
            Tạo tài khoản học viên
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Bắt đầu lộ trình của bạn
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Tài khoản công khai luôn được tạo với vai trò học viên.
          </p>

          {error ? (
            <Alert className="mt-5" tone="error">
              {error}
            </Alert>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Field label="Họ tên" htmlFor="name" required>
              <Input
                id="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Nguyễn Minh An"
              />
            </Field>
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mật khẩu" htmlFor="password" hint="Tối thiểu 8 ký tự." required>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder="••••••••"
                />
              </Field>
              <Field label="Nhập lại mật khẩu" htmlFor="password_confirmation" required>
                <Input
                  id="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={form.password_confirmation}
                  onChange={(event) => update("password_confirmation", event.target.value)}
                  placeholder="••••••••"
                />
              </Field>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Spinner /> : <UserPlus className="h-4 w-4" />}
              Đăng ký
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Đã có tài khoản?{" "}
            <Link className="font-medium text-steel hover:text-ink" to="/login">
              Đăng nhập
            </Link>
          </p>
        </Card>
        <p className="mt-6 text-center text-xs text-muted">
          <Link className="hover:text-ink" to="/">
            ← Về trang giới thiệu
          </Link>
        </p>
      </div>
    </main>
  );
}
