import { useEffect, useState } from "react";
import {
  BookOpen,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { PackageCard } from "../components/package-card";
import { Pagination } from "../components/pagination";
import { Reveal } from "../components/reveal";
import { useNotifications } from "../components/notifications";
import {
  Button,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
} from "../components/ui";
import { classNames } from "../lib/format";

export function meta() {
  return [{ title: "Tài liệu IELTS — ExamPlatform" }];
}

const levels = [
  { value: "", label: "Tất cả" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export default function Packages() {
  const notifications = useNotifications();
  const [packages, setPackages] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ per_page: "9", page: String(page) });
    if (appliedSearch.trim()) params.set("search", appliedSearch.trim());
    if (level) params.set("level", level);

    api(`/packages?${params.toString()}`)
      .then((data) => {
        if (!active) return;
        setPackages(data?.data || []);
        setMeta(data?.meta || null);
      })
      .catch((requestError) => {
        if (active) notifications.error(errorMessage(requestError), { title: "Không tải được tài liệu" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, level, appliedSearch, reloadKey]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  }

  function handleLevel(nextLevel) {
    setLevel(nextLevel);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setAppliedSearch("");
    setLevel("");
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1216px] px-5 py-10 sm:px-6 sm:py-14">
      <PageHeader
          eyebrow="Thư viện IELTS"
          title="Đầu tư vào đúng tài liệu"
          description="So sánh lộ trình, xem cấu trúc unit và preview trước khi quyết định. Mỗi khóa học đi kèm tài liệu PDF, audio và đề luyện tập."
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setReloadKey((value) => value + 1);
              }}
              disabled={loading}
            >
              <RefreshCw className={classNames("h-4 w-4", loading && "animate-spin")} />
              Tải lại
            </Button>
          }
        />

        <Reveal className="mt-6 rounded-xl border border-line bg-surface-raised p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Trình độ:
              </span>
              {levels.map((item) => (
                <button
                  key={item.value || "all"}
                  type="button"
                  onClick={() => handleLevel(item.value)}
                  className={classNames(
                    "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                    level === item.value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-canvas/45 text-muted hover:border-steel/50 hover:text-ink",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex w-full gap-2 lg:max-w-sm">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="package-search"
                  name="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tên hoặc mô tả..."
                  aria-label="Tìm khóa học"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary">
                Tìm
              </Button>
            </form>
          </div>
          {(appliedSearch || level) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-muted">
              <span>
                {meta?.total ?? packages.length} kết quả
                {appliedSearch ? ` cho “${appliedSearch}”` : ""}
                {level ? ` · ${level}` : ""}
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-steel hover:text-ink"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </Reveal>


        {loading && !packages.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-[430px]" />
            <Skeleton className="h-[430px]" />
            <Skeleton className="h-[430px]" />
          </div>
        ) : packages.length ? (
          <>
            <div
              className={classNames(
                "mt-8 grid gap-5 transition-opacity duration-200 md:grid-cols-2 xl:grid-cols-3",
                loading && "pointer-events-none opacity-55",
              )}
              aria-busy={loading}
            >
              {packages.map((packageItem, index) => (
                <Reveal key={packageItem.id} delay={index * 0.04}>
                  <PackageCard packageItem={packageItem} />
                </Reveal>
              ))}
            </div>
            <Pagination
              meta={meta}
              onPageChange={(nextPage) => setPage(nextPage)}
              loading={loading}
              itemLabel="tài liệu"
              className="mt-8"
            />
          </>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={BookOpen}
              title="Không tìm thấy tài liệu phù hợp"
              description="Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ thư viện."
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              }
            />
          </div>
        )}
      </div>
  );
}
