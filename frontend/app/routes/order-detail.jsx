import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Download,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { RequireAuth } from "../components/auth-gate";
import { useNotifications } from "../components/notifications";
import { formatDate, formatPrice } from "../lib/format";
import {
  Badge,
  Button,
  Card,
  LoadingScreen,
  PageHeader,
} from "../components/ui";

export function meta() {
  return [{ title: "Chi tiết đơn hàng — ExamPlatform" }];
}

function OrderDetailPage() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const notifications = useNotifications();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const successNotifiedRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api(`/orders/${orderId}`, { token })
      .then((data) => {
        if (active) setOrder(data?.data || null);
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
  }, [orderId, token]);

  const isSuccess = searchParams.get("success") === "1" && order?.status === "paid";

  useEffect(() => {
    if (!isSuccess || successNotifiedRef.current) return;
    successNotifiedRef.current = true;
    notifications.success("Khóa học đã được kích hoạt và thêm vào thư viện của bạn.", {
      title: "Thanh toán thành công",
    });
  }, [isSuccess, notifications]);

  if (loading) {
    return (
      <>
        <LoadingScreen label="Đang tải đơn hàng..." />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <PageHeader eyebrow="Đơn hàng" title="Không tìm thấy đơn hàng" />
          <p className="mt-5 text-sm text-muted">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Link to="/orders" className="mt-5 inline-block">
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
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Tất cả đơn hàng
        </Link>
        <Badge tone="success">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Đơn hàng demo
        </Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-line bg-canvas/45 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-steel">
                Hóa đơn
              </p>
              <h1 className="mt-1 font-mono text-xl font-semibold text-ink">{order.code}</h1>
              <p className="mt-1 text-xs text-muted">
                Tạo lúc {formatDate(order.created_at)}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-muted">Tổng thanh toán</p>
              <p className="text-2xl font-semibold tracking-tight text-ink">
                {formatPrice(order.total)}
              </p>
              <Badge className="mt-2" tone="success">
                {order.status === "paid" ? "Đã thanh toán" : order.status}
              </Badge>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-ink">Khóa học đã mua</h2>
            <div className="mt-3 divide-y divide-line rounded-lg border border-line">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                    <ReceiptText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.package_title}</p>
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
              <div className="flex justify-between gap-4">
                <span className="text-muted">Phí xử lý</span>
                <span className="font-medium text-success">Miễn phí</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-2.5">
                <span className="font-medium text-ink">Tổng cộng</span>
                <span className="text-lg font-semibold text-ink">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line bg-canvas/45 px-5 py-4 sm:px-6">
            <Link to="/my-courses">
              <Button>
                Vào khóa học của tôi
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/packages">
              <Button variant="secondary">Tiếp tục mua</Button>
            </Link>
            <Button variant="ghost" disabled title="Hóa đơn demo chưa hỗ trợ tải PDF">
              <Download className="h-4 w-4" />
              Tải hóa đơn
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-steel" />
              <h2 className="text-sm font-semibold text-ink">Thông tin thanh toán</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Phương thức</dt>
                <dd className="inline-flex items-center gap-1.5 font-medium text-ink">
                  <CreditCard className="h-3.5 w-3.5 text-steel" />
                  Thanh toán demo
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Trạng thái</dt>
                <dd>
                  <Badge tone="success">Đã kích hoạt</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Ngày thanh toán</dt>
                <dd className="text-right font-medium text-ink">
                  {formatDate(order.paid_at)}
                </dd>
              </div>
              {order.coupon_code ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Mã giảm giá</dt>
                  <dd className="font-mono text-xs font-medium text-ink">{order.coupon_code}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card className="bg-mist/45 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-steel" />
              Cam kết của ExamPlatform
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              <li>• Kích hoạt khóa học ngay sau khi thanh toán demo.</li>
              <li>• Truy cập tài liệu trọn đời, không giới hạn lượt xem.</li>
              <li>• Hỗ trợ cập nhật nội dung miễn phí.</li>
            </ul>
          </Card>

          <Card className="p-5">
            <p className="text-xs leading-5 text-muted">
              Đây là hóa đơn mô phỏng phục vụ đồ án. Không có giao dịch hoặc thông tin thẻ thật
              nào được xử lý.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function OrderDetail() {
  return (
    <RequireAuth>
      <OrderDetailPage />
    </RequireAuth>
  );
}
