import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, Headphones, Layers3, Play, Sparkles, Target } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { Badge, Button, EmptyState, Skeleton } from "../components/ui";
import { PackageCard } from "../components/package-card";
import { Reveal } from "../components/reveal";
import { useNotifications } from "../components/notifications";

export function meta() {
  return [{ title: "ExamPlatform — Bắt đầu chương tiếp theo" }, { name: "description", content: "Không gian luyện IELTS của bạn. Khám phá tài liệu, luyện đề và theo dõi từng bước tiến bộ cùng ExamPlatform." }];
}

const steps = [
  { icon: BookOpen, title: "Tìm đúng tài liệu", text: "Khám phá nội dung theo trình độ. Xem trước tài liệu để chọn khóa học phù hợp với bạn.", color: "bg-mist text-steel" },
  { icon: Headphones, title: "Luyện tập có trọng tâm", text: "Kết hợp tài liệu PDF, audio và đề luyện tập. Tập trung vào kỹ năng bạn muốn cải thiện.", color: "bg-[#e6f5ee] text-success" },
  { icon: Target, title: "Hiểu từng bước tiến", text: "Xem kết quả, đối chiếu đáp án và quay lại những câu cần luyện thêm.", color: "bg-[#fff3da] text-[#986818]" },
];

export default function Home() {
  const notifications = useNotifications();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    let active = true;
    api("/packages")
      .then((data) => { if (active) setPackages(data?.data || []); })
      .catch((error) => { if (active) notifications.warning(errorMessage(error), { title: "Chưa tải được khóa học" }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.fromTo("[data-hero]", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: "power3.out", clearProps: "transform,opacity" });
        gsap.fromTo("[data-study-card]", { y: 35, rotate: 3, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1, delay: 0.2, ease: "power3.out", clearProps: "transform,opacity" });
      }, heroRef);
      return () => context.revert();
    });
    return () => motion.revert();
  }, []);

  return (
    <div className="bg-white">
      <section ref={heroRef} className="relative isolate overflow-hidden border-b border-line">
        <div className="studio-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,transparent,black)]" />
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:min-h-[700px] lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:py-24">
          <div>
            <div data-hero className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted">
              <span className="h-2 w-2 rounded-full bg-steel" /> Không gian học tập thế hệ mới <ArrowUpRight className="h-3.5 w-3.5 text-steel" />
            </div>
            <h1 data-hero className="max-w-[650px] text-[clamp(2.8rem,5.2vw,4.7rem)] font-semibold leading-[1.08] tracking-[-0.065em] text-ink">
              Mục tiêu lớn.<br />Bắt đầu từ<br /><span className="relative text-steel">một bước nhỏ.<svg className="absolute -bottom-3 left-0 w-full text-powder" viewBox="0 0 400 16" fill="none" aria-hidden="true"><path d="M3 12C95 1 241 1 396 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg></span>
            </h1>
            <p data-hero className="mt-9 max-w-md text-base leading-8 text-muted">IELTS không chỉ là một con số. Đó là cánh cửa tới chương tiếp theo của bạn. Cùng học, luyện tập và tiến bộ mỗi ngày.</p>
            <div data-hero className="mt-8 flex flex-wrap gap-3">
              <Link to="/packages"><Button size="lg" className="min-h-13 px-6">Khám phá khóa học <ArrowUpRight className="h-4 w-4" /></Button></Link>
              <Link to="/exams"><Button size="lg" variant="secondary" className="min-h-13 px-6"><Play className="h-4 w-4" /> Luyện đề ngay</Button></Link>
            </div>
            <div data-hero className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Học theo nhịp của bạn</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Lưu tiến độ tự động</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[530px] px-1 sm:px-5">
            <div className="studio-orbit pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[410px] w-[410px] -translate-x-1/2 -translate-y-1/2" />
            <div data-study-card className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_90px_-30px_#29488b55]">
              <div className="flex items-center justify-between border-b border-line px-6 py-5">
                <span className="flex items-center gap-2 text-sm font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-steel text-white"><Layers3 className="h-4 w-4" /></span> Góc học tập</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted">Giao diện minh họa</span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white">
                  <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full border-[28px] border-white/5" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-powder">One step closer</p>
                  <h2 className="mt-3 text-2xl font-semibold leading-tight">Sẵn sàng cho<br />bước tiến tiếp theo?</h2>
                  <Link to="/exams" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-powder">Bắt đầu luyện tập <ArrowRight className="h-3.5 w-3.5" /></Link>
                  <Headphones className="absolute bottom-5 right-5 h-16 w-16 rotate-12 text-powder/40" strokeWidth={1} />
                </div>
                <div className="mb-3 mt-6 flex items-center justify-between"><h3 className="text-xs font-semibold">Không gian cho mọi kỹ năng</h3><span className="text-[10px] text-muted">IELTS studio</span></div>
                {[{ title: "Listening practice", subtitle: "Lắng nghe. Hiểu sâu hơn.", icon: Headphones, color: "bg-mist text-steel" }, { title: "Reading essentials", subtitle: "Đọc chủ động, nắm ý chính.", icon: BookOpen, color: "bg-[#e6f5ee] text-success" }].map(({ title, subtitle, icon: Icon, color }) => (
                  <Link to="/exams" key={title} className="mt-2 flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:bg-canvas">
                    <span className={"flex h-11 w-11 items-center justify-center rounded-xl " + color}><Icon className="h-5 w-5" /></span>
                    <span className="flex-1"><span className="block text-xs font-semibold">{title}</span><span className="mt-1 block text-[11px] text-muted">{subtitle}</span></span><ChevronRight className="h-4 w-4 text-muted" />
                  </Link>
                ))}
              </div>
            </div>
            <div data-study-card className="relative -mt-3 ml-8 flex w-fit items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lg sm:absolute sm:-bottom-6 sm:-left-1 sm:mt-0 sm:ml-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f5ee] text-success"><Target className="h-5 w-5" /></span>
              <div><p className="text-xs font-semibold">Tiến bộ theo cách của bạn</p><p className="mt-1 text-[10px] text-muted">Từng bài học. Từng ngày.</p></div>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-5 text-[11px] font-medium uppercase tracking-[0.15em] text-muted sm:px-8"><span>Designed for your next chapter</span><div className="flex gap-6"><span>Learn.</span><span>Practice.</span><span className="text-steel">Grow.</span></div><a href="#process" className="flex items-center gap-2">Khám phá <ArrowDown className="h-3.5 w-3.5" /></a></div>
      </section>
      <section id="process" className="scroll-mt-24 bg-canvas py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <Reveal className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel">01 / Cách bạn tiến bộ</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Mọi thứ bạn cần.<br />Trong một không gian.</h2></div><p className="max-w-sm text-sm leading-7 text-muted">Một hành trình rõ ràng, từ buổi học đầu tiên đến những lần tự tin chinh phục đề thi.</p></Reveal>
          <div className="grid gap-5 md:grid-cols-3">{steps.map(({ icon: Icon, title, text, color }, index) => <Reveal key={title} delay={index * 0.08} className="group rounded-3xl border border-line bg-white p-7 transition-shadow hover:shadow-lg"><div className="flex items-center justify-between"><span className={"flex h-12 w-12 items-center justify-center rounded-2xl " + color}><Icon className="h-6 w-6" /></span><span className="text-sm text-muted/50">0{index + 1}</span></div><h3 className="mt-7 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-muted">{text}</p></Reveal>)}</div>
        </div>
      </section>
      <section className="py-16 sm:py-24"><div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel">02 / Thư viện học tập</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Tìm cảm hứng.<br />Bắt đầu học.</h2></div><Link to="/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-steel">Tất cả khóa học <ArrowUpRight className="h-4 w-4" /></Link></Reveal>
        {loading ? <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-96 rounded-3xl" />)}</div> : packages.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{packages.slice(0, 3).map((item, index) => <Reveal key={item.id} delay={index * 0.08}><PackageCard packageItem={item} /></Reveal>)}</div> : <EmptyState icon={BookOpen} title="Thư viện đang cập nhật" description="Các khóa học sẽ xuất hiện tại đây khi sẵn sàng." />}
      </div></section>
      <section id="faq" className="scroll-mt-24 border-t border-line bg-canvas py-16 sm:py-24"><div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal><Badge tone="blue"><Sparkles className="mr-1.5 h-3 w-3" /> Giải đáp cho bạn</Badge><h2 className="mt-5 text-3xl font-semibold sm:text-4xl">Bắt đầu với<br />sự rõ ràng.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-muted">Một vài điều hữu ích trước khi bước vào hành trình học tập của bạn.</p></Reveal>
        <Reveal className="space-y-3">{[
          ["Tôi có thể xem trước tài liệu không?", "Có. Bạn có thể xem trước các trang được mở miễn phí trong từng khóa học để lựa chọn nội dung phù hợp trước khi đăng ký."],
          ["Thanh toán hoạt động như thế nào?", "Dự án đang sử dụng thanh toán demo. Sau khi xác nhận, khóa học được thêm vào thư viện của bạn; không phát sinh giao dịch tiền thật."],
          ["Nếu tôi rời trang khi đang làm bài?", "Câu trả lời được tự động lưu trong lúc làm bài. Khi quay lại, bạn có thể tiếp tục trong thời gian còn lại của lượt làm bài."],
          ["Tôi xem kết quả ở đâu?", "Sau khi nộp bài, bạn sẽ được chuyển đến trang kết quả để xem điểm và đối chiếu đáp án."],
        ].map(([question, answer]) => <details key={question} className="group rounded-2xl border border-line bg-white p-5 sm:p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">{question}<ChevronRight className="h-4 w-4 shrink-0 text-steel transition-transform group-open:rotate-90" /></summary><p className="mt-4 text-sm leading-7 text-muted">{answer}</p></details>)}</Reveal>
      </div></section>
      <section className="px-5 py-12 sm:px-8 sm:py-16"><Reveal className="relative mx-auto flex max-w-[1256px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[32px] bg-ink p-8 text-white sm:p-12 lg:flex-row lg:items-center"><div className="pointer-events-none absolute -right-20 -top-40 h-[400px] w-[400px] rounded-full border-[60px] border-white/[0.03]" /><div className="relative"><p className="text-xs font-medium uppercase tracking-[0.2em] text-powder">Your next chapter</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Một ngày nào đó.<br />Hay bắt đầu ngay hôm nay?</h2></div><Link to="/exams" className="relative"><Button size="lg" className="min-h-14 px-7">Bắt đầu luyện tập <ArrowUpRight className="h-5 w-5" /></Button></Link></Reveal></section>
    </div>
  );
}
