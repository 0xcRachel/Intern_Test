import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { useNotifications } from "../components/notifications";
import { RequireAuth } from "../components/auth-gate";
import { formatDate, formatPrice } from "../lib/format";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
} from "../components/ui";

export function meta() {
  return [{ title: "Đơn hàng — ExamPlatform" }];
}

function statusBadge(status) {
  if (status === "paid") return <Badge tone="success">Đã thanh toán</Badge>;
  if (status === "cancelled") return <Badge tone="danger">Đã hủy</Badge>;
  if (status === "refunded") return <Badge tone="sand">Đã hoàn tiền</Badge>;
  return <Badge tone="neutral">Đang xử lý</Badge>;
}

function OrdersPage() {
  const { token } = useAuth();
  const notifications = useNotifications();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api("/orders?per_page=20", { token })
      .then((data) => {
        if (!active) return;
        setOrders(data?.data || []);
        setMeta(data?.meta || null);
      })
      .catch((requestError) => {
        if (active) notifications.error(errorMessage(requestError), { title: "Không tải được đơn hàng" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const paidTotal = orders
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Tài khoản"
        title="Đơn hàng của tôi"
        description="Tra cứu hóa đơn demo, khóa học đã kích hoạt và trạng thái thanh toán."
        actions={
          <Link to="/packages">
            <Button variant="secondary">
              <ShoppingBag className="h-4 w-4" />
              Mua thêm
            </Button>
          </Link>
        }
      />


      {!loading && orders.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs text-muted">Tổng đơn hàng</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{meta?.total ?? orders.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted">Đã thanh toán</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{formatPrice(paidTotal)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted">Phương thức</p>
            <p className="mt-1 text-2xl font-semibold text-ink">Demo</p>
          </Card>
        </div>
      ) : null}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        ) : orders.length ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                      <ReceiptText className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-semibold text-ink">{order.code}</p>
                        {statusBadge(order.status)}
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(order.paid_at || order.created_at)} · {(order.items || []).length} khóa học
                      </p>
                      <div className="mt-3 space-y-1">
                        {(order.items || []).map((item) => (
                          <p key={item.id} className="line-clamp-1 text-sm text-ink/80">
                            {item.package_title}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="text-lg font-semibold text-ink">{formatPrice(order.total)}</p>
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="secondary" size="sm">
                        Chi tiết
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line bg-canvas/45 px-5 py-3 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    Thanh toán demo
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    Đã kích hoạt khóa học
                  </span>
                  {order.coupon_code ? (
                    <span className="font-mono">Mã: {order.coupon_code}</span>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="Chưa có đơn hàng"
            description="Sau khi mua khóa học, hóa đơn demo và trạng thái kích hoạt sẽ xuất hiện tại đây."
            action={
              <Link to="/packages">
                <Button>
                  Chọn khóa học đầu tiên
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </>
  );
}

export default function Orders() {
  return (
    <RequireAuth>
      <OrdersPage />
    </RequireAuth>
  );
}
