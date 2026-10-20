import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  BarChart3,
  FileQuestion,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../context/auth";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  StatCard,
} from "../../components/ui";

export function meta() {
  return [{ title: "Thống kê đề — ExamPlatform" }];
}

export default function AdminStatistics() {
  const { examId } = useParams();
  const { token } = useAuth();
  const [exam, setExam] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [examData, statsData] = await Promise.all([
        api(`/admin/exams/${examId}`, { token }),
        api(`/admin/exams/${examId}/statistics`, { token }),
      ]);
      setExam(examData?.data || examData);
      setStats(statsData);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [examId, token]);

  return (
    <>
      <Link
        to="/admin/exams"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Quản lý đề
      </Link>

      <div className="mt-3">
        <PageHeader
          eyebrow="Thống kê"
          title={exam?.title || "Kết quả theo đề"}
          description="Số lượt hoàn thành, điểm trung bình và những câu học viên sai nhiều nhất."
          actions={
            <>
              <Button variant="secondary" onClick={load} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
                Tải lại
              </Button>
              <Link to={`/admin/exams/${examId}/questions`}>
                <Button variant="secondary">
                  <FileQuestion className="h-4 w-4" />
                  Câu hỏi
                </Button>
              </Link>
            </>
          }
        />
      </div>

      {error ? (
        <Alert className="mt-5" tone="error" title="Không tải được thống kê">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : stats ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Lượt hoàn thành"
              value={stats.total_completed_attempts ?? 0}
              hint="Bài đã nộp và được chấm"
              tone="dark"
            />
            <StatCard
              label="Điểm trung bình"
              value={Number(stats.average_score ?? 0).toFixed(1)}
              hint="Trên thang điểm của đề"
              tone="blue"
            />
            <StatCard
              label="Điểm cao nhất"
              value={Number(stats.highest_score ?? 0).toFixed(1)}
              hint="Kết quả tốt nhất ghi nhận"
              tone="sand"
            />
            <StatCard
              label="Điểm thấp nhất"
              value={Number(stats.lowest_score ?? 0).toFixed(1)}
              hint="Kết quả cần cải thiện"
            />
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                <TrendingUp className="h-4 w-4 text-steel" />
                <h2 className="text-base font-semibold text-ink">Học viên nổi bật</h2>
              </div>
              {(stats.top_students || []).length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="border-b border-line bg-canvas/60 text-xs uppercase tracking-[0.08em] text-muted">
                      <tr>
                        <th className="px-5 py-3 font-medium">#</th>
                        <th className="px-5 py-3 font-medium">Học viên</th>
                        <th className="px-5 py-3 font-medium">Cao nhất</th>
                        <th className="px-5 py-3 font-medium">Trung bình</th>
                        <th className="px-5 py-3 font-medium">Lượt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {stats.top_students.map((student, index) => (
                        <tr key={`${student.user_id}-${index}`}>
                          <td className="px-5 py-3 text-muted">{index + 1}</td>
                          <td className="px-5 py-3 font-medium text-ink">{student.user_name}</td>
                          <td className="px-5 py-3 text-ink">{Number(student.highest_score).toFixed(1)}</td>
                          <td className="px-5 py-3 text-muted">{Number(student.avg_score).toFixed(1)}</td>
                          <td className="px-5 py-3 text-muted">{student.attempts_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-5">
                  <EmptyState
                    icon={BarChart3}
                    title="Chưa có lượt hoàn thành"
                    description="Bảng xếp hạng sẽ xuất hiện sau khi học viên nộp bài."
                  />
                </div>
              )}
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                <TrendingDown className="h-4 w-4 text-danger" />
                <h2 className="text-base font-semibold text-ink">Câu sai nhiều nhất</h2>
              </div>
              {(stats.most_incorrect_questions || []).length ? (
                <div className="divide-y divide-line">
                  {stats.most_incorrect_questions.map((item, index) => (
                    <div key={`${item.question_id}-${index}`} className="flex items-start justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-6 text-ink">
                          {item.question_text || `Câu #${item.question_id}`}
                        </p>
                        <p className="mt-1 text-xs text-muted">Mã câu hỏi: {item.question_id}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#efc8c4] bg-[#fbeceb] px-2.5 py-1 text-xs font-semibold text-danger">
                        {item.incorrect_count} lần sai
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5">
                  <EmptyState
                    icon={FileQuestion}
                    title="Chưa có dữ liệu câu sai"
                    description="Dữ liệu sẽ được tổng hợp từ các bài đã nộp."
                  />
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </>
  );
}
