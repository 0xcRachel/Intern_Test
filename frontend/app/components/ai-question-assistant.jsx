import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleCheck,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { buildQuestionDrafts, DIFFICULTIES, SKILLS } from "../lib/ai-question-bank";
import { useNotifications } from "./notifications";
import { Badge, Button, Card, Field, Select, Spinner } from "./ui";

export function AiQuestionAssistant({ exams = [], token, onCreated }) {
  const notifications = useNotifications();
  const [examId, setExamId] = useState(exams[0]?.id || "");
  const [skill, setSkill] = useState("Reading");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [count, setCount] = useState(3);
  const [drafts, setDrafts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastExamId, setLastExamId] = useState("");

  useEffect(() => {
    if (!examId && exams[0]?.id) setExamId(exams[0].id);
  }, [exams, examId]);

  function generate() {
    setDrafts([]);
    setGenerating(true);
    window.setTimeout(() => {
      setDrafts(buildQuestionDrafts({ skill, difficulty, count: Number(count) }));
      setGenerating(false);
    }, 650);
  }

  async function addAll() {
    if (!drafts.length || !examId) return;
    setSaving(true);
    setProgress(0);
    let created = 0;
    try {
      for (const draft of drafts) {
        await api("/admin/questions", {
          method: "POST",
          token,
          body: {
            exam_id: Number(examId),
            question_text: draft.question_text,
            type: "single_choice",
            points: draft.points,
            options: draft.options,
          },
        });
        created += 1;
        setProgress(created);
      }
      notifications.success(`Đã thêm ${created} câu hỏi vào đề.`, { title: "Đã cập nhật ngân hàng câu hỏi" });
      setLastExamId(examId);
      setDrafts([]);
      onCreated?.();
    } catch (requestError) {
      if (created) {
        setLastExamId(examId);
        setDrafts((current) => current.slice(created));
        onCreated?.();
      }
      notifications.error(
        created
          ? `Đã thêm ${created}/${drafts.length} câu. ${errorMessage(requestError)} Các câu còn lại vẫn ở bên dưới để thử lại.`
          : errorMessage(requestError),
        { title: "Trợ lý AI gặp lỗi" },
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedExam = exams.find((exam) => String(exam.id) === String(examId));
  const targetExamId = lastExamId || examId;

  return (
    <Card className="overflow-hidden">
      <div className="relative overflow-hidden bg-ink px-5 py-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-powder/20 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-powder/15 text-powder ring-1 ring-white/10">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">Trợ lý AI soạn câu hỏi</h2>
                <Badge className="border-white/15 bg-white/10 text-powder" tone="dark">
                  Beta
                </Badge>
              </div>
              <p className="mt-1 max-w-xl text-xs leading-5 text-white/55">
                Tạo câu hỏi IELTS kèm đáp án đúng, xem lại rồi thêm tất cả vào đề chỉ với một
                cú nhấp.
              </p>
            </div>
          </div>
          <Sparkles className="hidden h-5 w-5 text-powder/70 sm:block" />
        </div>

        <div className="relative mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Đề đích" htmlFor="ai-exam-id">
            <Select
              id="ai-exam-id"
              name="exam_id"
              value={examId}
              onChange={(event) => setExamId(event.target.value)}
              disabled={!exams.length || saving}
              aria-label="Chọn đề đích"
            >
              {exams.length ? (
                exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))
              ) : (
                <option value="">Chưa có đề</option>
              )}
            </Select>
          </Field>
          <Field label="Kỹ năng" htmlFor="ai-skill">
            <Select
              id="ai-skill"
              name="skill"
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
              disabled={saving}
              aria-label="Chọn kỹ năng"
            >
              {SKILLS.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "Tất cả kỹ năng" : option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Độ khó" htmlFor="ai-difficulty">
            <Select
              id="ai-difficulty"
              name="difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              disabled={saving}
              aria-label="Chọn độ khó"
            >
              {DIFFICULTIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Số câu" htmlFor="ai-count">
            <Select
              id="ai-count"
              name="count"
              value={count}
              onChange={(event) => setCount(event.target.value)}
              disabled={saving}
              aria-label="Số câu hỏi"
            >
              {[1, 2, 3, 4, 5].map((option) => (
                <option key={option} value={option}>
                  {option} câu
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <Button onClick={generate} disabled={generating || saving || !exams.length} size="sm">
            {generating ? <Spinner /> : <Wand2 className="h-3.5 w-3.5" />}
            {generating ? "Đang soạn..." : "Tạo câu hỏi"}
          </Button>
          {selectedExam ? (
            <span className="text-[11px] text-white/45">
              Đề đích: {selectedExam.title}
            </span>
          ) : (
            <Link to="/admin/exams/new" className="text-[11px] font-medium text-powder hover:text-white">
              Tạo đề trước khi dùng trợ lý →
            </Link>
          )}
        </div>
      </div>

      <div className="p-5">
        {generating ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-lg bg-mist/60" />
            <div className="h-20 animate-pulse rounded-lg bg-mist/60" />
          </div>
        ) : drafts.length ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {drafts.length} câu hỏi gợi ý
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Đáp án đúng được đánh dấu màu xanh. Kiểm tra lại trước khi thêm vào đề.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={generate} disabled={saving}>
                <RefreshCw className="h-3.5 w-3.5" />
                Tạo lại
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {drafts.map((draft, index) => (
                <div key={draft.tempId} className="rounded-lg border border-line bg-canvas/40 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-powder">
                      {index + 1}
                    </span>
                    <Badge tone="neutral">{draft.skill}</Badge>
                    <Badge tone="sand">{draft.difficulty}</Badge>
                  </div>
                  <p className="mt-2.5 text-sm font-medium leading-6 text-ink">
                    {draft.question_text}
                  </p>
                  <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {draft.options.map((option, optionIndex) => (
                      <div
                        key={`${draft.tempId}-${optionIndex}`}
                        className={
                          option.is_correct
                            ? "flex items-start gap-2 rounded-md border border-[#c8dfd1] bg-[#eef6f0] px-3 py-2 text-xs leading-5 text-success"
                            : "flex items-start gap-2 rounded-md border border-line bg-surface-raised px-3 py-2 text-xs leading-5 text-muted"
                        }
                      >
                        {option.is_correct ? (
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-40" />
                        )}
                        {option.option_text}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted">
                    Đáp án đúng: <span className="font-medium text-success">{draft.correct_text}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-[11px] text-muted">
                {saving ? `Đang thêm ${progress}/${drafts.length} câu...` : "Câu hỏi sẽ được lưu ngay vào đề đã chọn."}
              </p>
              <Button onClick={addAll} disabled={saving || !examId}>
                {saving ? <Spinner /> : <CheckCircle2 className="h-4 w-4" />}
                {saving ? "Đang thêm..." : "Thêm tất cả vào đề"}
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-canvas/35 px-4 py-6 text-center">
            <p className="text-sm font-medium text-ink">Chưa có câu hỏi nào được tạo</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">
              Chọn kỹ năng, độ khó và số câu, sau đó bấm “Tạo câu hỏi”. Trợ lý dùng ngân hàng
              câu hỏi IELTS có sẵn, không gửi dữ liệu ra dịch vụ ngoài.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
