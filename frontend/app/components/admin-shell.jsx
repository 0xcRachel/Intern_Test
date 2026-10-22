import { Link, NavLink, useLocation, useNavigate } from "react-router";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { useAuth } from "../context/auth";
import { PageMotion } from "./page-motion";
import { classNames } from "../lib/format";
import { Button } from "./ui";
import { NotificationCenter } from "./notification-center";

const primaryLinks = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/exams", label: "Đề luyện tập", icon: ClipboardList },
  { to: "/admin/packages", label: "Danh mục khóa học", icon: BookOpen },
  { to: "/admin/previews", label: "Lượt xem thử", icon: Eye },
  { to: "/admin/orders", label: "Đơn hàng", icon: ReceiptText },
];

const secondaryLinks = [
  { to: "/packages", label: "Tài liệu IELTS", icon: BookOpen },
  { to: "/exams", label: "Trang học viên", icon: ArrowUpRight },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-[#101d37] text-white">
      <div className="border-b border-white/10 px-6 py-7">
        <Logo light />
        <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-powder">
          <ShieldCheck className="h-3 w-3" />
          Không gian quản trị
        </p>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6" aria-label="Điều hướng quản trị">
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Quản lý nội dung
          </p>
          <div className="mt-2 grid gap-1">
            {primaryLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    classNames(
                      "flex min-h-12 items-center gap-3 rounded-xl border px-3 text-[13px] transition-all duration-200",
                      isActive
                        ? "border-steel bg-steel font-semibold text-white shadow-lg shadow-steel/15"
                        : "border-transparent text-white/60 hover:bg-white/5 hover:text-white",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Không gian học viên
          </p>
          <div className="mt-2 grid gap-1">
            {secondaryLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    classNames(
                      "flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm transition-colors",
                      isActive
                        ? "border-white/10 bg-white/10 font-medium text-white"
                        : "border-transparent text-white/60 hover:bg-white/5 hover:text-white",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-powder text-sm font-semibold uppercase text-ink">
            {user?.name?.slice(0, 1) || "A"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-white/45">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = primaryLinks.find((item) => item.end ? pathname === item.to : pathname.startsWith(item.to));

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Bỏ qua điều hướng quản trị
      </a>

      <aside className="fixed inset-y-4 left-4 z-40 hidden w-[248px] lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu quản trị"
          />
          <aside className="relative h-full w-[280px] max-w-[85vw] p-3">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white"><X className="h-4 w-4" /></button>
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-dvh min-w-0 flex-col lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/85 backdrop-blur-md lg:hidden">
          <div className="flex h-16 items-center justify-between gap-3 px-5">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-mist"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu quản trị"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo compact />
            <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)} aria-label="Mở tài khoản">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold uppercase text-powder">
                {user?.name?.slice(0, 1) || "A"}
              </span>
            </Button>
          </div>
        </header>

        <header className="sticky top-0 z-30 hidden h-20 items-center justify-between gap-4 border-b border-line/80 bg-canvas/95 px-6 backdrop-blur-xl lg:flex xl:px-10">
          <div>
            <p className="flex items-center gap-2 text-xs text-muted"><span>Workspace</span><ChevronRight className="h-3 w-3" /><span className="font-semibold text-ink">{activeItem?.label || "Quản trị"}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Link to="/exams" className="inline-flex">
              <Button variant="secondary" size="sm">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Xem trang học viên
              </Button>
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-3 py-1.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="font-medium text-ink">{user?.name}</span>
              <span className="text-muted">Admin</span>
            </span>
          </div>
        </header>

        <main
          id="admin-content"
          className={classNames(
            "workspace-content mx-auto w-full min-w-0 max-w-[1480px] flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-10",
          )}
        >
          <PageMotion>{children}</PageMotion>
        </main>

        <footer className="border-t border-line px-5 py-5 text-xs text-muted sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>ExamPlatform · Không gian quản trị nội dung</span>
            <span>Chỉ tài khoản quản trị mới truy cập được khu vực này.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
