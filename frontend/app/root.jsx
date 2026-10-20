import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { NotificationProvider } from "./components/notifications";
import { AuthProvider } from "./context/auth";
import { CartProvider } from "./context/cart";
import { RouteMotionProvider } from "./context/route-motion";
import { SmoothScrollProvider } from "./context/smooth-scroll";
import "lenis/dist/lenis.css";
import "./app.css";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
  },
];

export function Layout({ children }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <RouteMotionProvider>
      <NotificationProvider>
        <SmoothScrollProvider>
          <AuthProvider>
            <CartProvider>
              <Outlet />
            </CartProvider>
          </AuthProvider>
        </SmoothScrollProvider>
      </NotificationProvider>
    </RouteMotionProvider>
  );
}

export function ErrorBoundary({ error }) {
  let title = "Có lỗi xảy ra";
  let message = "Trang này chưa thể hiển thị. Vui lòng thử lại.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message =
      error.status === 404
        ? "Đường dẫn không tồn tại hoặc đã bị di chuyển."
        : "Yêu cầu chưa thể hoàn tất.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-lg rounded-lg border border-line bg-surface-raised p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-steel">ExamPlatform</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
        <a
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-powder px-4 text-sm font-medium text-ink"
          href="/"
        >
          Về trang chủ
        </a>
      </div>
    </main>
  );
}
