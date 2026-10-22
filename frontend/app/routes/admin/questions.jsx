import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  ListChecks,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../context/auth";
import { AiQuestionAssistant } from "../../components/ai-question-assistant";
import { useNotifications } from "../../components/notifications";
import { Reveal } from "../../components/reveal";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Skeleton,
} from "../../components/ui";

export function meta() {
  return [{ title: "Câu hỏi của đề — ExamPlatform" }];
}

export default function AdminQuestions() {
  const { examId } = useParams();
  const { token } = useAuth();
  const notifications = useNotifications();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [examData, questionsData] = await Promise.all([
        api(`/admin/exams/${examId}`, { token }),
        api(`/admin/exams/${examId}/questions`, { token }),
      ]);
      setExam(examData?.data || examData);
      setQuestions(questionsData?.data || []);
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Không tải được câu hỏi" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [examId, token]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/admin/questions/${deleteTarget.id}`, { method: "DELETE", token });
      setDeleteTarget(null);
      await load();
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Không thể xóa câu hỏi" });
    } finally {
      setDeleting(false);
    }
  }

  const totalPoints = questions.reduce(
    (total, question) => total + (Number(question.points) || 0),
    0,
  );
  const correctOptions = questions.reduce(
    (total, question) =>
      total + (question.options || []).filter((option) => option.is_correct).length,
    0,
  );

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
          eyebrow="Nội dung đề"
          title={exam?.title || "Câu hỏi"}
          description={exam?.description || "Quản lý câu hỏi và đáp án của đề."}
          actions={
            <>
              <Button
                variant={assistantOpen ? "dark" : "secondary"}
                onClick={() => setAssistantOpen((value) => !value)}
                disabled={!exam}
              >
                {assistantOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {assistantOpen ? "Đóng AI" : "AI hỗ trợ"}
              </Button>
              <Button variant="secondary" onClick={load} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
                Tải lại
              </Button>
              <Link to={`/admin/exams/${examId}/statistics`}>
                <Button variant="secondary">
                  <BarChart3 className="h-4 w-4" />
                  Thống kê
                </Button>
              </Link>
              <Link to={`/admin/exams/${examId}/questions/new`}>
                <Button>
                  <Plus className="h-4 w-4" />
                  Thêm câu hỏi
                </Button>
              </Link>
            </>
          }
        />
      </div>


      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-steel">
            <ListChecks className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Câu hỏi
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {loading ? "—" : questions.length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-steel">
            <Award className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Tổng điểm
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {loading ? "—" : totalPoints}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-steel">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Đáp án đúng
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {loading ? "—" : correctOptions}
            </p>
          </div>
        </Card>
      </div>

      {assistantOpen ? (
        <div className="mt-5">
          <AiQuestionAssistant exams={exam ? [exam] : []} token={token} onCreated={load} />
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : questions.length ? (
        <div className="mt-6 space-y-4">
          {questions.map((question, index) => (
            <Reveal key={question.id} delay={Math.min(index * 0.03, 0.18)}>
            <Card className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-line bg-canvas/45 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-semibold text-powder">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-6 text-ink">{question.question_text}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="neutral">{question.type === "single_choice" ? "Một đáp án" : "Nhiều đáp án"}</Badge>
                      <Badge tone="blue">{question.points} điểm</Badge>
                      <Badge tone="sand">{(question.options || []).length} lựa chọn</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Link to={`/admin/exams/${examId}/questions/${question.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(question)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-line">
                {(question.options || []).map((option) => (
                  <div key={option.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        option.is_correct
                          ? "border-[#c8dfd1] bg-[#eef6f0] text-success"
                          : "border-line bg-canvas text-muted"
                      }`}
                    >
                      {option.is_correct ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    </span>
                    <p className={option.is_correct ? "font-medium text-ink" : "text-muted"}>
                      {option.option_text}
                      {option.is_correct ? (
                        <span className="ml-2 text-[11px] font-medium text-success">Đáp án đúng</span>
                      ) : null}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={Plus}
            title="Đề chưa có câu hỏi"
            description="Thêm câu hỏi và ít nhất hai lựa chọn, trong đó có một đáp án đúng."
            action={
              <Link to={`/admin/exams/${examId}/questions/new`}>
                <Button>
                  <Plus className="h-4 w-4" />
                  Thêm câu hỏi
                </Button>
              </Link>
            }
          />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa câu hỏi?"
        description="Câu hỏi và các lựa chọn của câu này sẽ bị xóa khỏi đề."
        confirmLabel="Xóa câu hỏi"
        loading={deleting}
        tone="danger"
      />
    </>
  );
}
