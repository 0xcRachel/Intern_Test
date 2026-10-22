import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronRight, CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";
import { formatDate, classNames } from "../lib/format";
import { useAuth } from "../context/auth";
import { useNotifications } from "./notifications";
import { usePolling } from "../lib/use-polling";

const toneClasses = {
  success: "bg-[#e9f2ec] text-success",
  info: "bg-mist text-steel",
  warning: "bg-sand/45 text-[#8a6425]",
  error: "bg-[#fbeceb] text-danger",
};

export function NotificationCenter({ dark = false }) {
  const { token, ready, isAuthenticated } = useAuth();
  const notifications = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenIds = useRef(new Set());
  const firstLoad = useRef(true);
  const rootRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api("/notifications", { token });
      const nextItems = response?.data || [];

      if (!firstLoad.current) {
        nextItems
          .filter((item) => !seenIds.current.has(item.id))
          .slice(0, 3)
          .reverse()
          .forEach((item) => {
            notifications.notify(item.tone || "info", item.message, {
              title: item.title,
              duration: 6500,
            });
          });
      }

      nextItems.forEach((item) => seenIds.current.add(item.id));
      setItems(nextItems);
      setUnreadCount(response?.unread_count || 0);
      firstLoad.current = false;
    } catch {
      // A temporary polling failure should not interrupt the current page.
    }
  }, [notifications, token]);

  useEffect(() => {
    seenIds.current = new Set();
    firstLoad.current = true;
    setItems([]);
    setUnreadCount(0);
    if (token) refresh();
  }, [token, refresh]);

  usePolling(refresh, 8000, Boolean(token && ready && isAuthenticated));

  useEffect(() => {
    function close(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function markRead(item) {
    if (!item.read_at) {
      setItems((current) => current.map((entry) => (
        entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry
      )));
      setUnreadCount((current) => Math.max(0, current - 1));
      try {
        await api(`/notifications/${item.id}/read`, { method: "PATCH", token });
      } catch {
        refresh();
      }
    }

    if (item.action_url) {
      setOpen(false);
      navigate(item.action_url);
    }
  }

  async function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await api("/notifications/read-all", { method: "POST", token });
    } catch {
      refresh();
    }
  }

  if (!ready || !isAuthenticated) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          refresh();
        }}
        className={classNames(
          "relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
          dark
            ? "border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
            : "border-line bg-surface-raised text-muted hover:border-steel/60 hover:text-ink",
        )}
        aria-label={unreadCount ? `${unreadCount} thông báo chưa đọc` : "Mở thông báo"}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-canvas">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="dropdown-enter absolute right-0 z-50 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-line bg-surface-raised shadow-[0_24px_70px_-24px_rgba(20,35,44,0.45)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Thông báo</p>
              <p className="mt-0.5 text-[11px] text-muted">Cập nhật tự động mỗi vài giây</p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-steel hover:text-ink"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Đã đọc hết
              </button>
            ) : null}
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            {items.length ? items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markRead(item)}
                className={classNames(
                  "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-mist/45",
                  !item.read_at && "bg-mist/25",
                )}
              >
                <span className={classNames("mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full", toneClasses[item.tone] || toneClasses.info)}>
                  {item.read_at ? <CircleCheck className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-ink">{item.title || "Thông báo mới"}</span>
                    {!item.read_at ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-steel" /> : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{item.message}</span>
                  <span className="mt-1 block text-[10px] text-muted/75">{formatDate(item.created_at)}</span>
                </span>
                {item.action_url ? <ChevronRight className="mt-2 h-3.5 w-3.5 shrink-0 text-muted" /> : null}
              </button>
            )) : (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-7 w-7 text-muted/50" />
                <p className="mt-3 text-sm font-medium text-ink">Chưa có thông báo</p>
                <p className="mt-1 text-xs leading-5 text-muted">Đơn hàng và kết quả bài làm mới sẽ xuất hiện tại đây.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
