import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  Mail,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { api, errorMessage } from "../../lib/api";
import { useAuth } from "../../context/auth";
import {
  Alert,
  Badge,
  Button,
  Card,
  LoadingScreen,
  PageHeader,
} from "../../components/ui";
import { formatDate, formatPrice } from "../../lib/format";

export function meta() {
  return [{ title: "Chi tiết đơn hàng — Quản trị" }];
}

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api(`/admin/orders/${orderId}`, { token })
      .then((data) => {
        if (active) setOrder(data?.data || null);
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
  }, [orderId, token]);

  if (loading) return <LoadingScreen label="Đang tải đơn hàng..." />;

  if (error || !order) {
    return (
      <>
        <PageHeader eyebrow="Kinh doanh" title="Không tìm thấy đơn hàng" />
        <Alert className="mt-5" tone="error">
          {error || "Đơn hàng không tồn tại."}
        </Alert>
        <Link to="/admin/orders" className="mt-5 inline-flex">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Về danh sách đơn hàng
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Tất cả đơn hàng
        </Link>
        <Badge tone={order.status === "paid" ? "success" : "neutral"}>
          {order.status === "paid" ? "Đã thanh toán" : order.status}
        </Badge>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-line bg-canvas/45 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-steel">
                Hóa đơn quản trị
              </p>
              <p className="mt-1 font-mono text-xl font-semibold text-ink">{order.code}</p>
              <p className="mt-1 text-xs text-muted">Tạo lúc {formatDate(order.created_at)}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-muted">Tổng thanh toán</p>
              <p className="text-2xl font-semibold text-ink">{formatPrice(order.total)}</p>
              <p className="mt-1 text-xs text-muted">
                Thanh toán: {formatDate(order.paid_at)}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-ink">Khóa học trong đơn</h2>
            <div className="mt-3 divide-y divide-line rounded-lg border border-line">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                    <ReceiptText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{item.package_title}</p>
                    <p className="text-[11px] text-muted">Số lượng: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 ml-auto max-w-sm space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted">Tạm tính</span>
                <span className="font-medium text-ink">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Giảm giá</span>
                <span className={order.discount ? "font-medium text-success" : "text-muted"}>
                  {order.discount ? `−${formatPrice(order.discount)}` : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-2.5">
                <span className="font-medium text-ink">Tổng cộng</span>
                <span className="text-lg font-semibold text-ink">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-steel" />
              <h2 className="text-sm font-semibold text-ink">Học viên</h2>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sm font-semibold uppercase text-powder">
                {order.user?.name?.slice(0, 1) || "H"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{order.user?.name || "—"}</p>
                <p className="truncate text-xs text-muted">{order.user?.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-line pt-3 text-xs text-muted">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {order.user?.email || "—"}
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-success" />
                Tài khoản đã kích hoạt khóa học
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-steel" />
              <h2 className="text-sm font-semibold text-ink">Thanh toán</h2>
            </div>
            <dl className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Phương thức</dt>
                <dd className="font-medium text-ink">Demo</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Mã giảm giá</dt>
                <dd className="font-mono text-ink">{order.coupon_code || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Ngày thanh toán</dt>
                <dd className="text-right font-medium text-ink">{formatDate(order.paid_at)}</dd>
              </div>
            </dl>
          </Card>

          <Link to="/admin/orders" className="block">
            <Button variant="secondary" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Về danh sách
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
