import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Mail,
  Pencil,
  ReceiptText,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { RequireAuth } from "../components/auth-gate";
import { useNotifications } from "../components/notifications";
import { Reveal } from "../components/reveal";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  PageHeader,
  Spinner,
  Textarea,
} from "../components/ui";

export function meta() {
  return [{ title: "Hồ sơ học viên — ExamPlatform" }];
}

function ProfilePage() {
  const { user, token, updateProfile } = useAuth();
  const notifications = useNotifications();
  const [courses, setCourses] = useState([]);
  const [coursesCount, setCoursesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    avatar: "",
    target_band: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      avatar: user.avatar || "",
      target_band: user.target_band || "",
      bio: user.bio || "",
    });
  }, [user]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api("/my/courses?per_page=6", { token }),
      api("/orders?per_page=1", { token }),
    ])
      .then(([coursesData, ordersData]) => {
        if (!active) return;
        setCourses(coursesData?.data || []);
        setCoursesCount(coursesData?.meta?.total ?? coursesData?.total ?? 0);
        setOrdersCount(ordersData?.meta?.total || 0);
      })
      .catch((requestError) => {
        if (active) notifications.error(errorMessage(requestError), { title: "Không tải được hồ sơ" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event) {
    event?.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        avatar: form.avatar.trim() || null,
        target_band: form.target_band.trim() || null,
        bio: form.bio.trim() || null,
      });
      setEditing(false);
      notifications.success("Thông tin cá nhân đã được cập nhật.", { title: "Đã lưu hồ sơ" });
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Không thể lưu hồ sơ" });
    } finally {
      setSaving(false);
    }
  }

  const initials = user?.name?.slice(0, 1)?.toUpperCase() || "U";
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("vi-VN", { dateStyle: "medium" })
    : "—";

  return (
    <>
      <PageHeader
        eyebrow="Tài khoản"
        title="Hồ sơ học viên"
        description="Thông tin cá nhân, mục tiêu band điểm và các khóa học bạn đã sở hữu."
        actions={
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Chỉnh sửa hồ sơ
          </Button>
        }
      />


      <Reveal className="relative mt-6 overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-powder/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-sand/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-2xl font-semibold uppercase text-powder">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-semibold tracking-tight">{user?.name}</h2>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-powder">
                  {user?.role === "admin" ? "Quản trị viên" : "Học viên"}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/55">{user?.email}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/55">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-powder" />
                  Thành viên từ {memberSince}
                </span>
                {user?.provider ? (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-powder" />
                    Đăng nhập qua {user.provider}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
              <p className="text-xl font-semibold">{loading ? "—" : coursesCount}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/45">Khóa học</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
              <p className="text-xl font-semibold">{loading ? "—" : ordersCount}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/45">Đơn hàng</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
              <p className="text-xl font-semibold">{user?.target_band || "—"}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/45">Mục tiêu</p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Reveal>
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-steel" />
              <h2 className="text-base font-semibold text-ink">Thông tin cá nhân</h2>
            </div>
            <dl className="mt-4 divide-y divide-line text-sm">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="inline-flex items-center gap-2 text-muted">
                  <UserRound className="h-3.5 w-3.5" /> Họ tên
                </dt>
                <dd className="text-right font-medium text-ink">{user?.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="inline-flex items-center gap-2 text-muted">
                  <Mail className="h-3.5 w-3.5" /> Email
                </dt>
                <dd className="truncate text-right font-medium text-ink">{user?.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="inline-flex items-center gap-2 text-muted">
                  <Target className="h-3.5 w-3.5" /> Band mục tiêu
                </dt>
                <dd className="text-right font-medium text-ink">{user?.target_band || "Chưa đặt"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="inline-flex items-center gap-2 text-muted">
                  <ShieldCheck className="h-3.5 w-3.5" /> Vai trò
                </dt>
                <dd>
                  <Badge tone={user?.role === "admin" ? "dark" : "blue"}>
                    {user?.role === "admin" ? "Quản trị viên" : "Học viên"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="flex h-full flex-col p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-steel" />
              <h2 className="text-base font-semibold text-ink">Mục tiêu & giới thiệu</h2>
            </div>
            <p className="mt-4 flex-1 text-sm leading-7 text-muted">
              {user?.bio || "Thêm một vài dòng về mục tiêu học tập của bạn để cá nhân hóa trải nghiệm."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="sand">
                <Target className="mr-1 h-3 w-3" />
                {user?.target_band ? `Mục tiêu Band ${user.target_band}` : "Chưa đặt mục tiêu"}
              </Badge>
              <Badge tone="success">
                <BadgeCheck className="mr-1 h-3 w-3" />
                Tài khoản đang hoạt động
              </Badge>
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal className="mt-5">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-steel" />
              <h2 className="text-base font-semibold text-ink">Khóa học đã sở hữu</h2>
            </div>
            <Link to="/my-courses" className="text-xs font-medium text-steel hover:text-ink">
              Xem tất cả
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3 p-5">
              <div className="h-12 animate-pulse rounded-md bg-mist/60" />
              <div className="h-12 animate-pulse rounded-md bg-mist/60" />
            </div>
          ) : courses.length ? (
            <div className="divide-y divide-line">
              {courses.slice(0, 3).map((course) => (
                <Link
                  key={course.id}
                  to={`/packages/${course.slug || course.id}`}
                  className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-canvas/55"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{course.title}</span>
                    <span className="text-[11px] text-muted">
                      {course.level} · {course.units?.length || 0} unit · Đã sở hữu
                    </span>
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-ink">Bạn chưa sở hữu khóa học nào</p>
              <p className="mt-1 text-xs text-muted">
                Chọn một gói tài liệu IELTS để bắt đầu lộ trình.
              </p>
              <Link to="/packages" className="mt-4 inline-flex">
                <Button size="sm">Khám phá tài liệu</Button>
              </Link>
            </div>
          )}
        </Card>
      </Reveal>

      <Reveal className="mt-5">
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-mist text-steel">
              <ReceiptText className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">Lịch sử đơn hàng</p>
              <p className="mt-0.5 text-xs text-muted">
                Xem hóa đơn demo và trạng thái kích hoạt khóa học.
              </p>
            </div>
          </div>
          <Link to="/orders" className="inline-flex">
            <Button variant="secondary" size="sm">
              Xem đơn hàng
            </Button>
          </Link>
        </Card>
      </Reveal>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Chỉnh sửa hồ sơ"
        description="Cập nhật tên hiển thị, ảnh đại diện và mục tiêu band điểm."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Spinner /> : <Pencil className="h-4 w-4" />}
              Lưu hồ sơ
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <Field label="Họ tên" htmlFor="profile-name" required>
            <Input
              id="profile-name"
              required
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </Field>
          <Field label="Ảnh đại diện (URL)" htmlFor="profile-avatar" hint="Dán URL ảnh công khai, ví dụ từ Gravatar.">
            <Input
              id="profile-avatar"
              type="url"
              value={form.avatar}
              onChange={(event) => update("avatar", event.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Band mục tiêu" htmlFor="profile-band">
            <Input
              id="profile-band"
              value={form.target_band}
              onChange={(event) => update("target_band", event.target.value)}
              placeholder="7.5"
            />
          </Field>
          <Field label="Giới thiệu" htmlFor="profile-bio" hint="Tối đa 500 ký tự.">
            <Textarea
              id="profile-bio"
              value={form.bio}
              onChange={(event) => update("bio", event.target.value)}
              placeholder="Mục tiêu học tập và điểm mạnh của bạn..."
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}

export default function Profile() {
  return (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  );
}
