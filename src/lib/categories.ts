import { Soup, Pill, BusFront, House, BookOpen, Briefcase, HandHeart, type LucideIcon } from "lucide-react";
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

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  ALIMENTOS: Soup,
  MEDICINAS: Pill,
  TRANSPORTE: BusFront,
  ALOJAMIENTO: House,
  EDUCACION: BookOpen,
  EMPLEO: Briefcase,
  OTRO: HandHeart,
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  OFREZCO: "Ofrezco ayuda",
  NECESITO: "Necesito ayuda",
};

export const CATEGORIES = [
  "ALIMENTOS",
  "MEDICINAS",
  "TRANSPORTE",
  "ALOJAMIENTO",
  "EDUCACION",
  "EMPLEO",
  "OTRO",
] satisfies Category[];


