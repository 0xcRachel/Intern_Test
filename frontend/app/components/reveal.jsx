import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useRouteMotion } from "../context/route-motion";

/**
 * Lightweight scroll-in reveal. It intentionally uses IntersectionObserver
 * instead of ScrollTrigger so it stays cheap and coordinates cleanly with Lenis.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  y = 16,
  once = true,
  ...props
}) {
  const ref = useRef(null);
  const animate = useRouteMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (!animate) {
      gsap.set(element, { clearProps: "transform,visibility,opacity" });
      return undefined;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return undefined;

    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (played && once) return;
          played = true;

          gsap.fromTo(
            element,
            { autoAlpha: 0, y },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              delay,
              ease: "power2.out",
              overwrite: "auto",
              clearProps: "transform,visibility,opacity",
            },
          );

          if (once) observer.unobserve(element);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(element);
      gsap.set(element, { clearProps: "transform,visibility,opacity" });
    };
  }, [animate, delay, once, y]);

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
