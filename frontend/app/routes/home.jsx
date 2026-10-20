import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Headphones,
  Layers3,
  ListChecks,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { formatPrice } from "../lib/format";
import { Alert, Badge, Button, Card } from "../components/ui";
import { useRouteMotion } from "../context/route-motion";

export function meta() {
  return [
    { title: "ExamPlatform — Luyện IELTS rõ từng bước" },
    {
      name: "description",
      content:
        "ExamPlatform giúp bạn chọn tài liệu IELTS, làm đề có thời gian và xem lại kết quả rõ ràng.",
    },
  ];
}

export default function Home() {
  const routeAnimate = useRouteMotion();
  const [packages, setPackages] = useState([]);
  const [packagesError, setPackagesError] = useState("");

  useEffect(() => {
    let active = true;
    api("/packages")
      .then((data) => {
        if (active) setPackages(data?.data || []);
      })
      .catch((error) => {
        if (active) setPackagesError(errorMessage(error));
      });
    return () => {
      active = false;
    };
  }, []);

  const featured = packages[0];
  const units = featured?.units || [];
  const documents = units.flatMap((unit) => unit.documents || []);

  return (
    <div className="bg-canvas">
      <div className="flex-1">
        <section className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-mist/80 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-sand/30 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1216px] gap-10 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <div className={routeAnimate ? "page-enter" : undefined}>
              <Badge tone="blue" className="mb-5">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Học chủ động, không đoán mò
              </Badge>
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-5xl lg:text-[57px]">
                Luyện IELTS, <span className="text-steel">rõ từng bước.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Chọn tài liệu phù hợp, làm đề trong thời gian thật và xem lại từng câu
                trả lời. Một không gian học gọn gàng để bạn tiến bộ có chủ đích.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/exams">
                  <Button size="lg">
                    Xem đề luyện tập
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/packages">
                  <Button size="lg" variant="secondary">
                    Khám phá tài liệu
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-muted">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-steel" />
                  Đề có thời gian
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-steel" />
                  Lưu câu trả lời tự động
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-steel" />
                  Xem lại kết quả
                </span>
              </div>
            </div>

            <div className={routeAnimate ? "relative page-enter" : "relative"}>
              <div className="overflow-hidden rounded-xl border border-line bg-surface-raised p-2 shadow-[0_20px_60px_-30px_rgba(20,35,44,0.35)]">
                <img
                  src="/study-desk-blue.png"
                  alt="Bàn học với sách bài tập, bút chì và tai nghe trong ánh sáng buổi sáng"
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-4 right-4 rounded-lg border border-line bg-surface-raised/95 p-3 shadow-lg backdrop-blur sm:left-8 sm:right-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-mist text-steel">
                      <Layers3 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-ink">Lộ trình 3 bước</p>
                      <p className="text-[11px] text-muted">Chọn tài liệu → Làm đề → Xem lại</p>
                    </div>
                  </div>
                  <span className="hidden items-center gap-1 text-[11px] font-medium text-steel sm:inline-flex">
                    Bắt đầu <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="border-b border-line bg-surface-sunken/35">
          <div className="mx-auto max-w-[1216px] px-5 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">
                  Một quy trình, ba bước
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  Ít lựa chọn hơn, tập trung hơn.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted">
                Mỗi bước đều có mục đích rõ ràng, để bạn biết mình đang học gì và cần
                làm gì tiếp theo.
              </p>
            </div>
            <div className="mt-8 grid overflow-hidden rounded-lg border border-line md:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  number: "01",
                  title: "Chọn tài liệu",
                  text: "Đọc mô tả unit, xem số trang và thử preview trước khi bắt đầu.",
                },
                {
                  icon: Clock3,
                  number: "02",
                  title: "Làm đề có thời gian",
                  text: "Làm bài theo đồng hồ, lưu câu trả lời và biết trạng thái từng câu.",
                },
                {
                  icon: ListChecks,
                  number: "03",
                  title: "Xem lại kết quả",
                  text: "Xem điểm, tỷ lệ đạt và những câu cần quay lại để cải thiện.",
                },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="border-b border-line p-6 last:border-b-0 md:border-b-0 md:border-r md:p-8 md:last:border-r-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-mist text-steel">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-semibold tracking-[0.16em] text-muted/60">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-canvas">
          <div className="mx-auto max-w-[1216px] px-5 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">
                  Tài liệu đang có
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  Gói học thật, nội dung rõ ràng.
                </h2>
              </div>
              <Link
                to="/packages"
                className="inline-flex items-center gap-1 text-sm font-medium text-steel hover:text-ink"
              >
                Xem tất cả tài liệu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {packagesError ? (
              <Alert className="mt-6" tone="warning" title="Chưa tải được gói học">
                {packagesError}
              </Alert>
            ) : null}

            {featured ? (
              <Card className="mt-6 overflow-hidden">
                <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="sand">IELTS</Badge>
                      <Badge tone="neutral">{units.length} units</Badge>
                      <Badge tone="neutral">{documents.length} tài liệu</Badge>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                      {featured.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                      {featured.description}
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {units.slice(0, 4).map((unit) => (
                        <div
                          key={unit.id}
                          className="rounded-md border border-line bg-canvas/50 px-3 py-2.5"
                        >
                          <p className="text-xs font-medium text-ink">{unit.title}</p>
                          <p className="mt-1 text-[11px] text-muted">
                            {(unit.documents || []).length} tài liệu
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between border-t border-line bg-mist/35 p-6 sm:p-8 lg:border-l lg:border-t-0">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-steel">
                        Học phí
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                        {formatPrice(featured.price)}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted">
                        Thanh toán demo an toàn. Khóa học và tài liệu được kích hoạt ngay sau khi
                        xác nhận.
                      </p>
                    </div>
                    <Link to={`/packages/${featured.id}`} className="mt-6">
                      <Button className="w-full">
                        Xem nội dung gói
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ) : !packagesError ? (
              <div className="mt-6 h-44 animate-pulse rounded-lg border border-line bg-surface-raised" />
            ) : null}
          </div>
        </section>

        <section className="border-b border-line bg-surface-sunken/35">
          <div className="mx-auto grid max-w-[1216px] gap-8 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">
                Trong lúc làm bài
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Không bỏ sót câu nào.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Câu đã trả lời được đánh dấu, trạng thái lưu hiển thị rõ và đồng hồ luôn
                ở trong tầm mắt. Đây là minh họa giao diện, không phải dữ liệu tài khoản.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge tone="blue">Câu 1/2</Badge>
                <Badge tone="success">Đã lưu</Badge>
                <Badge tone="sand">Còn 42:18</Badge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Câu hỏi minh họa</span>
                  <span>10 điểm</span>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-ink">
                  What is the primary objective of Section 1 in IELTS Reading?
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 rounded-md border border-steel bg-mist/70 px-3 py-2.5 text-xs text-ink">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-steel bg-surface-raised">
                      <Check className="h-3 w-3 text-steel" />
                    </span>
                    Social survival situations
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-line px-3 py-2.5 text-xs text-muted">
                    <span className="h-4 w-4 rounded-full border border-line" />
                    Academic lecture analysis
                  </div>
                </div>
              </Card>
              <Card className="flex flex-col justify-between bg-mist/45 p-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-steel">
                    Kết quả minh họa
                  </p>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-ink">10/20</p>
                  <p className="mt-1 text-xs text-muted">50% · Chưa đạt ngưỡng 70%</p>
                </div>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-sunken">
                  <div className="h-full w-1/2 rounded-full bg-steel" />
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted">
                  <PlayCircle className="h-3.5 w-3.5 text-steel" />
                  Xem lại 1 câu cần cải thiện
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-canvas">
          <div className="mx-auto grid max-w-[1216px] gap-8 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.65fr_1.35fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel">
                Hỏi đáp
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Trước khi bắt đầu.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
                Những điều cần biết về tài liệu, đề luyện tập và cách hệ thống lưu bài.
              </p>
            </div>
            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface-raised">
              {[
                {
                  q: "Tôi có cần thanh toán để xem tài liệu không?",
                  a: "Bạn có thể xem trước một số trang miễn phí. Để mở toàn bộ nội dung hiện có, hãy thêm gói học vào giỏ và hoàn tất thanh toán demo; khóa học sẽ được ghi danh ngay mà không phát sinh chi phí thật.",
                },
                {
                  q: "Preview tài liệu hoạt động như thế nào?",
                  a: "Preview tạo một URL có chữ ký, giới hạn thời gian và gắn với người dùng đang đăng nhập. Hệ thống hiện trả metadata và xác nhận quyền truy cập.",
                },
                {
                  q: "Kết quả bài làm có được lưu không?",
                  a: "Câu trả lời được lưu tạm trong lúc làm bài. Khi nộp, hệ thống chấm điểm ở server và khóa bài làm đã hoàn thành.",
                },
              ].map((item) => (
                <details key={item.q} className="group px-5 py-4 sm:px-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink">
                    {item.q}
                    <ChevronRight className="h-4 w-4 shrink-0 text-steel transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-ink">
          <div className="mx-auto flex max-w-[1216px] flex-col gap-6 px-5 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-powder">
                Sẵn sàng cho lượt luyện tiếp theo
              </p>
              <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Vào đề, làm bài và biết mình cần cải thiện điều gì.
              </h2>
            </div>
            <Link to="/exams" className="shrink-0">
              <Button size="lg" variant="primary">
                Vào đề luyện tập
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
