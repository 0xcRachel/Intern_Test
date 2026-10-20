import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { api } from "../lib/api";
import { formatPrice, classNames } from "../lib/format";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";

function Avatar({ user, size = "md" }) {
  const sizeClass = size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs";
  return (
    <span
      className={classNames(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-semibold uppercase text-powder ring-2 ring-surface-raised",
        sizeClass,
      )}
    >
      {user?.avatar ? (
        <img src={user.avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        user?.name?.slice(0, 1) || "U"
      )}
    </span>
  );
}

export function UserMenu({ compact = false, tone = "light" }) {
  const { user, token, isAdmin, logout } = useAuth();
  const { items: cartItems, count, subtotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!user || !token || !open) return undefined;
    let active = true;
    setLoadingCourses(true);
    api("/my/courses", { token })
      .then((data) => {
        if (active) setCourses(data?.data || []);
      })
      .catch(() => {
        if (active) setCourses([]);
      })
      .finally(() => {
        if (active) setLoadingCourses(false);
      });
    return () => {
      active = false;
    };
  }, [user, token, open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/login");
  }

  if (!user) return null;

  const isDark = tone === "dark";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={classNames(
          "inline-flex min-h-11 items-center gap-2 rounded-full border px-1.5 py-1 transition-colors",
          isDark
            ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
            : "border-line bg-surface-raised text-ink hover:border-steel/60",
          compact ? "pr-1.5 sm:pr-3" : "pr-2",
        )}
      >
        <Avatar user={user} />
        <span className={classNames("hidden min-w-0 text-left sm:block", compact && "sm:hidden lg:block")}>
          <span className="block max-w-[130px] truncate text-xs font-semibold leading-4">
            {user.name}
          </span>
          <span
            className={classNames(
              "block text-[10px] uppercase tracking-[0.12em]",
              isDark ? "text-white/45" : "text-muted",
            )}
          >
            {isAdmin ? "Quản trị" : "Học viên"}
          </span>
        </span>
        <ChevronDown
          className={classNames(
            "hidden h-3.5 w-3.5 transition-transform sm:block",
            isDark ? "text-white/50" : "text-muted",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          data-lenis-prevent
          className="dropdown-enter absolute right-0 z-50 mt-2 max-h-[min(78vh,720px)] w-[min(92vw,380px)] overflow-y-auto rounded-xl border border-line bg-surface-raised shadow-[0_24px_70px_-24px_rgba(20,35,44,0.45)]"
        >
          <div className="bg-ink px-4 pb-5 pt-4 text-white">
            <div className="flex items-start gap-3">
              <Avatar user={user} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="mt-0.5 truncate text-xs text-white/50">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-powder">
                    {isAdmin ? "Quản trị viên" : "Học viên"}
                  </span>
                  {user.target_band ? (
                    <span className="rounded-full bg-powder/15 px-2 py-0.5 text-[10px] font-medium text-powder">
                      Mục tiêu {user.target_band}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 px-2 py-2">
                <p className="text-base font-semibold">{courses.length}</p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Đã mua</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 px-2 py-2">
                <p className="text-base font-semibold">{count}</p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Đã chọn</p>
              </div>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Khóa học đã chọn
              </p>
              {count ? (
                <span className="text-[11px] font-medium text-steel">{formatPrice(subtotal)}</span>
              ) : null}
            </div>
            {cartItems.length ? (
              <div className="mt-2 space-y-1.5">
                {cartItems.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    to={`/packages/${item.slug || item.id}`}
                    className="flex items-center gap-2 rounded-md border border-line bg-canvas/50 px-2.5 py-2 transition-colors hover:border-steel/50"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-ink">{item.title}</span>
                      <span className="text-[10px] text-muted">{formatPrice(item.price)}</span>
                    </span>
                  </Link>
                ))}
                <Link
                  to="/checkout"
                  className="flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-powder px-3 text-xs font-semibold text-ink transition-colors hover:bg-[#8bb9cf]"
                >
                  Thanh toán {count} khóa học
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <p className="mt-2 rounded-md border border-dashed border-line px-3 py-2 text-[11px] leading-5 text-muted">
                Chưa chọn khóa học nào.{" "}
                <Link to="/packages" className="font-medium text-steel hover:text-ink">
                  Khám phá tài liệu →
                </Link>
              </p>
            )}
          </div>

          <div className="border-t border-line p-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Khóa học đã mua
              </p>
              <Link to="/my-courses" className="text-[11px] font-medium text-steel hover:text-ink">
                Tất cả
              </Link>
            </div>
            {loadingCourses ? (
              <div className="mt-2 h-12 animate-pulse rounded-md bg-mist/60" />
            ) : courses.length ? (
              <div className="mt-2 space-y-1.5">
                {courses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    to={`/packages/${course.slug || course.id}`}
                    className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2 transition-colors hover:border-steel/50"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e9f2ec] text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-ink">{course.title}</span>
                      <span className="text-[10px] text-success">Đã sở hữu · Vào học</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-md border border-dashed border-line px-3 py-2 text-[11px] leading-5 text-muted">
                Chưa có khóa học nào.{" "}
                <Link to="/packages" className="font-medium text-steel hover:text-ink">
                  Chọn khóa học đầu tiên →
                </Link>
              </p>
            )}
          </div>

          <div className="border-t border-line p-2">
            <Link to="/profile" className="menu-row" role="menuitem">
              <UserRound className="h-4 w-4 text-steel" />
              Hồ sơ học viên
            </Link>
            <Link to="/my-courses" className="menu-row" role="menuitem">
              <GraduationCap className="h-4 w-4 text-steel" />
              Khóa học của tôi
            </Link>
            <Link to="/orders" className="menu-row" role="menuitem">
              <ReceiptText className="h-4 w-4 text-steel" />
              Đơn hàng
            </Link>
            <Link to="/exams" className="menu-row" role="menuitem">
              <BookOpen className="h-4 w-4 text-steel" />
              Đề luyện tập
            </Link>
            {isAdmin ? (
              <Link to="/admin" className="menu-row" role="menuitem">
                <LayoutDashboard className="h-4 w-4 text-steel" />
                Trang quản trị
              </Link>
            ) : null}
            <button type="button" onClick={handleLogout} className="menu-row w-full text-danger" role="menuitem">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
