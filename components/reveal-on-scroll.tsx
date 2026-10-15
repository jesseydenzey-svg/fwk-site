"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function RevealOnScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Check immediately on mount if element is already within/near viewport
    const checkVisibility = () => {
      if (!node) return false;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= viewportHeight + 100) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkVisibility()) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "100px 0px" }
    );

    observer.observe(node);

    // Fallback: guarantee reveal after 1000ms so content is never stuck hidden
    const fallbackTimer = setTimeout(() => {
      setVisible(true);
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}