import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/auth";
import { api, apiUrl, errorMessage } from "../lib/api";
import { Logo } from "../components/logo";
import { useNotifications } from "../components/notifications";
import { Button, Field, Input, Spinner } from "../components/ui";

export function meta() {
  return [{ title: "Đăng nhập — ExamPlatform" }];
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.95.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const OAUTH_PROVIDERS = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "github", label: "GitHub", icon: GithubIcon },
];

function safeNext(next) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export default function Login() {
  const { ready, isAuthenticated, user, login, completeOAuth } = useAuth();
  const notifications = useNotifications();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const oauthCode = searchParams.get("oauth_code");
  const oauthError = searchParams.get("oauth_error");
  const exchangedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState("");
  const [oauthBusy, setOauthBusy] = useState(Boolean(oauthCode));
  const [providers, setProviders] = useState(null);

  function targetFor(role) {
    return next || (role === "admin" ? "/admin" : "/exams");
  }

  useEffect(() => {
    api("/auth/providers")
      .then((data) => setProviders(data?.data || {}))
      .catch(() => setProviders({}));
  }, []);

  function clearAuthParams() {
    setSearchParams(
      (current) => {
        const nextParams = new URLSearchParams(current);
        nextParams.delete("oauth_error");
        nextParams.delete("oauth_code");
        return nextParams;
      },
      { replace: true },
    );
  }

  useEffect(() => {
    if (!oauthError) return;
    notifications.error(oauthError, { title: "Không thể đăng nhập OAuth" });
    clearAuthParams();
  }, [notifications, oauthError, setSearchParams]);

  useEffect(() => {
    if (!oauthBusy) return;
    notifications.info("Đang xác thực tài khoản với nhà cung cấp. Vui lòng chờ trong giây lát.", {
      title: "Đang hoàn tất đăng nhập",
      duration: 3000,
    });
  }, [notifications, oauthBusy]);

  useEffect(() => {
    if (!ready || !isAuthenticated || oauthCode) return;
    navigate(targetFor(user?.role), { replace: true });
  }, [ready, isAuthenticated, user, navigate, oauthCode]);

  useEffect(() => {
    if (!oauthCode || exchangedRef.current) return;
    exchangedRef.current = true;
    setOauthBusy(true);
    completeOAuth(oauthCode)
      .then((data) => {
        navigate(targetFor(data.user?.role), { replace: true });
      })
      .catch((requestError) => {
        notifications.error(errorMessage(requestError), { title: "Đăng nhập OAuth thất bại" });
        clearAuthParams();
      })
      .finally(() => setOauthBusy(false));
  }, [oauthCode, completeOAuth, navigate, notifications, setSearchParams]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(targetFor(data.user?.role), { replace: true });
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Đăng nhập không thành công" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo(demoEmail) {
    setDemoLoading(demoEmail);
    setEmail(demoEmail);
    setPassword("password123");
    try {
      const data = await login(demoEmail, "password123");
      navigate(targetFor(data.user?.role), { replace: true });
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Đăng nhập không thành công" });
    } finally {
      setDemoLoading("");
    }
  }

  function handleOauthClick(event, provider) {
    if (providers?.[provider.id]?.configured === false) {
      event.preventDefault();
      notifications.warning(
        `Đăng nhập ${provider.label} chưa được cấu hình. Thêm client ID và secret vào .env để bật OAuth.`,
        { title: "OAuth chưa sẵn sàng" },
      );
    }
  }

  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-powder/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-sand/20 blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[210px] font-bold leading-none tracking-tighter text-white/[0.035]">
          IELTS
        </div>

        <Link to="/" className="relative inline-flex w-fit">
          <Logo light />
        </Link>

        <div className="relative max-w-lg">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-powder">
            <Sparkles className="h-3 w-3" />
            Không gian luyện thi
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-tight xl:text-[44px]">
            Học có lộ trình.
            <br />
            Làm bài có mục tiêu.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
            Một tài khoản cho toàn bộ hành trình IELTS: mua tài liệu, xem preview, luyện đề có
            chấm điểm và theo dõi kết quả.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-2">
            {[
              { value: "4", label: "Kỹ năng" },
              { value: "24/7", label: "Truy cập" },
              { value: "100%", label: "Chủ động" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-center"
              >
                <p className="text-xl font-semibold tracking-tight text-white">{stat.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3 text-sm text-white/70">
            <p className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-powder" />
              Phiên đăng nhập bằng token, không lưu mật khẩu trong trình duyệt.
            </p>
            <p className="flex items-center gap-3">
              <KeyRound className="h-4 w-4 shrink-0 text-powder" />
              Preview tài liệu được ký và gắn với tài khoản.
            </p>
            <p className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 shrink-0 text-powder" />
              Khóa học đã mua được lưu trong thư viện của bạn.
            </p>
          </div>
        </div>

        <p className="relative text-xs text-white/35">ExamPlatform · IELTS practice studio</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:py-14">
        <div className="w-full max-w-md">
          <div className="mb-7 flex items-center justify-between lg:hidden">
            <Logo />
            <Link to="/" className="text-xs text-muted hover:text-ink">
              Trang chủ
            </Link>
          </div>

          <div className="rounded-xl border border-line bg-surface-raised p-6 shadow-[0_18px_50px_-32px_rgba(20,35,44,0.35)] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-steel">
              Chào mừng trở lại
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Đăng nhập tài khoản
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Tiếp tục lộ trình học và mở khóa tài liệu của bạn.
            </p>

            {oauthBusy ? (
              <div className="mt-5 flex items-center gap-2 text-xs font-medium text-steel">
                <Spinner className="text-steel" />
                Đang hoàn tất đăng nhập OAuth...
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-2">
              {OAUTH_PROVIDERS.map((provider) => {
                const Icon = provider.icon;
                const isConfigured = providers?.[provider.id]?.configured;
                return (
                  <a
                    key={provider.id}
                    href={apiUrl(`/auth/${provider.id}/redirect`)}
                    onClick={(event) => handleOauthClick(event, provider)}
                    title={
                      isConfigured === false
                        ? `Cần cấu hình ${provider.label} OAuth trong .env`
                        : `Đăng nhập bằng ${provider.label}`
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface-raised px-3 text-sm font-medium text-ink transition-colors hover:border-steel/60 hover:bg-mist/40"
                  >
                    <Icon />
                    {provider.label}
                    {isConfigured === false ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-sand" aria-hidden="true" />
                    ) : null}
                  </a>
                );
              })}
            </div>

            <div className="my-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
              <span className="h-px flex-1 bg-line" />
              hoặc dùng email
              <span className="h-px flex-1 bg-line" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field label="Email" htmlFor="email" required>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Mật khẩu" htmlFor="password" required>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-mist hover:text-ink"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Button type="submit" className="w-full" size="lg" disabled={loading || oauthBusy}>
                {loading ? <Spinner /> : null}
                Đăng nhập
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
              <span className="h-px flex-1 bg-line" />
              tài khoản demo
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="secondary"
                onClick={() => handleDemo("student@example.com")}
                disabled={Boolean(demoLoading) || loading || oauthBusy}
              >
                {demoLoading === "student@example.com" ? (
                  <Spinner />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
                Học viên
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDemo("admin@example.com")}
                disabled={Boolean(demoLoading) || loading || oauthBusy}
              >
                {demoLoading === "admin@example.com" ? (
                  <Spinner />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Quản trị
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted">
              student@example.com · admin@example.com / password123
            </p>

            <p className="mt-6 text-center text-xs text-muted">
              Chưa có tài khoản?{" "}
              <Link className="font-medium text-steel hover:text-ink" to="/register">
                Đăng ký học viên
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            <Link className="hover:text-ink" to="/">
              ← Về trang giới thiệu
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
