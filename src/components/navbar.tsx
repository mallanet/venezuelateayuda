"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logotype } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/mapa", label: "Mapa de ayuda" },
  { href: "/profesionales", label: "Profesionales" },
  { href: "/ayuda/nueva", label: "Publicar ficha", authOnly: true },
  { href: "/mensajes", label: "Mensajes", authOnly: true },
  { href: "/perfil", label: "Mi perfil", authOnly: true },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = session?.user;

  const links = NAV_LINKS.filter((l) => !l.authOnly || user);
  if (user?.role === "ADMIN") {
    links.push({ href: "/admin", label: "Administración" });
  }

  return (
    <header className="sticky top-0 z-[1100] border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px flag-rule opacity-70" aria-hidden />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 no-underline transition-opacity duration-[var(--motion-duration-fast)] hover:opacity-90">
          <Logotype size={36} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-[color,background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-0.5 rounded-full bg-accent transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)]"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {user.status === "PENDIENTE" && (
                <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                  Cuenta en revisión
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild className="shadow-soft">
                <Link href="/registro">Registrarse</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" aria-label="Abrir menú">
              <Menu className="size-4.5" strokeWidth={2} aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[calc(100vw-3rem)] md:w-72 z-[1200]">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Menú móvil">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-[color,background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                      active ? "bg-muted text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    {user.status === "PENDIENTE" && (
                      <Badge variant="secondary" className="self-start bg-accent/10 text-accent-foreground">
                        Cuenta en revisión
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setOpen(false)}>
                        Iniciar sesión
                      </Link>
                    </Button>
                    <Button asChild className="shadow-soft">
                      <Link href="/registro" onClick={() => setOpen(false)}>
                        Registrarse
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
