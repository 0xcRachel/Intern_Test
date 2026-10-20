import { createContext, useContext, useEffect, useRef } from "react";

const SmoothScrollContext = createContext(null);

/**
 * Lenis is loaded only in the browser. The provider exposes the instance through
 * a ref so overlays (modals, drawers) can pause background scrolling without
 * coupling the UI primitives to Lenis itself.
 */
export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return undefined;

    let cancelled = false;
    let frame = 0;
    let lenis;

    import("lenis")
      .then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({
          duration: 1.05,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.4,
          anchors: true,
        });
        lenisRef.current = lenis;

        const raf = (time) => {
          lenis.raf(time);
          frame = window.requestAnimationFrame(raf);
        };
        frame = window.requestAnimationFrame(raf);
      })
      .catch(() => {
        // Smooth scrolling is an enhancement: native scrolling remains available.
      });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      lenisRef.current = null;
      lenis?.destroy();
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={lenisRef}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
