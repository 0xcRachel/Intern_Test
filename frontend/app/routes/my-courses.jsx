import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Headphones,
  Layers3,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import { RequireAuth } from "../components/auth-gate";
import { Reveal } from "../components/reveal";
import { formatPrice } from "../lib/format";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
} from "../components/ui";

export function meta() {
  return [{ title: "Khóa học của tôi — ExamPlatform" }];
}

function MyCoursesPage() {
  const { token } = useAuth();
  const { items: cartItems, count: cartCount, subtotal } = useCart();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api("/my/courses", { token })
      .then((data) => {
        if (active) setCourses(data?.data || []);
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
  }, [token]);

  const units = courses.reduce((sum, course) => sum + (course.units?.length || 0), 0);
  const documents = courses.reduce(
    (sum, course) =>
      sum + (course.units || []).reduce((unitSum, unit) => unitSum + (unit.documents?.length || 0), 0),
    0,
  );
  const hours = courses.reduce((sum, course) => sum + (Number(course.duration_hours) || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Thư viện của tôi"
        title="Khóa học đã sở hữu"
        description="Mọi tài liệu bạn đã mua được lưu tại đây. Mở tài liệu đã mở khóa hoặc quay lại đề luyện tập."
        actions={
          <Link to="/packages">
            <Button variant="secondary">
              <ShoppingBag className="h-4 w-4" />
              Khám phá thêm
            </Button>
          </Link>
        }
      />

      {error ? (
        <Alert className="mt-5" tone="error" title="Không tải được khóa học">
          {error}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Khóa học", value: courses.length, icon: GraduationCap },
          { label: "Unit", value: units, icon: Layers3 },
          { label: "Tài liệu", value: documents, icon: FileText },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Reveal key={stat.label} delay={index * 0.04}>
              <Card className="flex items-center gap-4 p-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-steel">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-ink">
                    {loading ? "—" : stat.value}
                  </p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : courses.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {courses.map((course, index) => {
                const documentCount = (course.units || []).reduce(
                  (sum, unit) => sum + (unit.documents?.length || 0),
                  0,
                );
                return (
                  <Reveal key={course.id} delay={index * 0.05}>
                    <Card className="group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_rgba(20,35,44,0.35)]">
                      <div className="relative overflow-hidden bg-ink p-5 text-white">
                        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-powder/20 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                        <div className="relative flex items-center justify-between">
                          <Badge tone="dark" className="border-white/20 bg-white/10 text-white">
                            {course.level || "IELTS"}
                          </Badge>
                          <span className="inline-flex items-center gap-1 text-[11px] text-white/60">
                            <CheckCircle2 className="h-3.5 w-3.5 text-powder" />
                            Đã sở hữu
                          </span>
                        </div>
                        <h2 className="relative mt-6 line-clamp-2 text-xl font-semibold leading-snug tracking-tight">
                          {course.title}
                        </h2>
                        <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-white/55">
                          {course.description}
                        </p>
                        <div className="relative mt-4 flex flex-wrap gap-3 text-[11px] text-white/60">
                          <span className="inline-flex items-center gap-1.5">
                            <Layers3 className="h-3.5 w-3.5 text-powder" />
                            {course.units?.length || 0} unit
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-powder" />
                            {documentCount} tài liệu
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5 text-powder" />
                            {course.duration_hours || 0} giờ
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                        <div className="flex flex-wrap gap-2">
                          {(course.units || []).slice(0, 3).map((unit) => (
                            <span
                              key={unit.id}
                              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[10px] text-muted"
                            >
                              <BookOpen className="h-3 w-3 text-steel" />
                              <span className="truncate">{unit.title}</span>
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] text-muted">
                            Đã mua · {course.order_code || "Demo"}
                          </span>
                          <Link to={`/packages/${course.slug || course.id}`}>
                            <Button size="sm">
                              Vào học
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          ) : !error ? (
            <EmptyState
              icon={GraduationCap}
              title="Chưa có khóa học nào"
              description="Sau khi thanh toán demo, khóa học sẽ xuất hiện trong thư viện này."
              action={
                <Link to="/packages">
                  <Button>
                    Khám phá tài liệu
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              }
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <Reveal>
            <Card className="overflow-hidden">
              <div className="border-b border-line bg-canvas/45 px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-ink">Khóa học đã chọn</h2>
                  <Badge tone="neutral">{cartCount}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">Giỏ hàng hiện tại của bạn.</p>
              </div>
              {cartItems.length ? (
                <div className="divide-y divide-line">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 px-5 py-3">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mist text-steel">
                        <BookOpen className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-ink">{item.title}</span>
                        <span className="text-[10px] text-muted">{formatPrice(item.price)}</span>
                      </span>
                    </div>
                  ))}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Tạm tính</span>
                      <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
                    </div>
                    <Link to="/checkout" className="mt-3 block">
                      <Button className="w-full" size="sm">
                        Thanh toán
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-6 text-center">
                  <p className="text-xs leading-5 text-muted">
                    Chưa chọn khóa học nào.{" "}
                    <Link to="/packages" className="font-medium text-steel hover:text-ink">
                      Xem tài liệu →
                    </Link>
                  </p>
                </div>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card className="bg-mist/45 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Sparkles className="h-4 w-4 text-steel" />
                Gợi ý học tập
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
                <li className="flex items-start gap-2">
                  <Headphones className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
                  Nghe lại audio một lần trước khi mở transcript.
                </li>
                <li className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
                  Đặt mục tiêu 2 unit mỗi tuần để giữ nhịp.
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-steel" />
                  Làm đề sau mỗi unit để kiểm tra tiến bộ.
                </li>
              </ul>
              <Link
                to="/exams"
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-steel hover:text-ink"
              >
                Vào đề luyện tập <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="p-5">
              <p className="text-xs leading-5 text-muted">
                Thư viện của bạn có tổng cộng {hours} giờ nội dung ước tính. Thời gian học thực tế
                chưa được theo dõi trong bản demo này.
              </p>
            </Card>
          </Reveal>
        </div>
      </div>
    </>
  );
}

export default function MyCourses() {
  return (
    <RequireAuth>
      <MyCoursesPage />
    </RequireAuth>
  );
}
