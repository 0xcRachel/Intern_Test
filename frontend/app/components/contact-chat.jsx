import { ExternalLink, MessageCircle, X } from "lucide-react";
import { useState } from "react";

const channels = [
  {
    id: "zalo",
    label: "Nhắn qua Zalo",
    description: "Trao đổi nhanh với đội ngũ hỗ trợ",
    href: import.meta.env.VITE_ZALO_URL || "https://zalo.me/",
    mark: "Z",
    color: "bg-[#0068ff]",
  },
  {
    id: "messenger",
    label: "Nhắn qua Messenger",
    description: "Hỏi đáp trực tiếp trên Facebook",
    href: import.meta.env.VITE_MESSENGER_URL || "https://m.me/",
    mark: "M",
    color: "bg-[#168aff]",
  },
];

export function ContactChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[90] sm:bottom-6 sm:right-6">
      {open ? (
        <div
          className="chat-panel-enter mb-3 w-[min(86vw,320px)] overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-[0_24px_70px_-28px_rgba(20,35,44,0.55)]"
          role="dialog"
          aria-label="Chọn kênh liên hệ"
        >
          <div className="flex items-start justify-between gap-3 bg-ink px-4 py-4 text-white">
            <div>
              <p className="text-sm font-semibold">Cần hỗ trợ?</p>
              <p className="mt-1 text-xs leading-5 text-white/60">
                Chọn kênh bạn thường dùng để bắt đầu trò chuyện.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Đóng lựa chọn liên hệ"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-2 p-3">
            {channels.map((channel, index) => (
              <a
                key={channel.id}
                href={channel.href}
                target="_blank"
                rel="noreferrer"
                style={{ "--chat-delay": `${index * 55}ms` }}
                className="chat-channel-enter group flex items-center gap-3 rounded-xl border border-line px-3 py-3 transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-steel/50 hover:bg-mist/40"
              >
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-transform duration-200 group-hover:scale-105 ${channel.color}`}
                >
                  {channel.mark}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{channel.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted">{channel.description}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-steel" />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`chat-fab ml-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink text-powder shadow-[0_16px_36px_-16px_rgba(20,35,44,0.65)] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#243b47] focus-visible:outline-offset-4 ${open ? "chat-fab-open" : ""}`}
        aria-label={open ? "Đóng hỗ trợ" : "Mở hỗ trợ"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
