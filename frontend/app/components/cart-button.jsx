import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { ArrowRight, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../context/cart";
import { useSmoothScroll } from "../context/smooth-scroll";
import { formatPrice } from "../lib/format";
import { Button } from "./ui";

export function CartButton({ tone = "light" }) {
  const { items, count, subtotal, remove } = useCart();
  const [open, setOpen] = useState(false);
  const lenisRef = useSmoothScroll();
  const triggerRef = useRef(null);
  const drawerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    lenisRef?.current?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30);

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lenisRef?.current?.start();
      triggerRef.current?.focus();
    };
  }, [open, lenisRef]);

  const isDark = tone === "dark";

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label={`Giỏ hàng (${count})`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={
          isDark
            ? "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
            : "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-raised text-ink transition-colors hover:border-steel/60"
        }
      >
        <ShoppingBag className="h-4 w-4" />
        {count ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-powder px-1 text-[10px] font-bold text-ink">
            {count}
          </span>
        ) : null}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100]" data-lenis-prevent>
              <button
                type="button"
                aria-label="Đóng giỏ hàng"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
              />
              <aside
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-drawer-title"
                className="drawer-enter absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col border-l border-line bg-surface-raised shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-steel">
                      Giỏ hàng của bạn
                    </p>
                    <h2
                      id="cart-drawer-title"
                      className="mt-1 text-xl font-semibold tracking-tight text-ink"
                    >
                      {count ? `${count} khóa học đã chọn` : "Chưa chọn khóa học"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    ref={closeRef}
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-mist hover:text-ink"
                    aria-label="Đóng"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

            <div className="flex-1 overflow-y-auto px-4 py-4" data-lenis-prevent>
              {items.length ? (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-line bg-canvas/45 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                          <ShoppingBag className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/packages/${item.slug || item.id}`}
                            onClick={() => setOpen(false)}
                            className="line-clamp-2 text-sm font-medium leading-5 text-ink hover:text-steel"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-1 text-[11px] text-muted">
                            {item.level || "IELTS"} · Trọn đời
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-ink">
                              {formatPrice(item.price)}
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-danger"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-mist text-steel">
                    <ShoppingBag className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-sm font-medium text-ink">Giỏ hàng đang trống</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Chọn một gói tài liệu IELTS để bắt đầu lộ trình của bạn.
                  </p>
                  <Link to="/packages" onClick={() => setOpen(false)} className="mt-4">
                    <Button variant="secondary" size="sm">
                      Khám phá tài liệu
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {items.length ? (
              <div className="border-t border-line bg-canvas/45 px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Tạm tính</span>
                  <span className="text-lg font-semibold text-ink">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  Thanh toán demo, kích hoạt khóa học ngay sau khi xác nhận.
                </p>
                <Link to="/checkout" onClick={() => setOpen(false)} className="mt-3 block">
                  <Button className="w-full" size="lg">
                    Tiến hành thanh toán
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : null}
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
