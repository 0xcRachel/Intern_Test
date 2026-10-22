import { Outlet, useLocation } from "react-router";
import { SiteHeader, PublicFooter } from "../components/site-header";
import { ContactChat } from "../components/contact-chat";
import { PageMotion } from "../components/page-motion";

const fullBleedPaths = ["/", "/packages"];

function isFullBleed(pathname) {
  return fullBleedPaths.includes(pathname) || /^\/packages\/[^/]+$/.test(pathname);
}

/**
 * Shared public + learner chrome. Keeping the header and footer in one layout
 * route means React Router only swaps the body when a learner moves between
 * pages, so the navigation no longer unmounts or re-animates on every click.
 */
export default function SiteLayout() {
  const { pathname } = useLocation();
  const fullBleed = isFullBleed(pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Bỏ qua điều hướng
      </a>

      <SiteHeader />

      <main
        id="main-content"
        className={
          fullBleed
            ? "flex-1"
            : "workspace-content mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-8 sm:py-10"
        }
      >
        <PageMotion>
          <Outlet />
        </PageMotion>
      </main>

      <PublicFooter />
      <ContactChat />
    </div>
  );
}
