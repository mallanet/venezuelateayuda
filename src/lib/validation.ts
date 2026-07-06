import { z } from "zod";
import { VENEZUELA_STATES } from "@/lib/venezuela";

const stateNames = VENEZUELA_STATES.map((s) => s.name) as [string, ...string[]];

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["AYUDANTE", "SOLICITANTE"]),
  displayName: z.string().min(2, "Nombre demasiado corto").max(60),
  phone: z.string().max(20).optional().or(z.literal("")),
  state: z.enum(stateNames),
  municipality: z.string().min(1, "Selecciona un municipio"),
  acceptTerms: z.literal(true, {
    message: "Debes aceptar los términos y la política de privacidad",
  }),
});

export const listingSchema = z.object({
  type: z.enum(["OFREZCO", "NECESITO"]),
  title: z.string().min(5, "Título demasiado corto").max(100),
  description: z.string().min(20, "Describe con más detalle (mínimo 20 caracteres)").max(2000),
  category: z.enum(["ALIMENTOS", "MEDICINAS", "TRANSPORTE", "ALOJAMIENTO", "EDUCACION", "EMPLEO", "OTRO"]),
  state: z.enum(stateNames),
  municipality: z.string().min(1),
  lat: z.number().min(0.5).max(13),
  lng: z.number().min(-74).max(-59),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1").max(9999),
  quantityUnit: z.enum(["KIT", "UNIDAD", "PERSONA", "FAMILIA", "HORA", "SESION"]),
  modality: z.enum(["PRESENCIAL", "ONLINE"]),
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(60),
  avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  state: z.enum(stateNames),
  municipality: z.string().min(1),
  radiusKm: z.number().int().min(1).max(100),
  categories: z.array(z.enum(["ALIMENTOS", "MEDICINAS", "TRANSPORTE", "ALOJAMIENTO", "EDUCACION", "EMPLEO", "OTRO"])),
});

export const messageSchema = z.object({
  body: z.string().min(1, "El mensaje no puede estar vacío").max(2000),
});

export const reportSchema = z.object({
  reason: z.string().min(10, "Explica el motivo (mínimo 10 caracteres)").max(1000),
  listingId: z.string().optional(),
  userId: z.string().optional(),
});
