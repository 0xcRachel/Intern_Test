import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { classNames } from "../lib/format";
import { useSmoothScroll } from "../context/smooth-scroll";

const buttonVariants = {
  primary:
    "bg-powder text-ink border border-powder hover:bg-[#8bb9cf] active:bg-[#7eafc7] shadow-sm",
  secondary:
    "bg-surface-raised text-ink border border-line hover:border-steel/60 hover:bg-mist/40",
  ghost:
    "bg-transparent text-ink border border-transparent hover:bg-mist/55",
  danger:
    "bg-[#fbeceb] text-danger border border-[#efc8c4] hover:bg-[#f7dfdc]",
  dark: "bg-ink text-white border border-ink hover:bg-[#243b47]",
};

const buttonSizes = {
  sm: "min-h-9 px-3 text-xs gap-1.5",
  md: "min-h-11 px-4 text-sm gap-2",
  lg: "min-h-12 px-5 text-sm gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={classNames(
        "inline-flex items-center justify-center rounded-md font-medium transition-[background-color,border-color,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant] || buttonVariants.primary,
        buttonSizes[size] || buttonSizes.md,
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children, ...props }) {
  return (
    <section
      className={classNames(
        "rounded-lg border border-line",
        !/\bbg-[^\s]+/.test(className || "") && "bg-surface-raised",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function Badge({ tone = "neutral", className, children }) {
  const tones = {
    neutral: "bg-mist/70 text-ink border-[#c8dce6]",
    blue: "bg-mist text-[#315a70] border-[#bfdbe8]",
    sand: "bg-sand/45 text-[#65512f] border-[#dfc99f]",
    success: "bg-[#e9f2ec] text-success border-[#c8dfd1]",
    danger: "bg-[#fbeceb] text-danger border-[#efc8c4]",
    dark: "bg-ink text-white border-ink",
  };
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        tones[tone] || tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Field({ label, htmlFor, hint, error, required, children }) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-sm font-medium text-ink"
        >
          {label}
          {required ? <span className="text-danger">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-md border border-line bg-surface-raised px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors hover:border-[#bfcdd2] focus:border-steel focus:outline-none focus:ring-3 focus:ring-steel/15 disabled:bg-surface-sunken";

export function Input({ className, ...props }) {
  return <input className={classNames(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={classNames(controlClass, "min-h-28 resize-y", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select className={classNames(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

export function Alert({ tone = "error", title, children, className }) {
  const tones = {
    error: "border-[#efc8c4] bg-[#fbeceb] text-[#7d2d2d]",
    success: "border-[#c8dfd1] bg-[#eef6f0] text-[#275843]",
    info: "border-[#bfdbe8] bg-mist/70 text-[#234e63]",
    warning: "border-[#dfc99f] bg-sand/40 text-[#5e4b2a]",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={classNames(
        "rounded-md border px-4 py-3 text-sm leading-6",
        tones[tone] || tones.info,
        className,
      )}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children}
    </div>
  );
}

export function Spinner({ className }) {
  return (
    <span
      className={classNames(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function LoadingScreen({ label = "Đang tải dữ liệu..." }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-3 text-sm text-muted">
      <Spinner className="text-steel" />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={classNames(
        "animate-pulse rounded-md bg-mist/70",
        className,
      )}
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface-raised/55 px-6 py-14 text-center">
      {Icon ? (
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist text-steel">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-steel">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "neutral", icon: Icon }) {
  const tones = {
    neutral: "border-line bg-surface-raised",
    blue: "border-line bg-mist/60",
    sand: "border-line bg-sand/35",
    dark: "border-ink bg-ink text-white",
  };
  const isDark = tone === "dark";
  return (
    <section className={classNames("rounded-lg border p-5", tones[tone] || tones.neutral)}>
      <div className="flex items-start justify-between gap-3">
        <p
          className={classNames(
            "text-xs font-semibold uppercase tracking-[0.12em]",
            isDark ? "text-white/65" : "text-muted",
          )}
        >
          {label}
        </p>
        {Icon ? (
          <span
            className={classNames(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              isDark ? "bg-white/10 text-powder" : "bg-mist text-steel",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p
        className={classNames(
          "mt-3 text-3xl font-semibold tracking-tight",
          isDark ? "text-white" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className={classNames("mt-2 text-xs", isDark ? "text-white/60" : "text-muted")}>
          {hint}
        </p>
      ) : null}
    </section>
  );
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const lenisRef = useSmoothScroll();

  useEffect(() => {
    if (!open) return undefined;
    lenisRef?.current?.stop();

    function onKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => panelRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lenisRef?.current?.start();
    };
  }, [open, onClose, lenisRef]);

  if (!open) return null;

  const widths = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      data-lenis-prevent
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-lenis-prevent
        className={classNames(
          "page-enter max-h-[92vh] w-full overflow-y-auto rounded-t-xl border border-line bg-surface-raised shadow-2xl outline-none sm:rounded-lg",
          widths[size] || widths.md,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-mist hover:text-ink"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-canvas/60 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Xác nhận",
  loading = false,
  tone = "primary",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant={tone} onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-muted">
        Thao tác này sẽ được gửi ngay tới hệ thống. Bạn có thể kiểm tra lại trước khi
        tiếp tục.
      </p>
    </Modal>
  );
}
