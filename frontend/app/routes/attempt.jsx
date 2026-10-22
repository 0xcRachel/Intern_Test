import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  RefreshCw,
  Save,
  Send,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { RequireAuth } from "../components/auth-gate";
import { useNotifications } from "../components/notifications";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  LoadingScreen,
  Spinner,
} from "../components/ui";
import {
  answersToPayload,
  formatTime,
  normalizeSavedAnswers,
} from "../lib/format";

export function meta() {
  return [{ title: "Làm bài — ExamPlatform" }];
}

function AttemptPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const notifications = useNotifications();
  const initialAttempt = location.state?.attempt;

  const [attempt, setAttempt] = useState(initialAttempt || null);
  const [questions, setQuestions] = useState(initialAttempt?.questions || []);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(!initialAttempt);
  const [timeLeft, setTimeLeft] = useState(
    initialAttempt ? (initialAttempt.duration_minutes || 60) * 60 : 0,
  );
  const [autosaveStatus, setAutosaveStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState("");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const answersRef = useRef({});
  const submittedRef = useRef(false);
  const saveTimerRef = useRef(null);
  const saveQueueRef = useRef(Promise.resolve());
  const pendingSaveRef = useRef(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!attempt) return;

    const savedCount = Object.values(normalizeSavedAnswers(attempt.saved_answers)).filter(
      (value) => value != null,
    ).length;

    if (savedCount > 0) {
      notifications.info(`Đã khôi phục ${savedCount} câu trả lời đã lưu trước đó.`, {
        title: "Tiếp tục bài làm",
        duration: 3500,
      });
    } else if (initialAttempt?.attempt_id || initialAttempt?.id) {
      notifications.info("Bài làm đã sẵn sàng. Câu trả lời sẽ được tự động lưu.", {
        title: "Bắt đầu luyện tập",
        duration: 3500,
      });
    }
  }, [attempt?.attempt_id]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    api(`/attempts/${attemptId}/resume`, { token })
      .then((data) => {
        if (!active) return;
        setAttempt(data);
        if (data.status === "completed") {
          navigate(`/attempts/${attemptId}/result`, { replace: true });
          return;
        }
        setQuestions(data.questions || []);
        const normalized = normalizeSavedAnswers(data.saved_answers);
        setAnswers(normalized);
        answersRef.current = normalized;
        setTimeLeft(Math.max(0, Number(data.remaining_seconds) || 0));
        setActiveQuestionId(data.questions?.[0]?.id ?? null);
        const savedCount = Object.values(normalized).filter((value) => value != null).length;
        if (savedCount > 0) {
          notifications.info(`Đã khôi phục ${savedCount} câu trả lời đã lưu trước đó.`, {
            title: "Tiếp tục bài làm",
            duration: 3500,
          });
        }
      })
      .catch((requestError) => {
        if (active) notifications.error(errorMessage(requestError), { title: "Không mở được bài làm" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attemptId, token, navigate]);

  useEffect(() => {
    if (!attempt || loading || submitting || submittedRef.current) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => submitExam(true), 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // submitExam is intentionally read through the latest render via the
    // answers ref; the timer itself only needs to restart for a new attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.attempt_id, loading, submitting]);

  useEffect(
    () => () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    },
    [],
  );

  async function saveAnswers(nextAnswers) {
    if (!attempt || submittedRef.current) return;
    pendingSaveRef.current = nextAnswers;
    const queued = saveQueueRef.current.then(async () => {
      const answersToSave = pendingSaveRef.current;
      pendingSaveRef.current = null;
      if (!answersToSave || !attempt || submittedRef.current) return;
      setAutosaveStatus("saving");
      try {
        const data = await api(`/attempts/${attempt.attempt_id}/save`, {
          method: "POST",
          token,
          body: { answers: answersToPayload(answersToSave) },
        });
        setAutosaveStatus("saved");
        setLastSaved(data?.saved_at ? new Date(data.saved_at).toLocaleTimeString("vi-VN") : "");
      } catch {
        setAutosaveStatus("error");
        notifications.warning("Đáp án chưa được lưu. Hệ thống sẽ thử lại ở lần thay đổi tiếp theo.", {
          title: "Autosave tạm thời thất bại",
        });
      }
    });
    saveQueueRef.current = queued.catch(() => undefined);
    return queued;
  }

  function handleSelect(questionId, optionId) {
    if (submitting || submittedRef.current) return;
    const next = { ...answersRef.current, [String(questionId)]: optionId };
    setAnswers(next);
    answersRef.current = next;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => saveAnswers(next), 120);
  }

  async function submitExam(auto = false) {
    if (!attempt || submitting || submittedRef.current) return;
    setSubmitting(true);
    const unansweredCount = questions.length - Object.values(answersRef.current).filter(
      (value) => value != null,
    ).length;
    if (unansweredCount > 0 && !auto) {
      notifications.warning(`Bạn còn ${unansweredCount} câu chưa trả lời. Kiểm tra lại trước khi nộp.`, {
        title: "Bài làm chưa hoàn tất",
        duration: 5000,
      });
    }
    try {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      await saveAnswers(answersRef.current);
      const payload = answersToPayload(answersRef.current);
      const result = await api(`/attempts/${attempt.attempt_id}/submit`, {
        method: "POST",
        token,
        body: { answers: payload },
      });
      submittedRef.current = true;
      try {
        window.localStorage.setItem(
          `examplatform.attempt.${attempt.attempt_id}.snapshot`,
          JSON.stringify({
            exam_title: attempt.exam_title,
            questions,
            answers: answersRef.current,
            result,
          }),
        );
      } catch {
        // A browser with storage disabled can still use the backend result.
      }
      navigate(`/attempts/${attempt.attempt_id}/result`, {
        replace: true,
        state: { result, questions, answers: answersRef.current },
      });
    } catch (requestError) {
      const message = errorMessage(requestError);
      if (requestError?.status === 422 && /already been submitted/i.test(message)) {
        navigate(`/attempts/${attempt.attempt_id}/result`, { replace: true });
      } else {
        notifications.error(message, { title: "Không thể nộp bài" });
        if (!auto) setSubmitOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToQuestion(questionId) {
    setActiveQuestionId(questionId);
    const element = document.getElementById(`question-${questionId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading && !attempt) {
    return (
      <>
        <LoadingScreen label="Đang tải bài làm..." />
      </>
    );
  }

  if (!attempt) {
    return (
      <>
        <p className="text-sm text-muted">Không thể mở bài làm. Vui lòng thử lại từ danh sách đề.</p>
        <Link to="/exams" className="mt-5 inline-block">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Về danh sách đề
          </Button>
        </Link>
      </>
    );
  }

  if (!attempt || !questions.length) {
    return (
      <>
        <EmptyState
          icon={Flag}
          title="Bài làm chưa có câu hỏi"
          description="Đề này chưa có câu hỏi hoặc bài làm không còn khả dụng."
          action={
            <Link to="/exams">
              <Button variant="secondary">Về danh sách đề</Button>
            </Link>
          }
        />
      </>
    );
  }

  const answeredCount = Object.values(answers).filter((value) => value != null).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/exams" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
            Đề luyện tập
          </Link>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {attempt.exam_title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={timeLeft < 300 ? "danger" : "blue"}>
            <Clock3 className="mr-1 h-3 w-3" />
            {formatTime(timeLeft)}
          </Badge>
          <Badge tone={autosaveStatus === "error" ? "danger" : autosaveStatus === "saved" ? "success" : "neutral"}>
            {autosaveStatus === "saving" ? (
              <Spinner className="mr-1 h-3 w-3" />
            ) : autosaveStatus === "saved" ? (
              <Check className="mr-1 h-3 w-3" />
            ) : (
              <Save className="mr-1 h-3 w-3" />
            )}
            {autosaveStatus === "saving"
              ? "Đang lưu"
              : autosaveStatus === "saved"
                ? lastSaved || "✓"
                : autosaveStatus === "error"
                  ? "Lưu lỗi"
                  : "Chưa lưu"}
          </Badge>
          <Button onClick={() => setSubmitOpen(true)} disabled={submitting} size="sm">
            <Send className="h-3.5 w-3.5" />
            Nộp bài
          </Button>
        </div>
      </div>


      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {questions.map((question, index) => {
            const selected = answers[String(question.id)];
            return (
              <Card
                id={`question-${question.id}`}
                key={question.id}
                className="scroll-mt-24 p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">
                    Câu {index + 1} / {questions.length}
                  </p>
                  <Badge tone="neutral">{question.points} điểm</Badge>
                </div>
                <h2 className="mt-3 text-base font-medium leading-7 text-ink sm:text-lg">
                  {question.question_text}
                </h2>
                <div className="mt-4 space-y-2" role="radiogroup" aria-label={`Câu ${index + 1}`}>
                  {(question.options || []).map((option) => {
                    const isSelected = Number(selected) === Number(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelect(question.id, option.id)}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm leading-6 transition-colors ${
                          isSelected
                            ? "border-steel bg-mist/70 text-ink"
                            : "border-line bg-surface-raised text-muted hover:border-[#bfcdd2] hover:bg-mist/35"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? "border-steel bg-surface-raised" : "border-line"
                          }`}
                        >
                          {isSelected ? <Check className="h-3.5 w-3.5 text-steel" /> : null}
                        </span>
                        {option.option_text}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        <aside className="order-first lg:order-last">
          <div className="sticky top-20 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Tiến độ</span>
                <span className="font-medium text-ink">
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-steel transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = answers[String(question.id)] != null;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => scrollToQuestion(question.id)}
                      className={`flex h-9 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                        activeQuestionId === question.id
                          ? "border-steel bg-steel text-white"
                          : isAnswered
                            ? "border-[#c8dfd1] bg-[#eef6f0] text-success"
                            : "border-line bg-canvas text-muted hover:border-steel/60"
                      }`}
                      aria-label={`Đi tới câu ${index + 1}${isAnswered ? " đã trả lời" : ""}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] leading-5 text-muted">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Đã trả lời
                <span className="ml-2 inline-block h-2.5 w-2.5 rounded-sm border border-line bg-canvas" />
                Chưa trả lời
              </p>
            </Card>

            <Card className="bg-sand/25 p-4">
              <p className="text-sm font-semibold text-ink">Lưu ý khi nộp</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Kiểm tra các câu chưa trả lời. Bài đã nộp sẽ không thể sửa lại.
              </p>
              <Button className="mt-3 w-full" onClick={() => setSubmitOpen(true)} disabled={submitting}>
                Nộp bài
              </Button>
            </Card>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onConfirm={() => submitExam(false)}
        title="Nộp bài luyện tập?"
        description={
          answeredCount < questions.length
            ? `Bạn còn ${questions.length - answeredCount} câu chưa trả lời.`
            : "Tất cả câu đã được trả lời."
        }
        confirmLabel="Nộp bài"
        loading={submitting}
      />
    </>
  );
}

export default function Attempt() {
  return (
    <RequireAuth>
      <AttemptPage />
    </RequireAuth>
  );
}
