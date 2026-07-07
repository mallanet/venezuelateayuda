import type { Metadata } from "next";
import { MapExplorer } from "@/components/map-explorer";
import { SITE_URL } from "@/lib/site";

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
  },
};

export default function MapaPage() {
  return <MapExplorer />;
}
