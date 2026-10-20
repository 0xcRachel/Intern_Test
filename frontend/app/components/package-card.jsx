import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  FileText,
  Headphones,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { formatPrice } from "../lib/format";
import { useCart } from "../context/cart";
import { Badge, Card } from "./ui";

export function PackageCard({ packageItem }) {
  const { add, has } = useCart();
  const units = packageItem?.units || [];
  const documents = units.flatMap((unit) => unit.documents || []);
  const unitCount = packageItem?.units_count ?? units.length;
  const pdfCount =
    packageItem?.pdf_count ?? documents.filter((doc) => doc.type === "pdf").length;
  const audioCount =
    packageItem?.audio_count ?? documents.filter((doc) => doc.type === "audio").length;
  const inCart = has(packageItem.id);

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-28px_rgba(20,35,44,0.38)]">
      <div className="relative overflow-hidden bg-ink p-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-powder/25 blur-2xl transition-transform duration-500 group-hover:scale-125" />
        <div className="pointer-events-none absolute -bottom-16 left-1/4 h-32 w-32 rounded-full bg-sand/20 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-white/15 bg-white/10 text-white" tone="dark">
              {packageItem.level || "IELTS"}
            </Badge>
            {packageItem.is_featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-powder px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink">
                <Sparkles className="h-3 w-3" />
                Nổi bật
              </span>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-powder">
            <Star className="h-3.5 w-3.5 fill-current" />
            {Number(packageItem.rating || 4.8).toFixed(1)}
          </span>
        </div>
        <h2 className="relative mt-8 line-clamp-2 text-xl font-semibold leading-snug tracking-tight">
          {packageItem.title}
        </h2>
        <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-white/55">
          {packageItem.description}
        </p>
        <div className="relative mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/60">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-powder" />
            {Number(packageItem.students_count || 0).toLocaleString("vi-VN")} học viên
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-powder" />
            {packageItem.duration_hours || 0} giờ
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1">
            <BookOpen className="h-3.5 w-3.5 text-steel" />
            {unitCount} unit
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1">
            <FileText className="h-3.5 w-3.5 text-steel" />
            {pdfCount} PDF
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1">
            <Headphones className="h-3.5 w-3.5 text-steel" />
            {audioCount} audio
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Học phí trọn đời</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                {formatPrice(packageItem.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => add(packageItem)}
              disabled={inCart}
              aria-label={inCart ? "Đã thêm vào giỏ" : `Thêm ${packageItem.title} vào giỏ`}
              className={
                inCart
                  ? "inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#c8dfd1] bg-[#e9f2ec] text-success"
                  : "inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface-raised text-ink transition-colors hover:border-steel/60 hover:bg-mist/50"
              }
            >
              {inCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            </button>
          </div>
          <Link
            to={`/packages/${packageItem.slug || packageItem.id}`}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-powder px-3 text-sm font-semibold text-ink transition-colors hover:bg-[#8bb9cf]"
          >
            Xem chi tiết
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
