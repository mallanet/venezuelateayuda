import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { HomeHeroMap } from "@/components/home-hero-map";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/categories";
import { SITE_DESCRIPTION, SITE_NAME, SITE_OPEN_GRAPH_IMAGE, SITE_URL } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Buscar ayuda en Venezuela — Mapa de ayuda mutua verificada",
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Buscar ayuda en Venezuela — Mapa de ayuda mutua",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    siteName: SITE_NAME,
    locale: "es_VE",
    images: [SITE_OPEN_GRAPH_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buscar ayuda en Venezuela — Mapa de ayuda mutua",
    description: SITE_DESCRIPTION,
    images: [SITE_OPEN_GRAPH_IMAGE.url],
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "es-VE",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/mapa?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logoo.svg`,
      sameAs: ["https://mallanet.org", "https://discord.gg/mallanet"],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "Buscar ayuda en Venezuela",
      description: SITE_DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: {
        "@type": "Thing",
        name: "Ayuda humanitaria y mutua en Venezuela",
      },
    },
  ],
};

export default async function HomePage() {
  const [helpers, requests, resolved] = await Promise.all([
    prisma.helpListing.count({ where: { status: "APROBADA", type: "OFREZCO" } }),
    prisma.helpListing.count({ where: { status: "APROBADA", type: "NECESITO" } }),
    prisma.helpListing.count({ where: { status: "CERRADA" } }),
  ]).catch(() => [0, 0, 0]);

  const categoryCounts = await prisma.helpListing
    .groupBy({ by: ["category"], where: { status: "APROBADA" }, _count: true })
    .catch(() => []);

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomeHeroMap />

      <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-20 md:py-24">
        <Reveal className="mx-auto grid max-w-2xl gap-3 text-center">
          <span className="font-mono-tokens text-xs font-medium tracking-[0.18em] text-accent uppercase">
            Así funciona
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-balance text-primary md:text-4xl">
            Tres pasos para conectar
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground md:text-base">
            Fichas moderadas a mano, chat interno sin exponer tu teléfono y ubicación aproximada
            para proteger tu privacidad.
          </p>
        </Reveal>

        <ol className="stagger-children relative mx-auto mt-2 w-full max-w-3xl">
          <span
            className="absolute top-3 bottom-3 left-[26px] w-px bg-gradient-to-b from-accent/55 via-accent/30 to-transparent sm:left-[30px]"
            aria-hidden
          />
          {[
            {
              step: "01",
              title: "Regístrate y verifica",
              body: "Crea tu cuenta como ayudante o solicitante. Nuestro equipo revisa cada perfil para mantener la comunidad segura.",
            },
            {
              step: "02",
              title: "Publica tu ficha",
              body: "Describe qué ofreces o necesitas y marca tu zona aproximada en el mapa. Cada ficha pasa por moderación.",
            },
            {
              step: "03",
              title: "Conecta por chat",
              body: "Encuentra fichas en el mapa y contacta por el chat interno, sin exponer tu teléfono ni tu dirección.",
            },
          ].map((step) => (
            <Reveal
              as="li"
              key={step.step}
              className="relative grid grid-cols-[52px_1fr] gap-5 py-7 sm:grid-cols-[60px_1fr]"
            >
              <span className="font-display text-4xl font-semibold tabular-nums text-accent sm:text-5xl">
                {step.step}
              </span>
              <div className="grid gap-1.5 pt-1">
                <h3 className="font-display text-xl font-semibold text-primary">{step.title}</h3>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-section-glow border-y border-border/40 px-4 py-20 md:py-24">
        <Reveal className="mx-auto flex max-w-4xl flex-wrap items-stretch justify-center gap-x-4 gap-y-10 text-center">
          <Stat value={helpers} label="ofertas de ayuda activas" tone="yellow" />
          <Divider />
          <Stat value={requests} label="solicitudes activas" tone="blue" />
          <Divider />
          <Stat value={resolved} label="ayudas concretadas" tone="red" />
        </Reveal>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-20 md:py-24">
        <Reveal className="mx-auto grid max-w-2xl gap-3 text-center">
          <span className="font-mono-tokens text-xs font-medium tracking-[0.18em] text-accent uppercase">
            Explora
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-balance text-primary md:text-4xl">
            Categorías de ayuda
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground md:text-base">
            Fichas verificadas agrupadas por tipo de necesidad.
          </p>
        </Reveal>
        <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const CategoryIcon = CATEGORY_ICONS[category];
            const count = categoryCounts.find((c) => c.category === category)?._count ?? 0;
            return (
              <Reveal key={category}>
              <Link
                href={`/mapa?category=${category}`}
                className="group relative flex h-full flex-col items-start gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft hover-lift hover-glow hover:border-accent/40"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/5 text-primary transition-[color,background-color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)] group-hover:bg-accent/10 group-hover:text-accent">
                  <CategoryIcon className="size-5" />
                </span>
                <span className="font-display text-base font-medium text-foreground">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-out)] group-hover:text-accent">
                  {count > 0 ? `${count} fichas` : "Ver fichas"}
                  <span className="transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
              </Reveal>
            );
          })}
        </div>
        <Reveal delay={240} className="mt-2 text-center">
          <Button asChild variant="outline" size="lg" className="shadow-soft">
            <Link href="/mapa">Ver todas las fichas en el mapa</Link>
          </Button>
        </Reveal>
      </section>
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "yellow" | "blue" | "red";
}) {
  const toneClass =
    tone === "yellow"
      ? "text-flag-yellow"
      : tone === "blue"
        ? "text-flag-blue"
        : "text-flag-red";
  return (
    <div className="flex min-w-[150px] flex-col items-center gap-1.5 px-4">
      <div className={`font-mono-tokens text-5xl font-bold tracking-tight tabular-nums ${toneClass}`}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Divider() {
  return <span className="hidden w-px self-stretch bg-gradient-to-b from-transparent via-border to-transparent sm:block" aria-hidden />;
}
