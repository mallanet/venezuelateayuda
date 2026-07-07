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
      <section className="border-b border-border/40 bg-section-glow px-4 py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-3">
          <span className="reveal delay-1 font-mono-tokens text-xs font-medium tracking-[0.18em] text-accent uppercase">
            Mapa interactivo
          </span>
          <h1 className="reveal delay-2 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">
            Mapa de ayuda
          </h1>
          <p className="reveal delay-3 max-w-2xl text-muted-foreground">
            Explora fichas de ayuda en todo el país. Filtra por categoría,
            estado y tipo para encontrar lo que necesitas.
          </p>
        </div>
      </section>
      <MapExplorer />
    </div>
  );
}
