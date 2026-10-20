import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Eye,
  FileText,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../context/auth";
import { Reveal } from "../../components/reveal";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  StatCard,
} from "../../components/ui";
import { formatDate } from "../../lib/format";

export function meta() {
  return [{ title: "Lượt xem thử — ExamPlatform" }];
}

export default function AdminPreviewStatistics() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api("/admin/preview-statistics", { token });
      setData(response?.data || null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const totals = data?.totals || {};
  const topDocuments = data?.top_documents || [];
  const topPackages = data?.top_packages || [];
  const recentViews = data?.recent_views || [];

  return (
    <>
      <PageHeader
        eyebrow="Phân tích nội dung"
        title="Lượt xem thử tài liệu"
        description="Theo dõi tài liệu và gói học được xem thử nhiều nhất để ưu tiên cập nhật nội dung."
        actions={
          <Button variant="secondary" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        }
      />

      {error ? (
        <Alert className="mt-5" tone="error" title="Không tải được thống kê xem thử">
          {error}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-16" />
            </Card>
          ))
        ) : (
          <>
            <Reveal>
              <StatCard
                icon={Eye}
                label="Tổng lượt xem thử"
                value={totals.preview_views || 0}
                hint="Bao gồm PDF và audio"
              />
            </Reveal>
            <Reveal delay={0.04}>
              <StatCard
                icon={Users}
                label="Học viên xem"
                value={totals.unique_viewers || 0}
                hint="Số tài khoản khác nhau"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <StatCard
                icon={FileText}
                label="Tài liệu được xem"
                value={totals.documents_viewed || 0}
                hint="Trong toàn bộ thư viện"
              />
            </Reveal>
            <Reveal delay={0.12}>
              <StatCard
                icon={BookOpen}
                label="Gói học có lượt xem"
                value={totals.packages_viewed || 0}
                hint={
                  totals.last_viewed_at
                    ? `Gần nhất ${formatDate(totals.last_viewed_at)}`
                    : "Chưa có dữ liệu"
                }
              />
            </Reveal>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-line bg-canvas/45 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Tài liệu xem nhiều nhất</h2>
              <p className="mt-1 text-xs text-muted">Top 10 theo số lượt xem thử.</p>
            </div>
            <TrendingUp className="h-4 w-4 text-steel" />
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : topDocuments.length ? (
            <div className="divide-y divide-line">
              {topDocuments.map((document, index) => (
                <div
                  key={document.document_id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-semibold text-powder">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-ink">{document.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">
                      {document.package_title || "Chưa gắn gói học"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-semibold text-ink">{document.views}</p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted">lượt xem</p>
                    </div>
                    <Badge tone="blue">{document.unique_viewers} học viên</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={Eye}
                title="Chưa có lượt xem thử"
                description="Lượt xem sẽ xuất hiện sau khi học viên mở tài liệu từ trang gói học."
              />
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-line bg-canvas/45 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Gói học nổi bật</h2>
              <p className="mt-1 text-xs text-muted">Tổng hợp theo toàn bộ tài liệu trong gói.</p>
            </div>
            <BookOpen className="h-4 w-4 text-steel" />
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : topPackages.length ? (
            <div className="divide-y divide-line">
              {topPackages.map((packageItem) => (
                <div key={packageItem.package_id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/packages/${packageItem.slug || packageItem.package_id}`}
                        className="line-clamp-1 text-sm font-medium text-ink hover:text-steel"
                      >
                        {packageItem.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        {packageItem.documents_viewed} tài liệu · {packageItem.unique_viewers} học viên
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      {packageItem.views}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
                    <span>Lượt xem thử</span>
                    <span>
                      {packageItem.last_viewed_at
                        ? `Gần nhất ${formatDate(packageItem.last_viewed_at)}`
                        : "Chưa có lượt xem"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={BookOpen}
                title="Chưa có gói học nào"
                description="Dữ liệu sẽ xuất hiện khi tài liệu được mở từ các gói đang bán."
              />
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas/45 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Hoạt động gần đây</h2>
            <p className="mt-1 text-xs text-muted">12 lượt xem thử mới nhất.</p>
          </div>
          <Link to="/admin" className="text-xs font-medium text-steel hover:text-ink">
            Về tổng quan
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : recentViews.length ? (
          <div className="divide-y divide-line">
            {recentViews.map((view) => (
              <div
                key={view.id}
                className="flex flex-col gap-2 px-5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="line-clamp-1 font-medium text-ink">{view.document_title}</p>
                  <p className="mt-0.5 text-muted">
                    Học viên #{view.user_id} · {view.ip_address || "không rõ IP"}
                  </p>
                </div>
                <span className="shrink-0 text-muted">{formatDate(view.accessed_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Eye}
              title="Chưa có hoạt động"
              description="Các lượt xem tài liệu sẽ được ghi nhận tại đây."
              action={
                <Link to="/packages">
                  <Button variant="secondary">
                    Mở thư viện
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              }
            />
          </div>
        )}
      </Card>
    </>
  );
}
