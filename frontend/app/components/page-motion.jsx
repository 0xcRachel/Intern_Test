import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import gsap from "gsap";

export function PageMotion({ children, className }) {
  const ref = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(ref.current, { opacity: 0, y: 12 }, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    });
    return () => motion.revert();
  }, [pathname]);

  return <div ref={ref} className={className}>{children}</div>;
}
