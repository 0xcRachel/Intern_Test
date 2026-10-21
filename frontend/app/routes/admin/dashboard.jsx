import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Eye,
  FileQuestion,
  GraduationCap,
  Plus,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { usePolling } from "../../lib/use-polling";
import { useAuth } from "../../context/auth";
import { AiQuestionAssistant } from "../../components/ai-question-assistant";
import { Reveal } from "../../components/reveal";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
} from "../../components/ui";
import { formatDate, formatPrice } from "../../lib/format";

export function meta() {
  return [{ title: "Quản trị — ExamPlatform" }];
}

function MetricCard({ label, value, hint, icon: Icon, dark = false }) {
  return (
    <Card
      className={
        dark
          ? "relative overflow-hidden border-ink bg-ink p-5 text-white"
          : "relative overflow-hidden p-5"
      }
    >
      {dark ? (
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-powder/20 blur-2xl" />
      ) : null}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p
            className={
              dark
                ? "text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50"
                : "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
            }
          >
            {label}
          </p>
          <p
            className={
              dark
                ? "mt-3 text-3xl font-semibold tracking-tight text-white"
                : "mt-3 text-3xl font-semibold tracking-tight text-ink"
            }
          >
            {value}
          </p>
        </div>
        <span
          className={
            dark
              ? "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-powder"
              : "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-steel"
          }
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      {hint ? (
        <p className={dark ? "relative mt-3 text-[11px] text-white/50" : "relative mt-3 text-[11px] text-muted"}>
          {hint}
        </p>
      ) : null}
    </Card>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [dashboardData, examsData] = await Promise.all([
        api("/admin/dashboard", { token }),
        api("/admin/exams?per_page=100", { token }),
      ]);
      setDashboard(dashboardData);
      setExams(examsData?.data || []);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  usePolling(() => load({ silent: true }), 30000, Boolean(token));

  const metrics = dashboard?.metrics || {};
  const questionCount = exams.reduce(
    (total, exam) => total + (exam.questions?.length ?? exam.questions_count ?? 0),
    0,
  );
  const revenue = Number(metrics.revenue || 0);

  return (
    <>
      <PageHeader
        eyebrow="Quản trị"
        title="Tổng quan hệ thống"
        description={dashboard?.message || "Theo dõi doanh thu, học viên, đề thi và nội dung."}
        actions={
          <>
            <Button variant="secondary" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Tải lại
            </Button>
            <Link
              to="/admin/exams/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-powder px-4 text-sm font-medium text-ink transition-colors hover:bg-[#8bb9cf]"
            >
              <Plus className="h-4 w-4" />
              Tạo đề
            </Link>
          </>
        }
      />

      {error ? (
        <Alert className="mt-5" tone="error" title="Không tải được dữ liệu quản trị">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Reveal>
            <MetricCard
              label="Doanh thu"
              value={formatPrice(revenue)}
              hint={`${metrics.paid_orders || 0} đơn đã thanh toán`}
              icon={Wallet}
              dark
            />
          </Reveal>
          <Reveal delay={0.04}>
            <MetricCard
              label="Học viên"
              value={Number(metrics.students || 0).toLocaleString("vi-VN")}
              hint="Tài khoản vai trò học viên"
              icon={Users}
            />
          </Reveal>
          <Reveal delay={0.08}>
            <MetricCard
              label="Khóa học đã bán"
              value={Number(metrics.enrollments || 0).toLocaleString("vi-VN")}
              hint={`${metrics.packages || 0} gói đang mở bán`}
              icon={GraduationCap}
            />
          </Reveal>
          <Reveal delay={0.12}>
            <MetricCard
              label="Đơn hàng"
              value={Number(metrics.paid_orders || 0).toLocaleString("vi-VN")}
              hint="Đơn demo đã kích hoạt"
              icon={ShoppingBag}
            />
          </Reveal>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Đề luyện tập</p>
            <p className="mt-1 text-xl font-semibold text-ink">{exams.length}</p>
          </div>
          <ClipboardList className="h-5 w-5 text-steel" />
        </Card>
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Câu hỏi</p>
            <p className="mt-1 text-xl font-semibold text-ink">{questionCount || metrics.questions || 0}</p>
          </div>
          <FileQuestion className="h-5 w-5 text-steel" />
        </Card>
        <Card className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Khóa học</p>
            <p className="mt-1 text-xl font-semibold text-ink">{metrics.packages || 0}</p>
          </div>
          <BookOpen className="h-5 w-5 text-steel" />
        </Card>
      </div>

      <div className="mt-6">
        <Reveal>
          <AiQuestionAssistant exams={exams} token={token} onCreated={load} />
        </Reveal>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Reveal>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-ink">Đơn hàng gần đây</h2>
                <p className="mt-1 text-xs text-muted">Theo dõi khóa học vừa được kích hoạt.</p>
              </div>
              <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-medium text-steel hover:text-ink">
                Xem tất cả
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : dashboard?.recent_orders?.length ? (
              <div className="divide-y divide-line">
                {dashboard.recent_orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-canvas/45"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                      <ReceiptText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-semibold text-ink">{order.code}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted">
                        {order.customer || "Học viên"} · {order.items_count} khóa học ·{" "}
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{formatPrice(order.total)}</p>
                      <Badge tone="success" className="mt-1">
                        Đã thanh toán
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={ReceiptText}
                  title="Chưa có đơn hàng"
                  description="Đơn hàng demo sẽ xuất hiện khi học viên mua khóa học."
                />
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-ink">Học viên mới ghi danh</h2>
              <p className="mt-1 text-xs text-muted">Ai vừa mở khóa khóa học?</p>
            </div>
            {dashboard?.recent_enrollments?.length ? (
              <div className="divide-y divide-line">
                {dashboard.recent_enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="px-5 py-3.5">
                    <p className="text-sm font-medium text-ink">{enrollment.student || "Học viên"}</p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{enrollment.package}</p>
                    <p className="mt-1 text-[10px] text-muted/70">
                      {formatDate(enrollment.enrolled_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-xs leading-5 text-muted">
                Chưa có ghi danh nào. Mua thử một khóa học bằng tài khoản học viên để kiểm tra
                luồng thanh toán.
              </p>
            )}
          </Card>
        </Reveal>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Reveal>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-ink">Đề gần đây</h2>
                <p className="mt-1 text-xs text-muted">Mở nhanh phần câu hỏi hoặc thống kê.</p>
              </div>
              <Link to="/admin/exams" className="text-xs font-medium text-steel hover:text-ink">
                Xem tất cả
              </Link>
            </div>
            {exams.length ? (
              <div className="divide-y divide-line">
                {exams.slice(0, 4).map((exam) => (
                  <div key={exam.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{exam.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {exam.duration_minutes} phút · {exam.questions?.length ?? exam.questions_count ?? 0} câu
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Link to={`/admin/exams/${exam.id}/questions`}>
                        <Button variant="secondary" size="sm">Câu hỏi</Button>
                      </Link>
                      <Link to={`/admin/exams/${exam.id}/statistics`}>
                        <Button variant="ghost" size="sm">Thống kê</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={ClipboardList}
                  title="Chưa có đề"
                  description="Tạo đề đầu tiên để bắt đầu quản lý câu hỏi."
                  action={
                    <Link to="/admin/exams/new">
                      <Button>
                        <Plus className="h-4 w-4" />
                        Tạo đề
                      </Button>
                    </Link>
                  }
                />
              </div>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Lối tắt quản trị</h2>
            <div className="mt-3 grid gap-2">
              {[
                { to: "/admin/orders", icon: ReceiptText, label: "Quản lý đơn hàng" },
                { to: "/admin/previews", icon: Eye, label: "Thống kê xem thử" },
                { to: "/admin/exams/new", icon: Plus, label: "Tạo đề mới" },
                { to: "/admin/exams", icon: FileQuestion, label: "Quản lý câu hỏi" },
                { to: "/packages", icon: BookOpen, label: "Xem trang tài liệu" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 text-sm text-ink hover:bg-mist/50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 text-steel" />
                      {item.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </Reveal>
      </div>
    </>
  );
}
