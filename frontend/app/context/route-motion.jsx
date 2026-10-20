import { createContext, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router";

const RouteMotionContext = createContext(true);

/**
 * Keeps entrance motion tied to the first visit of a pathname during the
 * current client session. Route components unmount when the learner or admin
 * navigates away, so without this guard their Reveal wrappers and page-enter
 * class would replay every time the user comes back.
 */
export function RouteMotionProvider({ children }) {
  const { pathname } = useLocation();
  const visited = useRef(new Set());
  const animate = !visited.current.has(pathname);

  useEffect(() => {
    visited.current.add(pathname);
  }, [pathname]);

  return (
    <RouteMotionContext.Provider value={animate}>
      {children}
    </RouteMotionContext.Provider>
  );
}

export function useRouteMotion() {
  return useContext(RouteMotionContext);
}
