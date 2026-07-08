"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

/** Oculta nav/footer del sitio público en rutas /admin*. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="contenido-principal" className="flex flex-1 flex-col" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
