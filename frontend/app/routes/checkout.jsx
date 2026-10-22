import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Wallet,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import { RequireAuth } from "../components/auth-gate";
import { useNotifications } from "../components/notifications";
import { formatPrice } from "../lib/format";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Spinner,
} from "../components/ui";

export function meta() {
  return [{ title: "Thanh toán — ExamPlatform" }];
}

function CheckoutPage() {
  const { token } = useAuth();
  const { items, remove, clear } = useCart();
  const notifications = useNotifications();
  const navigate = useNavigate();
  const quoteKeyRef = useRef("");
  const quoteSequenceRef = useRef(0);
  const [ownedIds, setOwnedIds] = useState([]);
  const [ownedReady, setOwnedReady] = useState(false);
  const [summary, setSummary] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applying, setApplying] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [paying, setPaying] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const ownedSet = useMemo(() => new Set(ownedIds), [ownedIds]);
  const payableItems = useMemo(
    () => items.filter((item) => !ownedSet.has(item.id)),
    [items, ownedSet],
  );
  const ownedItems = useMemo(
    () => items.filter((item) => ownedSet.has(item.id)),
    [items, ownedSet],
  );
  const packageIds = useMemo(() => payableItems.map((item) => item.id), [payableItems]);
  const payableCount = payableItems.length;
  const payableSubtotal = payableItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );
  const cartKey = packageIds.join(",");
  const quotePending = !ownedReady || loadingQuote;
  const total = summary?.total ?? payableSubtotal;

  useEffect(() => {
    let active = true;
    setOwnedReady(false);
    api("/my/courses?per_page=100", { token })
      .then((data) => {
        if (!active) return;
        setOwnedIds((data?.data || []).map((course) => course.id));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setOwnedReady(true);
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!ownedReady) return;

    if (!packageIds.length) {
      setSummary(null);
      setLoadingQuote(false);
      quoteKeyRef.current = "";
      return;
    }

    const couponCode = appliedCoupon?.code || null;
    const quoteKey = `${cartKey}|${couponCode || "no-coupon"}`;
    if (quoteKeyRef.current === quoteKey) return;

    quoteKeyRef.current = quoteKey;
    const sequence = ++quoteSequenceRef.current;
    let active = true;
    setLoadingQuote(true);
    setSummary(null);

    api("/checkout/quote", {
      method: "POST",
      token,
      body: { package_ids: packageIds, coupon: couponCode },
    })
      .then((data) => {
        if (active && sequence === quoteSequenceRef.current) setSummary(data?.data || null);
      })
      .catch((requestError) => {
        if (!active || sequence !== quoteSequenceRef.current) return;
        quoteKeyRef.current = "";
        setSummary(null);
        notifications.error(errorMessage(requestError), {
          title: "Không thể tính đơn hàng",
        });
      })
      .finally(() => {
        if (active && sequence === quoteSequenceRef.current) setLoadingQuote(false);
      });

    return () => {
      active = false;
    };
  }, [cartKey, token, appliedCoupon?.code, ownedReady, notifications]);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      notifications.warning("Nhập mã giảm giá trước khi áp dụng.");
      return;
    }
    if (!packageIds.length) {
      notifications.warning("Không có khóa học nào cần thanh toán để áp dụng mã.");
      return;
    }
    setApplying(true);
    try {
      const data = await api("/checkout/quote", {
        method: "POST",
        token,
        body: { package_ids: packageIds, coupon: code },
      });
      const nextSummary = data?.data || null;
      quoteKeyRef.current = `${cartKey}|${code}`;
      quoteSequenceRef.current += 1;
      setSummary(nextSummary);
      setAppliedCoupon(nextSummary?.coupon || { code });
      setCouponInput(code);
      setLoadingQuote(false);
      notifications.success(
        nextSummary?.coupon
          ? `Đã áp dụng ${nextSummary.coupon.code} · giảm ${formatPrice(nextSummary.discount)}.`
          : "Đã áp dụng mã giảm giá.",
        { title: "Mã giảm giá hợp lệ" },
      );
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Mã giảm giá không hợp lệ" });
    } finally {
      setApplying(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
  }

  async function handleCheckout() {
    if (!accepted) {
      notifications.warning("Vui lòng đồng ý với điều khoản trước khi thanh toán.");
      return;
    }
    if (!packageIds.length) {
      notifications.warning("Không có khóa học nào cần thanh toán.");
      return;
    }
    setPaying(true);
    try {
      const data = await api("/checkout", {
        method: "POST",
        token,
        body: {
          package_ids: packageIds,
          coupon: appliedCoupon?.code || null,
          payment_method: "demo",
        },
      });
      clear();
      notifications.success("Thanh toán demo thành công. Khóa học đã được kích hoạt.", {
        title: "Đơn hàng hoàn tất",
      });
      navigate(`/orders/${data.data.id}?success=1`);
    } catch (requestError) {
      notifications.error(errorMessage(requestError), { title: "Thanh toán không thành công" });
    } finally {
      setPaying(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Thanh toán"
        title="Hoàn tất đơn hàng"
        description="Thanh toán demo kích hoạt khóa học ngay lập tức. Không có giao dịch thật nào được thực hiện."
        actions={
          <Link to="/packages">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Tiếp tục chọn
            </Button>
          </Link>
        }
      />

      {!items.length ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Giỏ hàng đang trống"
            description="Thêm một gói tài liệu IELTS để tiến hành thanh toán demo."
            action={
              <Link to="/packages">
                <Button>
                  Khám phá tài liệu
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas/45 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Khóa học thanh toán</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {payableCount
                      ? `${payableCount} khóa học${
                          ownedItems.length
                            ? ` · ${ownedItems.length} khóa đã sở hữu được tách riêng`
                            : " · truy cập trọn đời"
                        }`
                      : `${ownedItems.length} khóa đã sở hữu · không cần thanh toán`}
                  </p>
                </div>
                <Badge tone={payableCount ? "neutral" : "success"}>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {payableCount ? `${payableCount} sẵn sàng` : "Đã sở hữu"}
                </Badge>
              </div>

              {payableItems.length ? (
                <div className="divide-y divide-line">
                  {payableItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                    >
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-mist text-steel">
                        <ShoppingBag className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{item.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {item.level || "IELTS"} · Tài liệu PDF & audio · Cập nhật miễn phí
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <p className="text-sm font-semibold text-ink">{formatPrice(item.price)}</p>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f2ec] text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium text-ink">
                    Bạn đã sở hữu tất cả khóa học trong giỏ
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
                    Không cần thanh toán thêm. Mở thư viện để tiếp tục học hoặc chọn tài liệu mới.
                  </p>
                  <Link to="/my-courses" className="mt-4 inline-flex">
                    <Button variant="secondary" size="sm">
                      Mở khóa học của tôi
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              )}

              {ownedItems.length ? (
                <div className="border-t border-line bg-canvas/35 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Đã sở hữu · không tính phí
                    </p>
                    <Link
                      to="/my-courses"
                      className="inline-flex items-center gap-1 text-xs font-medium text-steel transition-colors hover:text-ink"
                    >
                      Mở thư viện
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2">
                    {ownedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3 py-2.5"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-ink">{item.title}</p>
                          <p className="text-[11px] text-muted">Đã kích hoạt trong tài khoản</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-mist hover:text-danger"
                          aria-label={`Xóa ${item.title} khỏi giỏ`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>

            {payableCount ? (
              <>
                <Card className="p-5">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-steel" />
                    <h2 className="text-sm font-semibold text-ink">Mã giảm giá</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Dùng <span className="font-mono font-medium text-ink">IELTS10</span> để được giảm 10% cho đơn hàng này.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="coupon-code"
                      name="coupon"
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      aria-label="Mã giảm giá"
                      className="sm:max-w-xs"
                      disabled={Boolean(appliedCoupon)}
                    />
                    {appliedCoupon ? (
                      <Button variant="secondary" onClick={removeCoupon}>
                        Bỏ mã
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={applyCoupon}
                        disabled={applying || loadingQuote}
                      >
                        {applying ? <Spinner /> : <Tag className="h-4 w-4" />}
                        Áp dụng
                      </Button>
                    )}
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-steel" />
                    <h2 className="text-sm font-semibold text-ink">Phương thức thanh toán</h2>
                  </div>
                  <div className="mt-3 rounded-lg border border-steel/45 bg-mist/45 p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface-raised text-steel">
                        <CreditCard className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-ink">Thanh toán demo</p>
                          <Badge tone="blue">Khuyên dùng</Badge>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          Mô phỏng thanh toán thành công và ghi danh ngay. Thẻ của bạn không bị trừ tiền.
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-steel" />
                    </div>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-muted">
                    <input
                      id="accept-terms"
                      name="accept_terms"
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      required
                      className="mt-0.5 h-4 w-4 rounded border-line text-steel focus:ring-steel/30"
                    />
                    <span>
                      Tôi đồng ý với điều khoản sử dụng và hiểu đây là giao dịch demo, không phát sinh
                      chi phí thật.
                    </span>
                  </label>
                </Card>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Thông tin đăng nhập được bảo vệ bằng token Sanctum.
                </div>
              </>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden">
              <div className="bg-ink px-5 py-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                    Tóm tắt đơn hàng
                  </p>
                  <Sparkles className="h-4 w-4 text-powder" />
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {quotePending ? "—" : formatPrice(total)}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {!payableCount
                    ? "Không cần thanh toán"
                    : appliedCoupon
                      ? `Đã giảm ${formatPrice(summary?.discount || 0)}`
                      : "Chưa áp dụng mã giảm giá"}
                </p>
              </div>
              <div className="space-y-3 p-5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Tạm tính ({payableCount} khóa học)</span>
                  <span className="font-medium text-ink">
                    {formatPrice(summary?.subtotal ?? payableSubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Giảm giá</span>
                  <span className={summary?.discount ? "font-medium text-success" : "text-muted"}>
                    {summary?.discount ? `−${formatPrice(summary.discount)}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Phí xử lý</span>
                  <span className="font-medium text-success">Miễn phí</span>
                </div>
                <div className="border-t border-line pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">Tổng cộng</span>
                    <span className="text-lg font-semibold text-ink">
                      {quotePending ? "—" : formatPrice(total)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">
                    Thanh toán một lần, mở lại tài liệu đã mua bất cứ lúc nào.
                  </p>
                </div>

                {ownedItems.length ? (
                  <div className="flex items-start gap-2 rounded-lg border border-line bg-canvas/55 px-3 py-2.5 text-[11px] leading-5 text-muted">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <span>
                      {ownedItems.length} khóa học đã sở hữu được tách khỏi đơn thanh toán.
                    </span>
                  </div>
                ) : null}

                {payableCount ? (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={paying || quotePending || !summary || !accepted}
                  >
                    {paying ? <Spinner /> : <BadgeCheck className="h-4 w-4" />}
                    {paying ? "Đang kích hoạt..." : "Thanh toán demo"}
                  </Button>
                ) : (
                  <Link to="/my-courses" className="block">
                    <Button className="w-full" size="lg" variant="secondary">
                      Mở khóa học của tôi
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {payableCount && !quotePending && !summary ? (
                  <p className="flex items-start gap-1.5 text-[11px] leading-5 text-danger">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Chưa tính được đơn hàng. Thử tải lại hoặc bỏ mã giảm giá.
                  </p>
                ) : null}
                {payableCount ? (
                  <p className="flex items-start gap-1.5 text-[11px] leading-5 text-muted">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    Khóa học được kích hoạt ngay sau khi xác nhận. Bạn có thể xem lại trong mục
                    “Khóa học của tôi”.
                  </p>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

export default function Checkout() {
  return (
    <RequireAuth>
      <CheckoutPage />
    </RequireAuth>
  );
}
