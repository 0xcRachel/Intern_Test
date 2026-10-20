import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  BarChart3,
  ClipboardList,
  Clock3,
  FileQuestion,
  ListChecks,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../context/auth";
import { Pagination } from "../../components/pagination";
import { Reveal } from "../../components/reveal";
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
  Spinner,
} from "../../components/ui";
import { formatDate } from "../../lib/format";

export function meta() {
  return [{ title: "Quản lý đề — ExamPlatform" }];
}

export default function AdminExams() {
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load(query = search, page = 1) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        per_page: "20",
        page: String(page),
      });
      if (query.trim()) params.set("search", query.trim());
      const data = await api(`/admin/exams?${params.toString()}`, { token });
      setExams(data?.data || []);
      setMeta(data?.meta || null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("", 1);
  }, [token]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      await api(`/admin/exams/${deleteTarget.id}`, { method: "DELETE", token });
      setDeleteTarget(null);
      await load(search, meta?.current_page || 1);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  }

  const totalQuestions = exams.reduce(
    (total, exam) => total + (exam.questions?.length ?? exam.questions_count ?? 0),
    0,
  );
  const averageDuration = exams.length
    ? Math.round(
        exams.reduce((total, exam) => total + (Number(exam.duration_minutes) || 0), 0) /
          exams.length,
      )
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="Quản lý nội dung"
        title="Đề luyện tập"
        description="Tạo đề, quản lý câu hỏi và mở thống kê kết quả của từng đề."
        actions={
          <>
            <Button variant="secondary" onClick={() => load(search, 1)} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Tải lại
            </Button>
            <Link to="/admin/exams/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo đề
              </Button>
            </Link>
          </>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Reveal>
          <Card className="flex items-center gap-3 p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-steel">
              <ClipboardList className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Tổng số đề
              </p>
              <p className="mt-1 text-xl font-semibold text-ink">{meta?.total ?? exams.length}</p>
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.04}>
          <Card className="flex items-center gap-3 p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-steel">
              <ListChecks className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Câu hỏi trên trang
              </p>
              <p className="mt-1 text-xl font-semibold text-ink">{totalQuestions}</p>
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card className="flex items-center gap-3 p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-steel">
              <Clock3 className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Thời lượng trung bình
              </p>
              <p className="mt-1 text-xl font-semibold text-ink">{averageDuration} phút</p>
            </div>
          </Card>
        </Reveal>
      </div>

      <Card className="mt-5 p-4">
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            load(search, 1);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="admin-exam-search"
              name="search"
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên đề..."
              aria-label="Tìm đề quản trị"
            />
          </div>
          <Button type="submit" variant="secondary">Tìm</Button>
          {search ? (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                load("", 1);
              }}
            >
              Xóa lọc
            </Button>
          ) : null}
          <span className="ml-auto hidden text-xs text-muted sm:block">
            {meta?.total ?? exams.length} đề
          </span>
        </form>
      </Card>

      {error ? (
        <Alert className="mt-5" tone="error" title="Không tải được đề">
          {error}
        </Alert>
      ) : null}

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-line bg-canvas/45 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Danh sách đề luyện tập</h2>
            <p className="mt-1 text-xs text-muted">
              Mở câu hỏi, xem thống kê hoặc cập nhật cấu hình của từng đề.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Đang hiển thị {exams.length} đề
          </span>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : exams.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[31%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[16%]" />
                <col className="w-[25%]" />
              </colgroup>
              <thead className="border-b border-line bg-canvas/60 text-xs uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">Đề</th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">Thời lượng</th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">Câu hỏi</th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">Ngưỡng đạt</th>
                  <th className="whitespace-nowrap px-5 py-3 font-medium">Cập nhật</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {exams.map((exam) => (
                  <tr key={exam.id} className="align-top transition-colors hover:bg-canvas/45">
                    <td className="px-5 py-4">
                      <p className="truncate font-medium text-ink">{exam.title}</p>
                      <p className="mt-1 truncate text-xs text-muted">
                        {exam.description || "Chưa có mô tả"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {exam.duration_minutes} phút
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {exam.questions?.length ?? exam.questions_count ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {exam.passing_score}%
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-muted">
                      {formatDate(exam.updated_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-nowrap items-center justify-end gap-1.5">
                        <Link to={`/admin/exams/${exam.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 px-0"
                            title={`Sửa ${exam.title}`}
                            aria-label={`Sửa ${exam.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/exams/${exam.id}/questions`}>
                          <Button variant="secondary" size="sm" className="whitespace-nowrap">
                            <FileQuestion className="h-3.5 w-3.5" />
                            Câu hỏi
                          </Button>
                        </Link>
                        <Link to={`/admin/exams/${exam.id}/statistics`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 px-0"
                            title={`Thống kê ${exam.title}`}
                            aria-label={`Thống kê ${exam.title}`}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <span className="mx-0.5 h-5 w-px bg-line" aria-hidden="true" />
                        <Button
                          variant="danger"
                          size="sm"
                          className="h-9 w-9 px-0"
                          title={`Xóa ${exam.title}`}
                          aria-label={`Xóa ${exam.title}`}
                          onClick={() => setDeleteTarget(exam)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={FileQuestion}
              title={search ? "Không tìm thấy đề" : "Chưa có đề luyện tập"}
              description={
                search
                  ? "Thử từ khóa khác hoặc xóa bộ lọc."
                  : "Tạo đề đầu tiên để bắt đầu thêm câu hỏi."
              }
              action={
                <Link to="/admin/exams/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Tạo đề
                  </Button>
                </Link>
              }
            />
          </div>
        )}
      </Card>

      {meta ? (
        <Pagination
          meta={meta}
          onPageChange={(page) => load(search, page)}
          loading={loading}
          itemLabel="đề"
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa đề luyện tập?"
        description={deleteTarget ? `Đề “${deleteTarget.title}” và toàn bộ câu hỏi liên quan sẽ bị xóa.` : ""}
        confirmLabel="Xóa đề"
        loading={deleting}
        tone="danger"
      />
    </>
  );
}
