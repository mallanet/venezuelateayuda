import Link from "next/link";
import { Fragment } from "react";
import { Mail, Map, Package, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { DonationLink } from "@/components/donation-link";

const ALLY_GROUPS = [
  {
    icon: Map,
    label: "Mapas y daños",
    links: [
      {
        title: "Terremoto Venezuela",
        desc: "Mapa colaborativo de daños en edificaciones",
        href: "https://terremotovenezuela.com",
      },
      {
        title: "Sismo Venezuela",
        desc: "Reporte de mapas y daños + información de ayuda",
        href: "https://sismovenezuela.org",
      },
    ],
  },
  {
    icon: Search,
    label: "Búsqueda de personas",
    links: [
      {
        title: "Venezuela Te Busca",
        desc: "Registro centralizado de personas desaparecidas",
        href: "https://venezuelatebusca.com",
      },
      {
        title: "Venezuela Reporta",
        desc: "Reporta desaparecidas, confirma a salvo o avistamientos",
        href: "https://venezuelareporta.org",
      },
    ],
  },
  {
    icon: Package,
    label: "Acopio y ayuda",
    links: [
      {
        title: "ResponseGrid",
        desc: "Directorio de centros de acopio y necesidades · datos por ResponseGrid / Global Emergency (CC BY-SA 4.0)",
        href: "https://responsegrid.app/e/terremoto-venezuela-2026",
      },
    ],
  },
] as const;

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/legal/privacidad" },
  { label: "Términos y condiciones", href: "/legal/terminos" },
  { label: "Contacto", href: "mailto:info@mallanet.org" },
  {
    label: "Solicitar borrado de datos",
    href: "mailto:info@mallanet.org?subject=Solicitud%20de%20borrado%20de%20datos",
  },
] as const;

function LegalSeparator() {
  return <span className="text-muted-foreground/50">·</span>;
}

export function SiteFooter() {
  return (
    <footer className="bg-section-glow border-t border-[#EFF3F8] text-foreground">
      <div className="mx-auto max-w-[1120px] px-6 pb-10 pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-5">
            <div className="flex items-center gap-3">
              <Logo size={44} />
              <div className="grid">
                <span className="font-display text-[23px] font-black leading-tight text-[var(--mallanet-blue-600)]">
                  Venezuela Te Ayuda
                </span>
                <span className="text-sm font-semibold text-[var(--mallanet-blue-500)]">
                  Mapa de ayuda mutua
                </span>
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-primary">¿Quiénes hacemos esto?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Somos un equipo de voluntarios construyendo esta plataforma abierta para que
                cualquier persona afectada por el terremoto pueda pedir y ofrecer ayuda en tiempo
                real. Gratuito, sin fines de lucro y de código abierto.
              </p>
            </div>

            <section className="grid gap-3">
              <h3 className="font-display text-base font-semibold text-primary">Únete a la comunidad</h3>
              <p className="text-sm text-muted-foreground">
                Coordinamos ayuda y damos soporte en nuestro Discord. También puedes escribirnos
                por correo.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <DonationLink className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover-lift hover:shadow-accent-glow">
                  Donar por WhatsApp
                </DonationLink>
                <a
                  href="https://discord.gg/mallanet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5865f2] px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover-lift hover:shadow-accent-glow"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.198.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Únete a Discord
                </a>
                <a
                  href="mailto:info@mallanet.org"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 decoration-accent/40 transition-colors hover:decoration-accent"
                >
                  <Mail size={15} aria-hidden />
                  info@mallanet.org
                </a>
              </div>
            </section>
          </div>

          <section className="grid gap-3">
            <h3 className="font-display text-base font-semibold text-primary">Sitios aliados</h3>
            <p className="text-sm text-muted-foreground">
              Otras plataformas ciudadanas que ayudan ante el terremoto. Compártelas para llegar a
              más personas.
            </p>
            <div className="grid gap-3">
              {ALLY_GROUPS.map((group) => (
                <div key={group.label} className="grid gap-2">
                  <h4 className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    <group.icon size={13} aria-hidden />
                    {group.label}
                  </h4>
                  <ul className="grid gap-2">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl border border-border/60 bg-card px-3.5 py-2.5 shadow-soft hover-lift hover-glow"
                        >
                          <span className="block text-sm font-semibold text-primary">
                            {link.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                            {link.desc}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 h-px w-full bg-[var(--mallanet-gray-200)]" aria-hidden />

        <nav
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"
          aria-label="Legal"
        >
          {LEGAL_LINKS.map((link, index) => (
            <Fragment key={link.href}>
              {index > 0 && <LegalSeparator />}
              {link.href.startsWith("/") ? (
                <Link
                  href={link.href}
                  className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {link.label}
                </a>
              )}
            </Fragment>
          ))}
        </nav>

        <div className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          <p>
            Plataforma de reporte ciudadano sin fines de lucro. Datos de mapas ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              OpenStreetMap
            </a>
            . En caso de peligro inmediato, contacta también a los servicios de emergencia
            oficiales.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://terremotovenezuela.app/metodologia"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-primary hover:underline"
            >
              Metodología
            </a>
            <LegalSeparator />
            <a
              href="https://terremotovenezuela.app/riesgo-sismico"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-primary hover:underline"
            >
              Riesgo sísmico
            </a>
            <LegalSeparator />
            <a
              href="https://drive.google.com/drive/folders/1_UMrqDl4lAbXDYpt2sH45plVuhGCMLDo?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-primary hover:underline"
            >
              Recursos compartidos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
