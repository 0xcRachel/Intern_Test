import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../context/auth";
import { useNotifications } from "../../components/notifications";
import {
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

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  level: "Beginner",
  duration_hours: "18",
  rating: "4.8",
  students_count: "0",
  price: "29.99",
  is_featured: false,
  is_active: true,
  create_starter_content: true,
  outcomes: "",
};

export function meta() {
  return [{ title: "Biên tập khóa học — ExamPlatform" }];
}

export default function AdminPackageForm() {
  const { packageId } = useParams();
  const isEdit = Boolean(packageId);
  const { token } = useAuth();
  const notifications = useNotifications();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return undefined;
    let active = true;
    api(`/admin/packages/${packageId}`, { token })
      .then((response) => {
        if (!active) return;
        const packageItem = response?.data || response;
        setForm({
          title: packageItem.title || "",
          slug: packageItem.slug || "",
          description: packageItem.description || "",
          level: packageItem.level || "Beginner",
          duration_hours: String(packageItem.duration_hours ?? 18),
          rating: String(packageItem.rating ?? 4.8),
          students_count: String(packageItem.students_count ?? 0),
          price: String(packageItem.price ?? 0),
          is_featured: Boolean(packageItem.is_featured),
          is_active: Boolean(packageItem.is_active),
          outcomes: (packageItem.outcomes || []).join("\n"),
        });
      })
      .catch((requestError) => {
        if (active) notifications.error(errorMessage(requestError), { title: "Không tải được khóa học" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isEdit, packageId, token]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        slug: form.slug.trim() || null,
        description: form.description.trim() || null,
        level: form.level,
        duration_hours: Number(form.duration_hours),
        rating: Number(form.rating),
        students_count: Number(form.students_count),
        price: Number(form.price),
        is_featured: form.is_featured,
        is_active: form.is_active,
          create_starter_content: form.create_starter_content,
        outcomes: form.outcomes
          .split("\n")
          .map((outcome) => outcome.trim())
          .filter(Boolean),
      };

      await api(isEdit ? `/admin/packages/${packageId}` : "/admin/packages", {
        method: isEdit ? "PUT" : "POST",
        token,
        body,
      });

      notifications.success(isEdit ? "Khóa học đã được cập nhật." : "Khóa học đã được tạo.", {
        title: "Đã lưu danh mục",
      });
      navigate("/admin/packages");
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Không lưu được khóa học" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen label="Đang tải khóa học..." />;

  return (
    <>
      <Link to="/admin/packages" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Danh mục khóa học
      </Link>
      <div className="mt-3">
        <PageHeader
          eyebrow="Danh mục khóa học"
          title={isEdit ? "Sửa khóa học" : "Thêm khóa học"}
          description="Thông tin này được dùng trên catalogue và trang chi tiết khóa học."
        />
      </div>

      <form className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
        <Card className="space-y-5 p-5 sm:p-6">
          <Field label="Tên khóa học" htmlFor="package-title" required>
            <Input id="package-title" required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="IELTS Academic Foundation Band 5.5" />
          </Field>
          <Field label="Slug" htmlFor="package-slug" hint="Để trống để hệ thống tự tạo từ tên khóa học.">
            <Input id="package-slug" value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="ielts-academic-foundation-band-5-5" />
          </Field>
          <Field label="Mô tả" htmlFor="package-description">
            <Textarea id="package-description" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Mô tả ngắn về lộ trình và đối tượng học viên..." />
          </Field>
          <Field label="Mục tiêu đầu ra" htmlFor="package-outcomes" hint="Mỗi dòng là một mục tiêu.">
            <Textarea id="package-outcomes" value={form.outcomes} onChange={(event) => update("outcomes", event.target.value)} placeholder={"Nắm chiến lược làm bài\nLuyện đề theo thời gian\nXem lại đáp án chi tiết"} />
          </Field>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <Field label="Trình độ" htmlFor="package-level">
              <Select id="package-level" value={form.level} onChange={(event) => update("level", event.target.value)}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Select>
            </Field>
            <Field label="Giá (USD)" htmlFor="package-price" required>
              <Input id="package-price" type="number" min="0" step="0.01" required value={form.price} onChange={(event) => update("price", event.target.value)} />
            </Field>
            <Field label="Thời lượng (giờ)" htmlFor="package-duration" required>
              <Input id="package-duration" type="number" min="1" required value={form.duration_hours} onChange={(event) => update("duration_hours", event.target.value)} />
            </Field>
            <Field label="Rating" htmlFor="package-rating" required>
              <Input id="package-rating" type="number" min="0" max="5" step="0.1" required value={form.rating} onChange={(event) => update("rating", event.target.value)} />
            </Field>
            <Field label="Số học viên" htmlFor="package-students" required>
              <Input id="package-students" type="number" min="0" required value={form.students_count} onChange={(event) => update("students_count", event.target.value)} />
            </Field>
          </Card>

          <Card className="space-y-3 p-5">
            <label className="flex items-center gap-3 text-sm text-ink">
              <input type="checkbox" checked={form.is_featured} onChange={(event) => update("is_featured", event.target.checked)} />
              Hiển thị nổi bật
            </label>
            <label className="flex items-center gap-3 text-sm text-ink">
              <input type="checkbox" checked={form.is_active} onChange={(event) => update("is_active", event.target.checked)} />
              Đang hiển thị với học viên
            </label>
            {!isEdit ? (
              <label className="flex items-start gap-3 rounded-lg border border-[#bfdbe8] bg-mist/45 p-3 text-xs leading-5 text-ink">
                <input
                  type="checkbox"
                  checked={form.create_starter_content}
                  onChange={(event) => update("create_starter_content", event.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-semibold">Tạo sẵn nội dung mẫu</span>
                  <span className="mt-0.5 block text-muted">
                    Tạo 3 unit, 6 PDF preview và 1 audio track để khóa học không bị rỗng sau khi tạo.
                  </span>
                </span>
              </label>
            ) : null}
            <Button type="submit" className="mt-2 w-full" disabled={saving}>
              {saving ? <Spinner /> : <Save className="h-4 w-4" />}
              {isEdit ? "Lưu thay đổi" : "Tạo khóa học"}
            </Button>
          </Card>
        </div>
      </form>
    </>
  );
}
