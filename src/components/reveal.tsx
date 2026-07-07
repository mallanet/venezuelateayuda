"use client";

import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en ms tras entrar en viewport. Usa `--reveal-delay` de `.stagger-children` si existe. */
  delay?: number;
  /** `up`: subida + fade (por defecto). `in`: solo fade. */
  variant?: "up" | "in";
  as?: ElementType;
}

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setShown(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(
        "reveal-on-scroll transition-[opacity,transform] duration-[var(--motion-duration-reveal)] ease-[var(--motion-ease-out)] will-change-[opacity,transform]",
        shown ? "opacity-100 translate-y-0" : "opacity-0",
        variant === "up" && !shown && "translate-y-4",
        className
      )}
      style={{
        transitionDelay: shown ? `var(--reveal-delay, ${delay}ms)` : "0ms",
      }}
    >
      {children}
    </Tag>
  );
}
