import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { RequireAuth } from "../components/auth-gate";
import { Pagination } from "../components/pagination";
import { Reveal } from "../components/reveal";
import { classNames } from "../lib/format";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Skeleton,
  Spinner,
} from "../components/ui";

export function meta() {
  return [{ title: "Đề luyện tập — ExamPlatform" }];
}

function ExamsPage() {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startLoading, setStartLoading] = useState(null);

  async function loadExams(query = search, page = 1) {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      params.set("per_page", "12");
      params.set("page", String(page));
      const data = await api(`/exams?${params.toString()}`, { token });
      setExams(data?.data || []);
      setMeta(data?.meta || null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExams("", 1);
  }, [token]);

  async function handleStart(exam) {
    setStartLoading(exam.id);
    setError("");
    try {
      const attempt = await api(`/exams/${exam.id}/attempts`, {
        method: "POST",
        token,
      });
      navigate(`/attempts/${attempt.id}`, { state: { attempt } });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setStartLoading(null);
    }
  }

  const totalQuestions = exams.reduce(
    (total, exam) => total + Number(exam.questions_count ?? exam.questions?.length ?? 0),
    0,
  );
  const totalMinutes = exams.reduce(
    (total, exam) => total + Number(exam.duration_minutes || 0),
    0,
  );
  const averageMinutes = exams.length ? Math.round(totalMinutes / exams.length) : 0;
  const heroStats = [
    { label: "Đề đang mở", value: meta?.total ?? exams.length },
    { label: "Câu hỏi", value: totalQuestions },
    { label: "Phút / đề", value: averageMinutes },
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-ink bg-ink px-6 py-7 text-white sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-powder/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-sand/15 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 text-[150px] font-semibold leading-none tracking-tighter text-white/[0.035] xl:block">
          IELTS
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-powder">
              <Sparkles className="h-3.5 w-3.5" />
              Không gian luyện đề
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.035em] sm:text-4xl">
              Làm đề có kiểm soát,
              <br className="hidden sm:block" /> tiến bộ từng lượt.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
              Mỗi lượt có đồng hồ riêng, câu trả lời được lưu tự động và kết quả chấm ở server.
              Chọn một đề bên dưới để bắt đầu khi bạn đã sẵn sàng.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Button
                onClick={() => (exams[0] ? handleStart(exams[0]) : undefined)}
                disabled={!exams.length || loading || Boolean(startLoading)}
                className="bg-powder text-ink hover:bg-[#8bb9cf]"
              >
                {startLoading ? <Spinner /> : <Play className="h-4 w-4" />}
                {loading ? "Đang tải đề" : "Bắt đầu đề đầu tiên"}
              </Button>
              <Link to="/packages">
                <Button
                  variant="ghost"
                  className="border-white/15 text-white hover:bg-white/10"
                >
                  <BookOpen className="h-4 w-4" />
                  Ôn tài liệu trước
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/[0.045] p-2.5 backdrop-blur">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-lg px-3 py-3 text-center">
                <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/45">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Card className="mt-5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form
            className="flex w-full max-w-xl gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              loadExams(search, 1);
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="exam-search"
                name="search"
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm đề theo tên..."
                aria-label="Tìm đề"
              />
            </div>
            <Button type="submit" variant="secondary">
              Tìm
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">
              {meta?.total ?? exams.length} đề khả dụng
            </span>
            {isAdmin ? <Badge tone="blue">Đang xem với quyền admin</Badge> : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadExams(search, meta?.current_page || 1)}
              disabled={loading}
              className="text-muted"
            >
              <RefreshCw className={classNames("h-3.5 w-3.5", loading && "animate-spin")} />
              Tải lại
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <Alert className="mt-5" tone="error" title="Không tải được đề">
          {error}
        </Alert>
      ) : null}

      {loading && !exams.length ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : exams.length ? (
        <>
          <div
            className={classNames(
              "mt-6 grid gap-4 transition-opacity duration-200 lg:grid-cols-2",
              loading && "pointer-events-none opacity-55",
            )}
            aria-busy={loading}
          >
            {exams.map((exam, index) => {
              const questionCount =
                exam.questions_count ?? exam.questions?.length ?? 0;

              return (
                <Reveal key={exam.id} delay={index * 0.04}>
                  <Card className="group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-steel/40 hover:shadow-[0_18px_45px_-28px_rgba(20,35,44,0.4)]">
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-muted">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <Badge tone="blue">IELTS Reading</Badge>
                        </div>
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-mist/50 text-steel transition-colors group-hover:border-steel/40">
                          <FileQuestion className="h-5 w-5" />
                        </span>
                      </div>

                      <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                        {exam.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                        {exam.description || "Đề luyện tập chưa có mô tả."}
                      </p>

                      <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-canvas/45 py-3">
                        <div className="px-3 text-center">
                          <Clock3 className="mx-auto h-3.5 w-3.5 text-steel" />
                          <p className="mt-1.5 text-sm font-semibold text-ink">
                            {exam.duration_minutes}
                          </p>
                          <p className="text-[10px] text-muted">phút</p>
                        </div>
                        <div className="px-3 text-center">
                          <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-steel" />
                          <p className="mt-1.5 text-sm font-semibold text-ink">{questionCount}</p>
                          <p className="text-[10px] text-muted">câu hỏi</p>
                        </div>
                        <div className="px-3 text-center">
                          <Target className="mx-auto h-3.5 w-3.5 text-steel" />
                          <p className="mt-1.5 text-sm font-semibold text-ink">
                            {exam.passing_score}%
                          </p>
                          <p className="text-[10px] text-muted">để đạt</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-raised px-5 py-4">
                      <span className="text-xs leading-5 text-muted">
                        Lưu câu trả lời tự động
                      </span>
                      <Button
                        onClick={() => handleStart(exam)}
                        disabled={startLoading === exam.id}
                        size="sm"
                      >
                        {startLoading === exam.id ? <Spinner /> : <Play className="h-3.5 w-3.5" />}
                        Bắt đầu
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>

          <Pagination
            meta={meta}
            onPageChange={(page) => loadExams(search, page)}
            loading={loading}
            itemLabel="đề"
          />
        </>
      ) : !error ? (
        <div className="mt-6">
          <EmptyState
            icon={FileQuestion}
            title={search ? "Không tìm thấy đề phù hợp" : "Chưa có đề luyện tập"}
            description={
              search
                ? "Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ đề."
                : "Đề sẽ xuất hiện tại đây khi quản trị viên tạo đề mới."
            }
            action={
              search ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    loadExams("", 1);
                  }}
                >
                  Xóa tìm kiếm
                </Button>
              ) : null
            }
          />
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-xl border border-line bg-surface-raised">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist text-steel">
              <BookOpen className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Chuẩn bị trước khi bấm giờ</p>
              <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                Ôn lại từ vựng, audio và chiến lược làm bài trong thư viện tài liệu. Một lượt làm
                đề hiệu quả bắt đầu từ vài phút chuẩn bị.
              </p>
            </div>
          </div>
          <Link
            to="/packages"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-steel transition-colors hover:text-ink"
          >
            Mở thư viện
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

export default function Exams() {
  return (
    <RequireAuth>
      <ExamsPage />
    </RequireAuth>
  );
}
