import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { RequireAuth } from "../components/auth-gate";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingScreen,
  PageHeader,
} from "../components/ui";
import { formatDate } from "../lib/format";

export function meta() {
  return [{ title: "Kết quả bài làm — ExamPlatform" }];
}

function ResultPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const [result, setResult] = useState(location.state?.result || null);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let stored = null;
    try {
      const raw = window.localStorage.getItem(`examplatform.attempt.${attemptId}.snapshot`);
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }
    if (active) {
      setSnapshot(stored);
      if (stored?.result && !result) setResult(stored.result);
    }

    api(`/attempts/${attemptId}`, { token })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((requestError) => {
        if (active && !stored?.result) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attemptId, token]);

  const questionMap = useMemo(() => {
    const map = new Map();
    (snapshot?.questions || []).forEach((question) => map.set(Number(question.id), question));
    return map;
  }, [snapshot]);

  if (loading && !result) {
    return (
      <>
        <LoadingScreen label="Đang tải kết quả..." />
      </>
    );
  }

  if (error && !result) {
    return (
      <>
        <Alert tone="error" title="Không tải được kết quả">
          {error}
        </Alert>
        <Link to="/exams" className="mt-5 inline-block">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Về danh sách đề
          </Button>
        </Link>
      </>
    );
  }

  if (!result) {
    return (
      <>
        <EmptyState
          icon={ClipboardCheck}
          title="Chưa có kết quả"
          description="Bài làm này chưa được nộp hoặc không còn khả dụng."
          action={
            <Link to="/exams">
              <Button variant="secondary">Về danh sách đề</Button>
            </Link>
          }
        />
      </>
    );
  }

  if (result.status && result.status !== "completed") {
    return (
      <>
        <EmptyState
          icon={Clock3}
          title="Bài làm đang tiếp diễn"
          description="Bài làm chưa được nộp. Quay lại để hoàn tất trước khi xem kết quả."
          action={
            <Link to={`/attempts/${attemptId}`}>
              <Button>Tiếp tục làm bài</Button>
            </Link>
          }
        />
      </>
    );
  }

  const percentage = Math.max(0, Math.min(100, Number(result.percentage) || 0));
  const wrongQuestions = result.wrong_questions || [];
  const totalQuestions = snapshot?.questions?.length
    ? snapshot.questions.length
    : wrongQuestions.length || 0;
  const correctQuestions = Math.max(0, totalQuestions - wrongQuestions.length);

  return (
    <>
      <PageHeader
        eyebrow="Kết quả bài làm"
        title={snapshot?.exam_title || "Kết quả luyện tập"}
        description="Điểm được chấm ở server. Bài đã hoàn thành sẽ được khóa để bảo toàn kết quả."
        actions={
          <Link to="/exams">
            <Button variant="secondary">
              <RotateCcw className="h-4 w-4" />
              Làm đề khác
            </Button>
          </Link>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="bg-ink p-6 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-powder">
                  Điểm của bạn
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">
                  {Number(result.score).toFixed(1)}
                  <span className="text-lg font-normal text-white/55"> / {Number(result.total_points).toFixed(0)}</span>
                </p>
              </div>
              <Badge tone={result.is_passed ? "success" : "danger"}>
                {result.is_passed ? "Đạt" : "Chưa đạt"}
              </Badge>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#9BC4D8 ${percentage * 3.6}deg, rgba(255,255,255,0.12) 0)`,
                }}
                aria-label={`Tỷ lệ đúng ${percentage}%`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-lg font-semibold">
                  {percentage.toFixed(0)}%
                </div>
              </div>
              <div className="text-xs leading-5 text-white/65">
                <p>{correctQuestions} câu đúng</p>
                <p>{wrongQuestions.length} câu cần xem lại</p>
                <p className="mt-1 text-white/40">
                  Nộp lúc {formatDate(result.end_time || result.submitted_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Điểm đạt</span>
              <span className="font-medium text-ink">{result.is_passed ? "Có" : "Chưa đạt ngưỡng"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Trạng thái</span>
              <Badge tone="neutral">Đã hoàn thành</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Tổng câu</span>
              <span className="font-medium text-ink">{totalQuestions || "—"}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                <ClipboardCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">Tóm tắt</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {result.is_passed
                    ? "Bạn đã đạt ngưỡng của đề này. Tiếp tục luyện tập để giữ nhịp."
                    : "Xem lại các câu chưa đúng, sau đó thử lại khi đã sẵn sàng."}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-line bg-canvas/60 p-3">
                <p className="text-xs text-muted">Đúng</p>
                <p className="mt-1 text-xl font-semibold text-success">{correctQuestions}</p>
              </div>
              <div className="rounded-md border border-line bg-canvas/60 p-3">
                <p className="text-xs text-muted">Cần xem lại</p>
                <p className="mt-1 text-xl font-semibold text-danger">{wrongQuestions.length}</p>
              </div>
              <div className="rounded-md border border-line bg-canvas/60 p-3">
                <p className="text-xs text-muted">Tỷ lệ</p>
                <p className="mt-1 text-xl font-semibold text-ink">{percentage.toFixed(0)}%</p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-ink">Câu cần xem lại</h2>
              <p className="mt-1 text-sm text-muted">
                Đáp án đúng được hiển thị sau khi bài làm đã được nộp.
              </p>
            </div>
            {wrongQuestions.length ? (
              <div className="divide-y divide-line">
                {wrongQuestions.map((wrong, index) => {
                  const question = questionMap.get(Number(wrong.question_id));
                  const selectedOption = question?.options?.find(
                    (option) => Number(option.id) === Number(wrong.selected_option_id),
                  );
                  const correctOption = question?.options?.find(
                    (option) => Number(option.id) === Number(wrong.correct_option_id),
                  );
                  return (
                    <div key={`${wrong.question_id}-${index}`} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fbeceb] text-danger">
                          <XCircle className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-6 text-ink">
                            {wrong.question_text || question?.question_text || `Câu ${wrong.question_id}`}
                          </p>
                          <div className="mt-2 grid gap-1.5 text-xs leading-5">
                            <p className="text-danger">
                              Bạn chọn:{" "}
                              {selectedOption?.option_text ||
                                (wrong.selected_option_id ? `Option #${wrong.selected_option_id}` : "Chưa trả lời")}
                            </p>
                            <p className="flex items-center gap-1.5 text-success">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Đáp án:{" "}
                              {correctOption?.option_text ||
                                (wrong.correct_option_id ? `Option #${wrong.correct_option_id}` : "—")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-8">
                <EmptyState
                  icon={CheckCircle2}
                  title="Không có câu sai"
                  description="Tất cả câu trả lời đều đúng. Bạn có thể thử đề khác để tiếp tục."
                />
              </div>
            )}
          </Card>

          <div className="flex flex-wrap gap-2">
            <Link to="/exams">
              <Button>
                Làm đề khác
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/packages">
              <Button variant="secondary">Xem tài liệu</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Result() {
  return (
    <RequireAuth>
      <ResultPage />
    </RequireAuth>
  );
}
