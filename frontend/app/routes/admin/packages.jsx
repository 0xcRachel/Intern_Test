import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Pencil, Plus, Search, Star, EyeOff } from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../context/auth";
import { useNotifications } from "../../components/notifications";
import { Reveal } from "../../components/reveal";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
} from "../../components/ui";
import { formatPrice } from "../../lib/format";

export function meta() {
  return [{ title: "Danh mục khóa học — ExamPlatform" }];
}

export default function AdminPackages() {
  const { token } = useAuth();
  const notifications = useNotifications();
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load(query = search) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "60" });
      if (query.trim()) params.set("search", query.trim());
      const data = await api(`/admin/packages?${params.toString()}`, { token });
      setPackages(data?.data || []);
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Không tải được danh mục" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
  }, [token]);

  async function hidePackage() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/admin/packages/${deleteTarget.id}`, { method: "DELETE", token });
      setDeleteTarget(null);
      setPackages((current) => current.filter((item) => item.id !== deleteTarget.id));
      notifications.success("Khóa học đã được ẩn khỏi danh mục.", { title: "Đã cập nhật danh mục" });
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Không thể ẩn khóa học" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Quản lý nội dung"
        title="Danh mục khóa học"
        description="Quản lý tên, giá, trình độ, mục tiêu và trạng thái hiển thị của các khóa IELTS."
        actions={
          <Link to="/admin/packages/new">
            <Button>
              <Plus className="h-4 w-4" />
              Thêm khóa học
            </Button>
          </Link>
        }
      />

      <Card className="mt-5 p-4">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            load(search);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên hoặc slug khóa học..."
              aria-label="Tìm khóa học"
            />
          </div>
          <Button type="submit" variant="secondary">Tìm kiếm</Button>
        </form>
      </Card>

      {loading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      ) : packages.length ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {packages.map((packageItem, index) => (
            <Reveal key={packageItem.id} delay={index * 0.03}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist text-steel">
                      <BookOpen className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-ink">{packageItem.title}</h2>
                      <p className="mt-1 truncate text-xs text-muted">/{packageItem.slug}</p>
                    </div>
                  </div>
                  <Badge tone={packageItem.is_active ? "success" : "neutral"}>
                    {packageItem.is_active ? "Đang bán" : "Đã ẩn"}
                  </Badge>
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">
                  {packageItem.description || "Chưa có mô tả."}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-canvas/60 p-3">
                    <p className="text-muted">Giá</p>
                    <p className="mt-1 font-semibold text-ink">{formatPrice(packageItem.price)}</p>
                  </div>
                  <div className="rounded-lg bg-canvas/60 p-3">
                    <p className="text-muted">Trình độ</p>
                    <p className="mt-1 font-semibold text-ink">{packageItem.level}</p>
                  </div>
                  <div className="rounded-lg bg-canvas/60 p-3">
                    <p className="text-muted">Đánh giá</p>
                    <p className="mt-1 inline-flex items-center gap-1 font-semibold text-ink">
                      <Star className="h-3.5 w-3.5 fill-current text-[#c59a4a]" />
                      {Number(packageItem.rating || 0).toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <span className="text-xs text-muted">
                    {packageItem.units_count || 0} unit · {packageItem.students_count || 0} học viên
                  </span>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/packages/${packageItem.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Sửa
                      </Button>
                    </Link>
                    {packageItem.is_active ? (
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(packageItem)}>
                        <EyeOff className="h-3.5 w-3.5" />
                        Ẩn
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={BookOpen}
            title="Chưa có khóa học"
            description="Tạo khóa học đầu tiên để hiển thị trong danh mục."
            action={<Link to="/admin/packages/new"><Button><Plus className="h-4 w-4" />Thêm khóa học</Button></Link>}
          />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={hidePackage}
        title="Ẩn khóa học khỏi danh mục?"
        description={deleteTarget ? `Khóa học “${deleteTarget.title}” sẽ không còn xuất hiện với học viên mới.` : ""}
        confirmLabel="Ẩn khóa học"
        tone="danger"
        loading={deleting}
      />
    </>
  );
}
