import type { Metadata } from "next";
import { MapExplorer } from "@/components/map-explorer";
import { SITE_OPEN_GRAPH_IMAGE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mapa de ayuda en Venezuela — Encuentra ayuda cerca de ti",
  description:
    "Explora el mapa interactivo de ayuda mutua en Venezuela. Filtra por alimentos, medicinas, transporte, alojamiento y conecta con personas verificadas.",
  alternates: { canonical: `${SITE_URL}/mapa` },
  openGraph: {
    title: "Mapa de ayuda en Venezuela",
    description:
      "Mapa interactivo para buscar u ofrecer ayuda en Venezuela: alimentos, medicinas, transporte y más.",
    url: `${SITE_URL}/mapa`,
    images: [SITE_OPEN_GRAPH_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapa de ayuda en Venezuela",
    description:
      "Mapa interactivo para buscar u ofrecer ayuda en Venezuela: alimentos, medicinas, transporte y más.",
    images: [SITE_OPEN_GRAPH_IMAGE.url],
  },
};

export default function MapaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-border/40 bg-background px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            Mapa de ayuda
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Explora fichas de ayuda en todo el país. Filtra por categoría,
            estado y tipo para encontrar lo que necesitas.
          </p>
        </div>
      </section>
      <MapExplorer />
    </div>
  );
}
