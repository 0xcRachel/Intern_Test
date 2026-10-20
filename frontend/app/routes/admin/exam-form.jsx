import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Clock3, ListChecks, Save, Sparkles, Target } from "lucide-react";
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
  Spinner,
  Textarea,
} from "../../components/ui";

export function meta() {
  return [{ title: "Form đề luyện tập — ExamPlatform" }];
}

export default function AdminExamForm() {
  const { examId } = useParams();
  const isEdit = Boolean(examId);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration_minutes: "60",
    passing_score: "70",
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    setLoading(true);
    api(`/admin/exams/${examId}`, { token })
      .then((data) => {
        if (!active) return;
        const exam = data?.data || data;
        setForm({
          title: exam.title || "",
          description: exam.description || "",
          duration_minutes: String(exam.duration_minutes ?? 60),
          passing_score: String(exam.passing_score ?? 70),
        });
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
  }, [examId, isEdit, token]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        duration_minutes: Number(form.duration_minutes),
        passing_score: Number(form.passing_score),
      };
      const data = await api(isEdit ? `/admin/exams/${examId}` : "/admin/exams", {
        method: isEdit ? "PUT" : "POST",
        token,
        body,
      });
      if (isEdit) {
        navigate("/admin/exams");
      } else {
        const created = data?.data || data;
        navigate(`/admin/exams/${created.id}/questions`);
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingScreen label="Đang tải đề..." />;
  }

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
          eyebrow="Quản lý nội dung"
          title={isEdit ? "Sửa đề luyện tập" : "Tạo đề luyện tập"}
          description="Thông tin này hiển thị cho học viên trước khi bắt đầu làm bài."
        />
      </div>

      {error ? (
        <Alert className="mt-5" tone="error" title="Không lưu được đề">
          {error}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5 sm:p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field label="Tên đề" htmlFor="title" required>
              <Input
                id="title"
                required
                maxLength={255}
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="IELTS General Reading Test 1"
              />
            </Field>
            <Field
              label="Mô tả"
              htmlFor="description"
              hint="Ngắn gọn, nêu phạm vi và mục tiêu của đề."
            >
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Standard introductory reading comprehension exam."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Thời lượng (phút)" htmlFor="duration" required>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="480"
                  required
                  value={form.duration_minutes}
                  onChange={(event) => update("duration_minutes", event.target.value)}
                />
              </Field>
              <Field
                label="Ngưỡng đạt (%)"
                htmlFor="passing"
                required
                hint="Học viên đạt từ mức này được tính là hoàn thành."
              >
                <Input
                  id="passing"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={form.passing_score}
                  onChange={(event) => update("passing_score", event.target.value)}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-line pt-5">
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner /> : <Save className="h-4 w-4" />}
                {isEdit ? "Lưu thay đổi" : "Tạo đề và thêm câu hỏi"}
              </Button>
              <Link to="/admin/exams">
                <Button variant="secondary">Hủy</Button>
              </Link>
            </div>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative overflow-hidden bg-ink px-5 py-4 text-white">
              <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-powder/20 blur-2xl" />
              <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                {isEdit ? "Đang chỉnh sửa" : "Bản xem trước"}
              </p>
              <p className="relative mt-2 line-clamp-2 text-lg font-semibold leading-snug">
                {form.title.trim() || "Đề IELTS chưa đặt tên"}
              </p>
              <div className="relative mt-3 flex flex-wrap gap-3 text-[11px] text-white/55">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-powder" />
                  {form.duration_minutes || 0} phút
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-powder" />
                  Đạt {form.passing_score || 0}%
                </span>
              </div>
            </div>
            <p className="px-5 py-4 text-xs leading-5 text-muted">
              {form.description.trim() ||
                "Mô tả sẽ xuất hiện trên trang giới thiệu đề trước khi học viên bắt đầu."}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-steel" />
              Gợi ý để đề dễ tiếp cận
            </div>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted">
              <li className="flex items-start gap-2">
                <ListChecks className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
                Đặt tên theo kỹ năng, loại đề và số thứ tự.
              </li>
              <li className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
                Chọn thời lượng gần với đề thi thật để luyện áp lực.
              </li>
              <li className="flex items-start gap-2">
                <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
                Ngưỡng đạt 60–70% phù hợp với hầu hết đề luyện tập.
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
