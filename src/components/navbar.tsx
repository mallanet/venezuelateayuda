"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ChevronDown, Menu, User } from "lucide-react";
import { DropdownMenu } from "radix-ui";
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

const PUBLIC_LINKS = [
  { href: "/mapa", label: "Mapa de ayuda" },
  { href: "/profesionales", label: "Profesionales" },
] as const;

const ACCOUNT_LINKS = [
  { href: "/ayuda/nueva", label: "Publicar ficha" },
  { href: "/mensajes", label: "Mensajes" },
  { href: "/perfil", label: "Mi perfil" },
] as const;

function NavLink({
  href,
  label,
  active,
  onClick,
  className,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "border-b-2 border-transparent px-0 py-1 text-base font-semibold text-primary transition-[border-color,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)] hover:border-[var(--mallanet-blue-200)] hover:text-[var(--mallanet-blue-800)] hover:no-underline focus-visible:shadow-[0_0_0_3px_rgba(24,116,199,0.35)]",
        active && "border-[var(--mallanet-blue-400)]",
        className
      )}
    >
      {label}
    </Link>
  );
}

function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  if (!user) return null;

  const accountLinks: { href: string; label: string }[] = [...ACCOUNT_LINKS];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-[min(220px,32vw)] gap-1.5"
          aria-label="Menú de cuenta"
        >
          <User className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{user.email}</span>
          <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[1300] min-w-[220px] rounded-xl border border-border/60 bg-popover p-1.5 text-popover-foreground shadow-elevated"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {user.email}
          </DropdownMenu.Label>
          {user.status === "PENDIENTE" && (
            <div className="px-2 pb-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                Cuenta en revisión
              </Badge>
            </div>
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          {accountLinks.map((link) => (
            <DropdownMenu.Item key={link.href} asChild>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus:bg-muted",
                  pathname === link.href && "bg-muted text-primary"
                )}
              >
                {link.label}
              </Link>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className="flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm font-medium text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
            onSelect={() => {
              onNavigate?.();
              signOut({ callbackUrl: "/" });
            }}
          >
            Cerrar sesión
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = session?.user;

  const mobileLinks = user ? [...PUBLIC_LINKS, ...ACCOUNT_LINKS] : [...PUBLIC_LINKS];

  return (
    <header className="sticky top-0 z-[1100] border-b border-[#EFF3F8] bg-background">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-3 focus:z-[1200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-[68px] max-w-[1120px] flex-nowrap items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline hover:opacity-90">
          <Logotype size={42} />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 md:flex lg:gap-6" aria-label="Principal">
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={pathname === link.href}
              className="whitespace-nowrap"
            />
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-[#02A95C]/45 text-[#018A4B] hover:bg-[#02A95C]/10 hover:text-[#018A4B]"
          >
            <DonationLink className="inline-flex items-center gap-1.5">
              Donar en GoFundMe
            </DonationLink>
          </Button>
          {user ? (
            <UserMenu />
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
          <SheetContent side="right" className="z-[1200]">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
              {user ? (
                <p className="truncate text-left text-sm text-muted-foreground">{user.email}</p>
              ) : null}
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Menú móvil">
              {mobileLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
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
                  className="border-[#02A95C]/45 text-[#018A4B] hover:bg-[#02A95C]/10 hover:text-[#018A4B]"
                >
                  <DonationLink
                    className="inline-flex items-center justify-center gap-2"
                    onClick={() => setOpen(false)}
                  >
                    Donar en GoFundMe
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
