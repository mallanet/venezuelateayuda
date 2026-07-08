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
import { DonationLink } from "@/components/donation-link";
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
    <header className="sticky top-0 z-[1100] border-b border-[#EFF3F8] bg-background">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-3 focus:z-[1200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex min-h-[68px] max-w-[1120px] items-center justify-between gap-4 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline hover:opacity-90">
          <Logotype size={42} />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b-2 border-transparent px-0 py-1 text-base font-semibold text-primary transition-[border-color,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)] hover:border-[var(--mallanet-blue-200)] hover:text-[var(--mallanet-blue-800)] hover:no-underline focus-visible:shadow-[0_0_0_3px_rgba(24,116,199,0.35)]",
                  active && "border-[var(--mallanet-blue-400)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-[#25D366]/45 text-[#128C7E] hover:bg-[#25D366]/10 hover:text-[#128C7E]"
          >
            <DonationLink className="inline-flex items-center gap-1.5">
              Donar
            </DonationLink>
          </Button>
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
                <Button
                  variant="outline"
                  asChild
                  className="border-[#25D366]/45 text-[#128C7E] hover:bg-[#25D366]/10 hover:text-[#128C7E]"
                >
                  <DonationLink
                    className="inline-flex items-center justify-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    Donar por WhatsApp
                  </DonationLink>
                </Button>
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
