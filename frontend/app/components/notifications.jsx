import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

const NotificationContext = createContext(null);

const toneStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-success",
    iconWrap: "bg-[#e9f2ec]",
    accent: "bg-success",
    border: "border-[#c8dfd1]",
  },
  error: {
    icon: CircleAlert,
    iconClass: "text-danger",
    iconWrap: "bg-[#fbeceb]",
    accent: "bg-danger",
    border: "border-[#efc8c4]",
  },
  warning: {
    icon: TriangleAlert,
    iconClass: "text-[#8a6425]",
    iconWrap: "bg-sand/45",
    accent: "bg-[#c59a4a]",
    border: "border-[#dfc99f]",
  },
  info: {
    icon: Info,
    iconClass: "text-steel",
    iconWrap: "bg-mist",
    accent: "bg-steel",
    border: "border-[#bfdbe8]",
  },
};

function NotificationItem({ notification, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  const closeTimer = useRef(null);
  const tone = toneStyles[notification.tone] || toneStyles.info;
  const Icon = tone.icon;

  useEffect(() => {
    function close() {
      setLeaving(true);
      closeTimer.current = window.setTimeout(() => onDismiss(notification.id), 190);
    }

    const timer = window.setTimeout(close, notification.duration);
    return () => {
      window.clearTimeout(timer);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [notification.duration, notification.id, onDismiss]);

  function dismiss() {
    if (leaving) return;
    setLeaving(true);
    closeTimer.current = window.setTimeout(() => onDismiss(notification.id), 190);
  }

  return (
    <div
      role={notification.tone === "error" ? "alert" : "status"}
      className={`notification-enter ${leaving ? "notification-leave" : ""} pointer-events-auto relative overflow-hidden rounded-xl border bg-surface-raised shadow-[0_24px_65px_-28px_rgba(20,35,44,0.5)] ${tone.border}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden="true" />
      <div className="flex items-start gap-3 py-3.5 pl-4 pr-3">
        <span
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.iconWrap}`}
        >
          <Icon className={`h-4.5 w-4.5 ${tone.iconClass}`} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          {notification.title ? (
            <p className="text-sm font-semibold leading-5 text-ink">{notification.title}</p>
          ) : null}
          <p className="mt-0.5 text-xs leading-5 text-muted">{notification.message}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist/60 hover:text-ink"
          aria-label="Đóng thông báo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((tone, message, options = {}) => {
    if (!message) return null;
    const id = ++idRef.current;
    const duration = options.duration ?? (tone === "error" ? 7000 : 5000);

    setNotifications((current) => [
      ...current.slice(-3),
      {
        id,
        tone,
        message,
        title: options.title || "",
        duration,
      },
    ]);

    return id;
  }, []);

  const api = useMemo(
    () => ({
      notify: push,
      dismiss,
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
      warning: (message, options) => push("warning", message, options),
      info: (message, options) => push("info", message, options),
    }),
    [dismiss, push],
  );

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 top-3 z-[120] flex flex-col items-stretch gap-2.5 sm:left-auto sm:right-5 sm:top-5 sm:w-[min(92vw,390px)]"
        aria-label="Thông báo"
        aria-live="polite"
      >
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications phải được dùng bên trong NotificationProvider.");
  }

  return context;
}
