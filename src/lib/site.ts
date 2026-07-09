export const SITE_NAME = "Venezuela Te Ayuda";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://venezuelateayuda.org";

export const SITE_DESCRIPTION =
  "Mapa de ayuda mutua en Venezuela: encuentra u ofrece ayuda con alimentos, medicinas, transporte, alojamiento y más. Fichas verificadas cerca de ti.";

export const SITE_KEYWORDS = [
  "ayuda venezuela",
  "necesito ayuda venezuela",
  "buscar ayuda venezuela",
  "ofrecer ayuda venezuela",
  "ayuda humanitaria venezuela",
  "mapa de ayuda venezuela",
  "ayuda mutua venezuela",
  "voluntarios venezuela",
  "donaciones venezuela",
  "emergencia venezuela",
  "venezuela te ayuda",
];

export const OG_IMAGE = "/og-image.png";
export const OG_IMAGE_WIDTH = 2816;
export const OG_IMAGE_HEIGHT = 1536;
export const OG_IMAGE_ALT = "Venezuela Te Ayuda — Mapa de ayuda mutua en Venezuela";

export const SITE_OPEN_GRAPH_IMAGE = {
  url: OG_IMAGE,
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  alt: OG_IMAGE_ALT,
  type: "image/png",
} as const;

export const DONATION_URL =
  "https://www.gofundme.com/f/support-mallanet-secure-tech-for-all";
