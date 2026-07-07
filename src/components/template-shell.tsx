"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TemplateShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fadeOnly = pathname.startsWith("/mapa");

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        fadeOnly ? "template-enter-fade" : "template-enter"
      )}
    >
      {children}
    </div>
  );
}
