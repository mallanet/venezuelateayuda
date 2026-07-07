import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HomeHeroMap } from "@/components/home-hero-map";
import { Logo } from "@/components/logo";
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
      logo: `${SITE_URL}/logo.png`,
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

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomeHeroMap />

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-16">
        <div className="mx-auto flex items-center gap-3">
          <Logo size={32} />
          <h2 className="font-heading text-2xl font-semibold text-primary">
            ¿Cómo funciona?
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
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
            <Card key={step.step} className="group relative overflow-hidden border-border/60 transition-shadow hover:shadow-md">
              <CardContent className="grid gap-3 pt-6">
                <span className="font-heading text-3xl font-bold text-accent/30">
                  {step.step}
                </span>
                <h3 className="font-heading font-semibold text-primary">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-muted/30 to-background px-4 py-16">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-12 text-center">
          <div className="min-w-[140px]">
            <div className="font-heading text-4xl font-bold text-primary">{helpers}</div>
            <div className="mt-1 text-sm text-muted-foreground">ofertas de ayuda activas</div>
          </div>
          <div className="min-w-[140px]">
            <div className="font-heading text-4xl font-bold text-destructive">{requests}</div>
            <div className="mt-1 text-sm text-muted-foreground">solicitudes activas</div>
          </div>
          <div className="min-w-[140px]">
            <div className="font-heading text-4xl font-bold text-accent">{resolved}</div>
            <div className="mt-1 text-sm text-muted-foreground">ayudas concretadas</div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-16">
        <div className="mx-auto text-center">
          <h2 className="font-heading text-2xl font-semibold text-primary">
            Categorías de ayuda
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explora las fichas por categoría
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((category) => {
            const CategoryIcon = CATEGORY_ICONS[category];
            return (
              <Link
                key={category}
                href={`/mapa?category=${category}`}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
              >
                <CategoryIcon className="size-4" />
                <span>{CATEGORY_LABELS[category]}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/mapa">Ver todas las fichas en el mapa</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
