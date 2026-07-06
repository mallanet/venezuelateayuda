import type { HelpModality, QuantityUnit } from "@prisma/client";

export const MODALITY_LABELS: Record<HelpModality, string> = {
  PRESENCIAL: "Presencial",
  ONLINE: "Online",
};

export const QUANTITY_UNITS = [
  "KIT",
  "UNIDAD",
  "PERSONA",
  "FAMILIA",
  "HORA",
  "SESION",
] as const satisfies readonly QuantityUnit[];

const UNIT_FORMS: Record<QuantityUnit, { one: string; other: string }> = {
  KIT: { one: "kit", other: "kits" },
  UNIDAD: { one: "unidad", other: "unidades" },
  PERSONA: { one: "persona", other: "personas" },
  FAMILIA: { one: "familia", other: "familias" },
  HORA: { one: "hora", other: "horas" },
  SESION: { one: "sesión", other: "sesiones" },
};

export const QUANTITY_UNIT_LABELS: Record<QuantityUnit, string> = {
  KIT: "Kit",
  UNIDAD: "Unidad",
  PERSONA: "Persona",
  FAMILIA: "Familia",
  HORA: "Hora",
  SESION: "Sesión",
};

/** Texto legible: "1 kit", "3 familias". */
export function formatHelpQuantity(quantity: number, unit: QuantityUnit): string {
  const forms = UNIT_FORMS[unit];
  const word = quantity === 1 ? forms.one : forms.other;
  return `${quantity} ${word}`;
}

/** Resumen corto para badges: cantidad + modalidad. */
export function formatListingMeta(
  quantity: number,
  unit: QuantityUnit,
  modality: HelpModality
): string {
  return `${formatHelpQuantity(quantity, unit)} · ${MODALITY_LABELS[modality]}`;
}
