import type { Category, ListingType } from "@prisma/client";

export const CATEGORY_LABELS: Record<Category, string> = {
  ALIMENTOS: "Alimentos",
  MEDICINAS: "Medicinas",
  TRANSPORTE: "Transporte",
  ALOJAMIENTO: "Alojamiento",
  EDUCACION: "Educación",
  EMPLEO: "Empleo",
  OTRO: "Otro",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  ALIMENTOS: "🍲",
  MEDICINAS: "💊",
  TRANSPORTE: "🚌",
  ALOJAMIENTO: "🏠",
  EDUCACION: "📚",
  EMPLEO: "💼",
  OTRO: "🤝",
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  OFREZCO: "Ofrezco ayuda",
  NECESITO: "Necesito ayuda",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
