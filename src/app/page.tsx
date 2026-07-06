import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { HomeHeroMap } from "@/components/home-hero-map";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/categories";

export const revalidate = 300;

export default async function HomePage() {
  const [helpers, requests, resolved] = await Promise.all([
    prisma.helpListing.count({ where: { status: "APROBADA", type: "OFREZCO" } }),
    prisma.helpListing.count({ where: { status: "APROBADA", type: "NECESITO" } }),
    prisma.helpListing.count({ where: { status: "CERRADA" } }),
  ]).catch(() => [0, 0, 0]);

  return (
    <div className="flex flex-col">
      <HomeHeroMap />

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-16">
        <h2 className="text-center text-2xl font-semibold">¿Cómo funciona?</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "1. Regístrate y verifica",
              body: "Crea tu cuenta como ayudante o solicitante. Nuestro equipo revisa cada perfil para mantener la comunidad segura.",
            },
            {
              title: "2. Publica tu ficha",
              body: "Describe qué ofreces o necesitas y marca tu zona aproximada en el mapa. Cada ficha pasa por moderación.",
            },
            {
              title: "3. Conecta por chat",
              body: "Encuentra fichas en el mapa y contacta por el chat interno, sin exponer tu teléfono ni tu dirección.",
            },
          ].map((step) => (
            <Card key={step.title}>
              <CardContent className="grid gap-2 pt-6">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 px-4 py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-10 text-center">
          <div>
            <div className="text-3xl font-bold">{helpers}</div>
            <div className="text-sm text-muted-foreground">ofertas de ayuda activas</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{requests}</div>
            <div className="text-sm text-muted-foreground">solicitudes activas</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{resolved}</div>
            <div className="text-sm text-muted-foreground">ayudas concretadas</div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-16">
        <h2 className="text-center text-2xl font-semibold">Categorías de ayuda</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/mapa`}
              className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
