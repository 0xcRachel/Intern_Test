import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Award,
  Layers3,
  Lightbulb,
  ListChecks,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../context/auth";
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  LoadingScreen,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from "../../components/ui";

export function meta() {
  return [{ title: "Form câu hỏi — ExamPlatform" }];
}

let optionKey = 0;
function createOption(option = {}) {
  optionKey += 1;
  return {
    key: `option-${optionKey}`,
    option_text: option.option_text || "",
    is_correct: Boolean(option.is_correct),
  };
}

export default function AdminQuestionForm() {
  const { examId, questionId } = useParams();
  const isEdit = Boolean(questionId);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [exam, setExam] = useState(null);
  const [form, setForm] = useState({
    question_text: "",
    type: "single_choice",
    points: "10",
  });
  const [options, setOptions] = useState([
    createOption(),
    createOption(),
    createOption(),
    createOption(),
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      api(`/admin/exams/${examId}`, { token }),
      isEdit ? api(`/admin/questions/${questionId}`, { token }) : Promise.resolve(null),
    ])
      .then(([examData, questionData]) => {
        if (!active) return;
        setExam(examData?.data || examData);
        if (questionData) {
          const question = questionData?.data || questionData;
          setForm({
            question_text: question.question_text || "",
            type: question.type || "single_choice",
            points: String(question.points ?? 1),
          });
          const loadedOptions = (question.options || []).map((option) => createOption(option));
          setOptions(loadedOptions.length >= 2 ? loadedOptions : [createOption(), createOption()]);
        }
      })
      .catch((requestError) => {
        if (active) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [examId, questionId, isEdit, token]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateOption(key, field, value) {
    setOptions((current) =>
      current.map((option) => (option.key === key ? { ...option, [field]: value } : option)),
    );
  }

  function setCorrect(key) {
    setOptions((current) =>
      current.map((option) => {
        if (form.type === "single_choice") {
          return { ...option, is_correct: option.key === key };
        }
        if (option.key === key) {
          return { ...option, is_correct: !option.is_correct };
        }
        return option;
      }),
    );
  }

  function addOption() {
    if (options.length >= 8) return;
    setOptions((current) => [...current, createOption()]);
  }

  function removeOption(key) {
    if (options.length <= 2) return;
    setOptions((current) => current.filter((option) => option.key !== key));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanedOptions = options
      .map((option) => ({
        option_text: option.option_text.trim(),
        is_correct: option.is_correct,
      }))
      .filter((option) => option.option_text);

    if (cleanedOptions.length < 2) {
      setError("Cần ít nhất hai lựa chọn có nội dung.");
      return;
    }
    if (!cleanedOptions.some((option) => option.is_correct)) {
      setError("Cần đánh dấu ít nhất một đáp án đúng.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...(isEdit ? {} : { exam_id: Number(examId) }),
        question_text: form.question_text.trim(),
        type: form.type,
        points: Number(form.points),
        options: cleanedOptions,
      };
      await api(isEdit ? `/admin/questions/${questionId}` : "/admin/questions", {
        method: isEdit ? "PUT" : "POST",
        token,
        body,
      });
      navigate(`/admin/exams/${examId}/questions`);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingScreen label="Đang tải câu hỏi..." />;
  }

  const correctCount = options.filter((option) => option.is_correct).length;
  const filledOptions = options.filter((option) => option.option_text.trim()).length;

  return (
    <>
      <Link
        to={`/admin/exams/${examId}/questions`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Câu hỏi của đề
      </Link>

      <div className="mt-3">
        <PageHeader
          eyebrow={exam?.title || "Câu hỏi"}
          title={isEdit ? "Sửa câu hỏi" : "Thêm câu hỏi"}
          description="Câu hỏi trắc nghiệm cần ít nhất hai lựa chọn và một đáp án đúng."
        />
      </div>

      {error ? (
        <Alert className="mt-5" tone="error" title="Không lưu được câu hỏi">
          {error}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Card className="space-y-5 p-5 sm:p-6">
          <Field label="Nội dung câu hỏi" htmlFor="question_text" required>
            <Textarea
              id="question_text"
              required
              value={form.question_text}
              onChange={(event) => update("question_text", event.target.value)}
              placeholder="What is the primary objective of Section 1 in IELTS Reading?"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Loại câu hỏi" htmlFor="type">
              <Select
                id="type"
                value={form.type}
                onChange={(event) => {
                  const nextType = event.target.value;
                  setForm((current) => ({ ...current, type: nextType }));
                  if (nextType === "single_choice") {
                    setOptions((current) => {
                      const firstCorrect = current.findIndex((option) => option.is_correct);
                      return current.map((option, index) => ({
                        ...option,
                        is_correct: index === (firstCorrect >= 0 ? firstCorrect : 0),
                      }));
                    });
                  }
                }}
              >
                <option value="single_choice">Một đáp án đúng</option>
                <option value="multiple_choice">Nhiều đáp án đúng</option>
              </Select>
            </Field>
            <Field label="Điểm" htmlFor="points" required>
              <Input
                id="points"
                type="number"
                min="1"
                max="100"
                required
                value={form.points}
                onChange={(event) => update("points", event.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Lựa chọn</h2>
              <p className="mt-1 text-xs text-muted">
                Đánh dấu đáp án đúng. Có thể thêm tối đa 8 lựa chọn.
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={addOption} disabled={options.length >= 8}>
              <Plus className="h-3.5 w-3.5" />
              Thêm
            </Button>
          </div>
          <div className="divide-y divide-line">
            {options.map((option, index) => (
              <div key={option.key} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-xs font-medium text-muted">
                  <input
                    type={form.type === "single_choice" ? "radio" : "checkbox"}
                    name="correct-option"
                    checked={option.is_correct}
                    onChange={() => setCorrect(option.key)}
                    className="h-4 w-4 accent-[#5d8ea6]"
                  />
                  Đúng
                </label>
                <Input
                  id={`option-text-${option.key}`}
                  name={`option_text_${option.key}`}
                  value={option.option_text}
                  onChange={(event) => updateOption(option.key, "option_text", event.target.value)}
                  placeholder={`Lựa chọn ${index + 1}`}
                  aria-label={`Nội dung lựa chọn ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(option.key)}
                  disabled={options.length <= 2}
                  aria-label={`Xóa lựa chọn ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : <Save className="h-4 w-4" />}
            {isEdit ? "Lưu thay đổi" : "Thêm câu hỏi"}
          </Button>
          <Link to={`/admin/exams/${examId}/questions`}>
            <Button variant="secondary">Hủy</Button>
          </Link>
        </div>
      </form>

      <aside className="space-y-4">
        <Card className="overflow-hidden">
          <div className="bg-ink px-5 py-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Tóm tắt câu hỏi
            </p>
            <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-white">
              {form.question_text.trim() || "Nội dung câu hỏi sẽ hiển thị tại đây."}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center">
            <div className="px-2 py-3">
              <Layers3 className="mx-auto h-4 w-4 text-steel" />
              <p className="mt-1 text-base font-semibold text-ink">{filledOptions}</p>
              <p className="text-[10px] text-muted">Lựa chọn</p>
            </div>
            <div className="px-2 py-3">
              <Award className="mx-auto h-4 w-4 text-steel" />
              <p className="mt-1 text-base font-semibold text-ink">{form.points}</p>
              <p className="text-[10px] text-muted">Điểm</p>
            </div>
            <div className="px-2 py-3">
              <ListChecks className="mx-auto h-4 w-4 text-success" />
              <p className="mt-1 text-base font-semibold text-success">{correctCount}</p>
              <p className="text-[10px] text-muted">Đáp án đúng</p>
            </div>
          </div>
          <p className="px-5 py-3 text-[11px] leading-5 text-muted">
            {form.type === "single_choice"
              ? "Câu hỏi một đáp án: chỉ một lựa chọn được đánh dấu đúng."
              : "Câu hỏi nhiều đáp án: có thể đánh dấu nhiều lựa chọn đúng."}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Lightbulb className="h-4 w-4 text-steel" />
            Mẹo viết câu hỏi tốt
          </div>
          <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted">
            <li className="flex items-start gap-2">
              <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
              Mỗi câu chỉ kiểm tra một ý chính, tránh ghép quá nhiều yêu cầu.
            </li>
            <li className="flex items-start gap-2">
              <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
              Các lựa chọn nhiễu nên hợp lý, không quá dễ loại trừ.
            </li>
            <li className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
              Dùng ngôn ngữ rõ ràng và giữ đáp án đúng nhất quán với nội dung.
            </li>
          </ul>
        </Card>
      </aside>
      </div>
    </>
  );
}
