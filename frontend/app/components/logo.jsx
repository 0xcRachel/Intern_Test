import { BookOpenCheck } from "lucide-react";
import { Link } from "react-router";

export function Logo({ compact = false, light = false }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none"
      aria-label="ExamPlatform - trang chủ"
    >
      <span
        className={
          light
            ? "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white"
            : "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-powder"
        }
      >
        <BookOpenCheck className="h-4 w-4" />
      </span>
      <span className="leading-none">
        <span
          className={
            light
              ? "block text-[15px] font-semibold tracking-tight text-white"
              : "block text-[15px] font-semibold tracking-tight text-ink"
          }
        >
          ExamPlatform
        </span>
        {!compact ? (
          <span
            className={
              light
                ? "mt-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-white/60"
                : "mt-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted"
            }
          >
            IELTS practice studio
          </span>
        ) : null}
      </span>
    </Link>
  );
}
