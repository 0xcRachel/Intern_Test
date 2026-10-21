import { FileText, Headphones, LockKeyhole, ShieldCheck } from "lucide-react";
import { Modal, Badge, Button } from "./ui";
import { formatDate } from "../lib/format";

const WAVEFORM = [
  18, 30, 22, 42, 34, 54, 26, 38, 48, 30, 20, 44, 32, 58, 36, 24, 46, 30, 16,
  40, 28, 52, 34, 22, 44, 26, 38, 20, 48, 30, 18, 36,
];

function AudioWaveform() {
  return (
    <div className="flex h-14 items-center gap-1" aria-hidden="true">
      {WAVEFORM.map((height, index) => (
        <span
          key={index}
          className="w-full rounded-full bg-steel/45"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

function PreviewPage({ page, index, isAudio }) {
  const paragraphs = String(page.body || "")
    .split(/\n{2,}/)
    .filter(Boolean);

  return (
    <article className="rounded-lg border border-line bg-surface-raised p-5 shadow-[0_1px_0_rgba(20,35,44,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-steel">
          Trang {index + 1}
        </p>
        <Badge tone="neutral">{isAudio ? "Transcript" : "PDF"}</Badge>
      </div>

      {isAudio && index === 0 ? (
        <div className="mt-4 rounded-md border border-line bg-canvas/70 px-4 py-3">
          <AudioWaveform />
        </div>
      ) : null}

      <h3 className="mt-4 text-lg font-semibold leading-7 tracking-[-0.01em] text-ink">
        {page.heading}
      </h3>

      <div className="mt-2 space-y-3">
        {paragraphs.map((paragraph, paragraphIndex) => (
          <p
            key={paragraphIndex}
            className="whitespace-pre-line text-sm leading-7 text-ink/80"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}

export function DocumentPreviewModal({ open, onClose, document, preview }) {
  if (!document || !preview) return null;

  const isAudio = document.type === "audio";
  const owned = Boolean(preview.owned);
  const pages = Array.isArray(preview.preview_content) ? preview.preview_content : [];
  const shownPages = pages.length;
  const lockedPages = owned
    ? 0
    : preview.locked_pages ?? Math.max(0, (preview.total_pages || 0) - shownPages);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={document.title}
      description={
        owned
          ? "Bạn đã sở hữu khóa học này. Toàn bộ nội dung mẫu hiện có đã được mở khóa."
          : isAudio
            ? "Nghe thử và xem transcript của một phần đầu. Phần còn lại được giữ phía máy chủ."
            : "Đọc một phần đầu tài liệu. Các trang còn lại được khóa để bảo vệ nội dung gói học."
      }
      footer={
        <>
          <span className="mr-auto inline-flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-success" />
            {owned
              ? `Đã mở khóa ${shownPages} trang nội dung`
              : `Chỉ ${shownPages}/${preview.total_pages ?? "?"} trang được gửi tới trình duyệt`}
          </span>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-md border border-line bg-mist/35 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface-raised text-steel">
              {isAudio ? (
                <Headphones className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">
                {owned
                  ? "Tài liệu đã mở khóa"
                  : isAudio
                    ? "Bản nghe thử có transcript"
                    : "Bản đọc thử có giới hạn"}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {owned
                  ? `${shownPages} trang nội dung hiện có · Đã mở khóa`
                  : `${shownPages} trang mở · ${lockedPages} trang khóa`}{" "}
                · Phiên hết hạn {formatDate(preview.expires_at)}
              </p>
            </div>
          </div>
          <Badge tone="blue" className="uppercase">
            {document.type}
          </Badge>
        </div>

        {preview.preview_url && owned && isAudio ? (
          <div className="rounded-lg border border-line bg-surface-raised p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-steel">
              Nghe thử audio
            </p>
            <audio className="w-full" controls preload="metadata" src={preview.preview_url}>
              Trình duyệt không hỗ trợ phát audio.
            </audio>
          </div>
        ) : null}

        {preview.preview_url && owned && !isAudio ? (
          <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
            <iframe
              title={`Bản xem trước ${document.title}`}
              src={`${preview.preview_url}#page=1&zoom=page-width`}
              className="h-[min(68vh,720px)] w-full"
            />
          </div>
        ) : null}

        {shownPages > 0 ? (
          <div className="space-y-4">
            {pages.map((page, index) => (
              <PreviewPage
                key={`${page.heading}-${index}`}
                page={page}
                index={index}
                isAudio={isAudio}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-surface-raised/70 p-6 text-center">
            <p className="text-sm font-medium text-ink">Chưa có nội dung xem trước</p>
            <p className="mt-1 text-sm text-muted">
              Tài liệu này chỉ hiển thị thông tin mô tả. Nội dung đầy đủ được giữ phía
              máy chủ.
            </p>
          </div>
        )}

        {lockedPages > 0 ? (
          <section
            className="relative overflow-hidden rounded-lg border border-line bg-surface-raised"
            aria-label={`${lockedPages} trang bị khóa`}
          >
            <div
              className="pointer-events-none select-none space-y-3 p-5 blur-[6px] sm:p-6"
              aria-hidden="true"
            >
              {[0, 1, 2, 3, 4, 5].map((line) => (
                <div
                  key={line}
                  className="h-3 rounded-full bg-ink/15"
                  style={{ width: `${88 - line * 7}%` }}
                />
              ))}
              <div className="h-24 rounded-md bg-ink/10" />
              {[0, 1, 2].map((line) => (
                <div
                  key={`lower-${line}`}
                  className="h-3 rounded-full bg-ink/15"
                  style={{ width: `${76 - line * 9}%` }}
                />
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-canvas/15 via-canvas/70 to-canvas/95 p-6">
              <div className="max-w-md rounded-lg border border-line bg-surface-raised/95 p-5 text-center shadow-lg backdrop-blur-sm">
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-powder">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">
                  Còn {lockedPages} trang bị khóa
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Bản xem trước chỉ mở {shownPages} trang đầu. Toàn bộ nội dung không
                  được gửi tới trình duyệt, nên không thể tải lậu từ trang này.
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}
