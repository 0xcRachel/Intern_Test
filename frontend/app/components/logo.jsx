import { BookOpenCheck } from "lucide-react";
import { Link } from "react-router";

export function Logo({ compact = false, light = false }) {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center gap-2.5 rounded-xl"
      aria-label="ExamPlatform - trang chủ"
    >
      <span
        className={
          light
            ? "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-steel text-white shadow-md"
            : "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-steel text-white shadow-[0_4px_12px_-3px_#3659e350]"
        }
      >
        <BookOpenCheck className="h-5 w-5" strokeWidth={1.7} />
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
                : "mt-1 hidden text-[9px] font-medium uppercase tracking-[0.18em] text-muted sm:block"
            }
          >
            IELTS practice studio
          </span>
        ) : null}
      </span>
    </Link>
  );
}
