import { useEffect, useRef } from "react";

/**
 * Run an async refresh while the page is visible. The callback is kept in a
 * ref so callers can use current state without recreating the interval.
 */
export function usePolling(callback, delay, enabled = true) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !delay) return undefined;

    let timer;
    let running = false;

    const refresh = async () => {
      if (running || document.visibilityState === "hidden") return;
      running = true;
      try {
        await callbackRef.current();
      } finally {
        running = false;
      }
    };

    timer = window.setInterval(refresh, delay);
    return () => window.clearInterval(timer);
  }, [delay, enabled]);
}
