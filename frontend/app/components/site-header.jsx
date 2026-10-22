import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ArrowRight, LogIn, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { useAuth } from "../context/auth";
import { UserMenu } from "./user-menu";
import { CartButton } from "./cart-button";
import { NotificationCenter } from "./notification-center";

const publicLinks = [
  { label: "Khám phá", href: "/#process" },
  { label: "Khóa học", to: "/packages" },
  { label: "Đề luyện tập", to: "/exams" },
  { label: "Khóa học của tôi", to: "/my-courses", authOnly: true },
  { label: "Hỏi đáp", href: "/#faq" },
];

export function SiteHeader() {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const visibleLinks = publicLinks.filter(
    (item) => !item.authOnly || (ready && isAuthenticated),
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-mist xl:hidden"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo />
        </div>

        <nav className="hidden items-center gap-1 rounded-full bg-canvas p-1 text-[13px] font-medium text-muted xl:flex" aria-label="Điều hướng chính">
          {visibleLinks.map((item) =>
            item.to ? (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2.5 transition-colors ${
                    isActive ? "bg-white text-steel shadow-sm" : "hover:bg-white hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2.5 transition-colors hover:bg-white hover:text-ink"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationCenter />
          <CartButton />
          {ready && isAuthenticated ? (
            <UserMenu compact />
          ) : (
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-steel"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
              <span className="sm:hidden">Vào</span>
            </Link>
          )}
        </div>
      </div>

      {mobileOpen ? (
        <div className="drawer-enter max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-surface-raised px-5 py-4 shadow-xl xl:hidden">
          <nav className="grid gap-1" aria-label="Điều hướng di động">
            {visibleLinks.map((item) =>
              item.to ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center rounded-md px-3 text-sm ${
                      isActive ? "bg-mist text-ink" : "text-muted"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          {ready && isAuthenticated ? (
            <div className="mt-3 grid gap-1 border-t border-line pt-3">
              <Link
                to="/my-courses"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted"
              >
                Khóa học của tôi
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted"
              >
                Hồ sơ học viên
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted"
              >
                Đơn hàng
              </Link>
              {isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-steel"
                >
                  Trang quản trị
                </Link>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-md bg-powder px-4 text-sm font-semibold text-ink"
            >
              Đăng nhập để bắt đầu
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : null}
    </header>
  );
}

export function PublicFooter() {
  const { ready, isAuthenticated } = useAuth();

  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-5 py-10 text-sm text-muted lg:flex-row lg:items-center lg:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <Logo compact />
          <span className="hidden text-xs sm:inline">
            Learn. Practice. Grow.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <Link className="transition-colors hover:text-ink" to="/packages">
            Tài liệu
          </Link>
          <Link className="transition-colors hover:text-ink" to="/exams">
            Đề luyện tập
          </Link>
          {ready && isAuthenticated ? (
            <>
              <Link className="transition-colors hover:text-ink" to="/my-courses">
                Khóa học của tôi
              </Link>
              <Link className="transition-colors hover:text-ink" to="/exams">
                Vào học
              </Link>
            </>
          ) : (
            <Link className="transition-colors hover:text-ink" to="/login">
              Đăng nhập
            </Link>
          )}
          <span className="text-muted/70">© {new Date().getFullYear()} ExamPlatform</span>
        </div>
      </div>
    </footer>
  );
}
