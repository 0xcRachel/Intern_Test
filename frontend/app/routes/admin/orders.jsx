import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { usePolling } from "../../lib/use-polling";
import { useAuth } from "../../context/auth";
import { useNotifications } from "../../components/notifications";
import { Pagination } from "../../components/pagination";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Skeleton,
} from "../../components/ui";
import { formatDate, formatPrice } from "../../lib/format";

export function meta() {
  return [{ title: "Quản lý đơn hàng — ExamPlatform" }];
}

function StatusBadge({ status }) {
  if (status === "paid") return <Badge tone="success">Đã thanh toán</Badge>;
  if (status === "cancelled") return <Badge tone="danger">Đã hủy</Badge>;
  if (status === "refunded") return <Badge tone="sand">Hoàn tiền</Badge>;
  return <Badge tone="neutral">Đang xử lý</Badge>;
}

export default function AdminOrders() {
  const { token } = useAuth();
  const notifications = useNotifications();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(query = search, filter = status, page = 1, { silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "15", page: String(page) });
      if (query.trim()) params.set("search", query.trim());
      if (filter) params.set("status", filter);
      const data = await api(`/admin/orders?${params.toString()}`, { token });
      setOrders(data?.data || []);
      setMeta(data?.meta || null);
      setSummary(data?.summary || null);
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Không tải được đơn hàng" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("", "", 1);
  }, [token]);

  usePolling(
    () => load(search, status, meta?.current_page || 1, { silent: true }),
    30000,
    Boolean(token),
  );

  return (
    <>
      <PageHeader
        eyebrow="Kinh doanh"
        title="Đơn hàng & doanh thu"
        description="Theo dõi đơn demo, khóa học đã bán và mã giảm giá đã sử dụng."
        actions={
          <Button variant="secondary" onClick={() => load(search, status, 1)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        }
      />


      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-steel">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Doanh thu</p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {formatPrice(summary?.revenue || 0)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-steel">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Đơn đã thanh toán</p>
            <p className="mt-1 text-xl font-semibold text-ink">{summary?.paid_orders || 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-steel">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Tổng giảm giá</p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {formatPrice(summary?.discount || 0)}
            </p>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-4">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            load(search, status, 1);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="admin-order-search"
              name="search"
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã đơn, tên hoặc email học viên..."
              aria-label="Tìm đơn hàng"
            />
          </div>
          <Select
            id="admin-order-status"
            name="status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              load(search, event.target.value, 1);
            }}
            aria-label="Lọc trạng thái"
            className="sm:max-w-[180px]"
          >
            <option value="">Mọi trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Đang xử lý</option>
            <option value="cancelled">Đã hủy</option>
          </Select>
          <Button type="submit" variant="secondary">
            Tìm kiếm
          </Button>
        </form>
      </Card>

      <Card className="mt-4 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-line bg-canvas/60 text-xs uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Mã đơn</th>
                  <th className="px-5 py-3 font-medium">Học viên</th>
                  <th className="px-5 py-3 font-medium">Khóa học</th>
                  <th className="px-5 py-3 font-medium">Tổng tiền</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium">Ngày tạo</th>
                  <th className="px-5 py-3 text-right font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top transition-colors hover:bg-canvas/45">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold text-ink">{order.code}</p>
                      {order.coupon_code ? (
                        <p className="mt-1 text-[10px] text-muted">Mã: {order.coupon_code}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{order.user?.name || "—"}</p>
                      <p className="mt-0.5 text-xs text-muted">{order.user?.email}</p>
                    </td>
                    <td className="max-w-[280px] px-5 py-4">
                      {(order.items || []).map((item) => (
                        <p key={item.id} className="line-clamp-1 text-xs text-ink/80">
                          {item.package_title}
                        </p>
                      ))}
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-muted">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button variant="secondary" size="sm">
                          Xem
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={ShoppingBag}
              title="Chưa có đơn hàng"
              description="Đơn hàng sẽ xuất hiện khi học viên thanh toán khóa học demo."
            />
          </div>
        )}
      </Card>

      {meta ? (
        <Pagination
          meta={meta}
          onPageChange={(page) => load(search, status, page)}
          loading={loading}
          itemLabel="đơn"
        />
      ) : null}
    </>
  );
}
