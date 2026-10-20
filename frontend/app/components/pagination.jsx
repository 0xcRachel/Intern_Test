import { ChevronLeft, ChevronRight } from "lucide-react";
import { classNames } from "../lib/format";

function pageItems(current, last) {
  const items = [];
  for (let page = 1; page <= last; page += 1) {
    const nearCurrent = Math.abs(page - current) <= 1;
    const atStart = current <= 3 && page <= 4;
    const atEnd = current >= last - 2 && page >= last - 3;

    if (page === 1 || page === last || nearCurrent || atStart || atEnd) {
      items.push(page);
    } else if (items[items.length - 1] !== "gap") {
      items.push("gap");
    }
  }
  return items;
}

export function Pagination({
  meta,
  onPageChange,
  loading = false,
  itemLabel = "mục",
  className,
}) {
  if (!meta?.last_page || !meta.total) return null;

  const current = Number(meta.current_page) || 1;
  const last = Number(meta.last_page) || 1;
  const perPage = Number(meta.per_page) || 10;
  const from = meta.from ?? (meta.total ? (current - 1) * perPage + 1 : 0);
  const to = meta.to ?? Math.min(current * perPage, meta.total);
  const pages = pageItems(current, last);

  function goTo(page) {
    if (loading || page < 1 || page > last || page === current) return;
    onPageChange?.(page);
  }

  return (
    <nav
      aria-label="Phân trang"
      className={classNames(
        "mt-5 flex flex-col gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-xs leading-5 text-muted">
        Hiển thị{" "}
        <span className="font-semibold text-ink">
          {from}–{to}
        </span>{" "}
        trong <span className="font-semibold text-ink">{meta.total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={loading || current <= 1}
          aria-label="Trang trước"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-steel/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, index) =>
          page === "gap" ? (
            <span
              key={`gap-${index}`}
              className="inline-flex h-8 w-6 items-center justify-center text-xs text-muted"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => goTo(page)}
              disabled={loading}
              aria-label={`Trang ${page}`}
              aria-current={page === current ? "page" : undefined}
              className={classNames(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed",
                page === current
                  ? "border-ink bg-ink text-white"
                  : "border-transparent text-muted hover:bg-mist/70 hover:text-ink",
              )}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={loading || current >= last}
          aria-label="Trang sau"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-steel/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
