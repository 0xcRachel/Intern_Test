import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Headphones,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import { formatPrice } from "../lib/format";
import { DocumentPreviewModal } from "../components/document-preview";
import { Reveal } from "../components/reveal";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
} from "../components/ui";

export function meta() {
  return [{ title: "Chi tiết khóa học — ExamPlatform" }];
}

function CurriculumUnit({
  unit,
  index,
  owned,
  previewLoadingId,
  handlePreview,
}) {
  const [open, setOpen] = useState(index === 0);
  const documents = unit.documents || [];

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 bg-canvas/45 px-5 py-4 text-left transition-colors hover:bg-mist/35"
      >
        <span className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-semibold text-powder">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink">{unit.title}</span>
            <span className="mt-1 block text-xs leading-5 text-muted">{unit.description}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <Badge tone="neutral">{documents.length} tài liệu</Badge>
          <ChevronDown
            className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div className="divide-y divide-line">
          {documents.length ? (
            documents.map((document) => {
              const Icon = document.type === "audio" ? Headphones : FileText;
              return (
                <div
                  key={document.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{document.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {document.type.toUpperCase()} · {document.total_pages} trang ·{" "}
                        {owned ? (
                          <span className="text-success">Đã mở khóa</span>
                        ) : (
                          `preview ${document.preview_pages} trang`
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={owned ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handlePreview(document)}
                    disabled={previewLoadingId === document.id}
                  >
                    {previewLoadingId === document.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : owned ? (
                      <BookOpen className="h-3.5 w-3.5" />
                    ) : null}
                    {owned ? "Mở tài liệu" : "Xem trước"}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-6">
              <EmptyState
                icon={BookOpen}
                title="Unit chưa có tài liệu"
                description="Tài liệu của unit này sẽ xuất hiện khi được bổ sung."
              />
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export default function PackageDetail() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { add, has } = useCart();
  const [packageItem, setPackageItem] = useState(null);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewLoadingId, setPreviewLoadingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  async function loadPackage() {
    setLoading(true);
    setError("");
    try {
      const data = await api(`/packages/${packageId}`);
      setPackageItem(data?.data || null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackage();
  }, [packageId]);

  useEffect(() => {
    if (!token) {
      setOwned(false);
      return;
    }
    let active = true;
    api("/my/courses", { token })
      .then((data) => {
        if (!active) return;
        setOwned((data?.data || []).some((course) =>
          String(course.id) === String(packageId) || String(course.slug) === String(packageId),
        ));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [packageId, token]);

  async function handlePreview(document) {
    setPreviewError("");
    if (!token) {
      navigate(`/login?next=${encodeURIComponent(`/packages/${packageId}`)}`);
      return;
    }
    setPreviewLoadingId(document.id);
    try {
      const data = await api(`/documents/${document.id}/preview`, {
        method: "POST",
        token,
      });
      setPreviewDocument(document);
      setPreview(data);
    } catch (requestError) {
      setPreviewError(errorMessage(requestError));
    } finally {
      setPreviewLoadingId(null);
    }
  }

  function addToCart() {
    if (!token) {
      navigate(`/login?next=${encodeURIComponent(`/packages/${packageId}`)}`);
      return;
    }
    add(packageItem);
  }

  function buyNow() {
    if (!token) {
      navigate(`/login?next=${encodeURIComponent(`/packages/${packageId}`)}`);
      return;
    }
    add(packageItem);
    navigate("/checkout");
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-5 py-10 sm:px-6">
        <Skeleton className="h-8 w-52" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-[340px]" />
          <Skeleton className="h-[340px]" />
        </div>
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (error || !packageItem) {
    return (
      <div className="mx-auto w-full max-w-[1216px] px-5 py-10 sm:px-6">
        <Alert tone="error" title="Không tìm thấy khóa học">
          {error || "Khóa học không tồn tại hoặc đã bị ẩn."}
        </Alert>
        <Link
          to="/packages"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-surface-raised px-4 text-sm font-medium text-ink hover:border-steel/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Về danh sách tài liệu
        </Link>
      </div>
    );
  }

  const units = packageItem.units || [];
  const documents = units.flatMap((unit) => unit.documents || []);
  const pdfCount = documents.filter((document) => document.type === "pdf").length;
  const audioCount = documents.filter((document) => document.type === "audio").length;
  const inCart = has(packageItem.id);
  const outcomes =
    packageItem.outcomes?.length
      ? packageItem.outcomes
      : [
          "Nắm cấu trúc đề và chiến lược làm bài theo từng dạng câu hỏi.",
          "Luyện tập với tài liệu PDF, audio và transcript chi tiết.",
          "Theo dõi tiến độ qua từng unit và đề luyện tập.",
          "Truy cập trọn đời và nhận cập nhật nội dung miễn phí.",
        ];

  return (
    <div className="mx-auto w-full max-w-[1216px] px-5 py-8 sm:px-6 sm:py-10">
      <Link
          to="/packages"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Tất cả tài liệu
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Reveal className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-powder/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-sand/20 blur-3xl" />
            <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 text-[150px] font-bold leading-none tracking-tighter text-white/[0.035] xl:block">
              IELTS
            </div>

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="dark" className="border-white/15 bg-white/10 text-white">
                  {packageItem.level || "IELTS"}
                </Badge>
                {packageItem.is_featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-powder px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink">
                    <Sparkles className="h-3 w-3" />
                    Khóa học nổi bật
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium text-white/65">
                  <ShieldCheck className="h-3 w-3 text-powder" />
                  Truy cập trọn đời
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {packageItem.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                {packageItem.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-powder text-powder" />
                  <strong className="font-semibold text-white">
                    {Number(packageItem.rating || 4.8).toFixed(1)}
                  </strong>
                  đánh giá
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-powder" />
                  {Number(packageItem.students_count || 0).toLocaleString("vi-VN")} học viên
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-powder" />
                  {packageItem.duration_hours || 0} giờ học
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-powder" />
                  {units.length} unit · {documents.length} tài liệu
                </span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-powder text-sm font-semibold text-ink">
                  EP
                </span>
                <div>
                  <p className="text-xs font-medium text-white">ExamPlatform Academic Team</p>
                  <p className="text-[11px] text-white/45">Biên soạn và cập nhật theo format IELTS mới nhất</p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden">
              <div className="border-b border-line px-5 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-steel">
                  Học phí trọn đời
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <p className="text-3xl font-semibold tracking-tight text-ink">
                    {formatPrice(packageItem.price)}
                  </p>
                  <span className="mb-1 text-xs text-muted">/ một lần</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Dùng mã <span className="font-mono font-medium text-ink">IELTS10</span> giảm 10% khi thanh toán.
                </p>

                {owned ? (
                  <div className="mt-4 rounded-lg border border-[#c8dfd1] bg-[#eef6f0] p-3">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Bạn đã sở hữu khóa học này
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-success/80">
                      Toàn bộ tài liệu đã được mở khóa trong thư viện của bạn.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 p-5">
                {owned ? (
                  <>
                    <a
                      href="#curriculum"
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-powder px-4 text-sm font-semibold text-ink transition-colors hover:bg-[#8bb9cf]"
                    >
                      <GraduationCap className="h-4 w-4" />
                      Vào học ngay
                    </a>
                    <Link
                      to="/my-courses"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface-raised px-4 text-sm font-medium text-ink hover:border-steel/60"
                    >
                      Khóa học của tôi
                    </Link>
                  </>
                ) : (
                  <>
                    <Button className="w-full" size="lg" onClick={buyNow}>
                      <ShoppingBag className="h-4 w-4" />
                      Mua ngay
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={addToCart}
                      disabled={inCart}
                    >
                      {inCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                      {inCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
                    </Button>
                    {inCart ? (
                      <Link
                        to="/checkout"
                        className="flex items-center justify-center gap-1 text-xs font-medium text-steel hover:text-ink"
                      >
                        Đi đến giỏ hàng
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </>
                )}

                <div className="border-t border-line pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Bao gồm
                  </p>
                  <ul className="mt-3 space-y-2.5 text-xs text-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {units.length} unit học có lộ trình
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {pdfCount} tài liệu PDF, {audioCount} audio kèm transcript
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      Đề luyện tập và xem lại đáp án
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      Cập nhật nội dung miễn phí
                    </li>
                  </ul>
                </div>

                <p className="flex items-start gap-1.5 text-[11px] leading-5 text-muted">
                  <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Thanh toán demo an toàn, không phát sinh chi phí thật.
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Reveal>
              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-steel" />
                  <h2 className="text-lg font-semibold text-ink">Bạn sẽ học được gì</h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {outcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="flex items-start gap-2.5 rounded-lg border border-line bg-canvas/40 p-3 text-sm leading-6 text-muted"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {outcome}
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>

            <section id="curriculum" className="scroll-mt-24">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">Nội dung khóa học</h2>
                <Badge tone="neutral">
                  {units.length} unit · {documents.length} tài liệu
                </Badge>
              </div>
              <div className="space-y-4">
                {units.length ? (
                  units.map((unit, index) => (
                    <Reveal key={unit.id} delay={index * 0.03}>
                      <CurriculumUnit
                        unit={unit}
                        index={index}
                        owned={owned}
                        previewLoadingId={previewLoadingId}
                        handlePreview={handlePreview}
                      />
                    </Reveal>
                  ))
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="Chưa có nội dung"
                    description="Khóa học đang được cập nhật tài liệu."
                  />
                )}
              </div>
            </section>

            {previewError ? (
              <Alert tone="error" title="Preview chưa khả dụng">
                {previewError}
              </Alert>
            ) : null}
          </div>

          <div className="space-y-4">
            <Reveal>
              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-steel" />
                  <h2 className="text-sm font-semibold text-ink">Phù hợp với ai?</h2>
                </div>
                <p className="mt-3 text-xs leading-6 text-muted">
                  Học viên đang chuẩn bị IELTS Academic hoặc General Training, cần lộ trình rõ
                  ràng và tài liệu có thể xem lại bất cứ lúc nào.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="blue">{packageItem.level || "Mọi trình độ"}</Badge>
                  <Badge tone="sand">Tự học linh hoạt</Badge>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.05}>
              <Card className="bg-mist/45 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <ShieldCheck className="h-4 w-4 text-steel" />
                  Học thử trước khi mua
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Mỗi tài liệu đều có trang xem trước. Đăng nhập để mở preview và kiểm tra chất
                  lượng nội dung.
                </p>
                {!token ? (
                  <Link
                    to={`/login?next=${encodeURIComponent(`/packages/${packageId}`)}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-steel hover:text-ink"
                  >
                    Đăng nhập để xem thử
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </Card>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-ink">Sẵn sàng luyện đề?</h2>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Áp dụng kiến thức ngay với đề thi có chấm điểm và xem lại đáp án.
                </p>
                <Link to="/exams" className="mt-3 inline-flex">
                  <Button variant="secondary" size="sm">
                    Xem đề luyện tập
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </Card>
            </Reveal>
          </div>
        </div>

        <Card className="mt-8 flex flex-col gap-4 bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Bắt đầu lộ trình ngay hôm nay</h2>
            <p className="mt-1 text-sm text-white/55">
              Thanh toán demo, mở khóa toàn bộ tài liệu và học theo nhịp của bạn.
            </p>
          </div>
          {owned ? (
            <Link
              to="/my-courses"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-powder px-5 text-sm font-semibold text-ink hover:bg-[#8bb9cf]"
            >
              Vào khóa học của tôi
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Button onClick={buyNow} size="lg">
              <ShoppingBag className="h-4 w-4" />
              Mua khóa học
            </Button>
          )}
        </Card>

      <DocumentPreviewModal
        open={Boolean(preview && previewDocument)}
        onClose={() => {
          setPreview(null);
          setPreviewDocument(null);
        }}
        document={previewDocument}
        preview={preview}
      />
    </div>
  );
}
