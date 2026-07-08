import { z } from "zod";
import { ABROAD_STATE, isAbroadState } from "@/lib/abroad";
import { VENEZUELA_STATES } from "@/lib/venezuela";

const venezuelaStateNames = VENEZUELA_STATES.map((s) => s.name) as [string, ...string[]];
const stateNames = [...venezuelaStateNames, ABROAD_STATE] as [string, ...string[]];

export const listingTypeSchema = z.enum(["OFREZCO", "NECESITO"]);

export const categorySchema = z.enum([
  "ALIMENTOS",
  "MEDICINAS",
  "TRANSPORTE",
  "ALOJAMIENTO",
  "EDUCACION",
  "EMPLEO",
  "OTRO",
]);

export const stateNameSchema = z.enum(stateNames);

export const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    role: z.enum(["AYUDANTE", "SOLICITANTE"]),
    displayName: z.string().min(2, "Nombre demasiado corto").max(60),
    phone: z.string().max(20).optional().or(z.literal("")),
    state: z.enum(stateNames),
    municipality: z.string().min(1, "Selecciona un municipio o indica tu país"),
    acceptTerms: z.literal(true, {
      message: "Debes aceptar los términos y la política de privacidad",
    }),
  })
  .superRefine((data, ctx) => {
    if (isAbroadState(data.state)) {
      if (data.role !== "AYUDANTE") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Solo los ayudantes pueden registrarse desde el exterior",
          path: ["role"],
        });
      }
      if (data.municipality.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indica tu país de residencia",
          path: ["municipality"],
        });
      }
    }
  });

export const listingSchema = z
  .object({
    type: z.enum(["OFREZCO", "NECESITO"]),
    title: z.string().min(5, "Título demasiado corto").max(100),
    description: z
      .string()
      .min(20, "Describe con más detalle (mínimo 20 caracteres)")
      .max(2000),
    category: z.enum([
      "ALIMENTOS",
      "MEDICINAS",
      "TRANSPORTE",
      "ALOJAMIENTO",
      "EDUCACION",
      "EMPLEO",
      "OTRO",
    ]),
    state: z.enum(stateNames),
    municipality: z.string().min(1),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    quantity: z.number().int().min(1, "La cantidad debe ser al menos 1").max(9999),
    quantityUnit: z.enum(["KIT", "UNIDAD", "PERSONA", "FAMILIA", "HORA", "SESION", "PROYECTO"]),
    modality: z.enum(["PRESENCIAL", "ONLINE"]),
  })
  .superRefine((data, ctx) => {
    if (isAbroadState(data.state)) {
      if (data.type !== "OFREZCO") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las fichas desde el exterior solo pueden ofrecer ayuda",
          path: ["type"],
        });
      }
      if (data.modality !== "ONLINE") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La ayuda desde el exterior debe ser online",
          path: ["modality"],
        });
      }
    }
  });

export const profileSchema = z
  .object({
    displayName: z.string().min(2).max(60),
    avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
    phone: z.string().max(20).optional().or(z.literal("")),
    bio: z.string().max(500).optional().or(z.literal("")),
    state: z.enum(stateNames),
    municipality: z.string().min(1),
    radiusKm: z.number().int().min(1).max(100),
    categories: z.array(
      z.enum(["ALIMENTOS", "MEDICINAS", "TRANSPORTE", "ALOJAMIENTO", "EDUCACION", "EMPLEO", "OTRO"])
    ),
  })
  .superRefine((data, ctx) => {
    if (isAbroadState(data.state) && data.municipality.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica tu país de residencia",
        path: ["municipality"],
      });
    }
  });

export const messageSchema = z.object({
  body: z.string().min(1, "El mensaje no puede estar vacío").max(2000),
});

export const reportSchema = z.object({
  reason: z.string().min(10, "Explica el motivo (mínimo 10 caracteres)").max(1000),
  listingId: z.string().optional(),
  userId: z.string().optional(),
});

export const conversationCreateSchema = z.object({
  listingId: z.string().min(1, "Ficha inválida"),
});

export const listingCloseSchema = z.object({
  action: z.literal("cerrar"),
});

export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1),
});

export const emailOnlySchema = z.object({
  email: z.string().email("Email inválido"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const listingsQuerySchema = z.object({
  type: listingTypeSchema.optional(),
  category: categorySchema.optional(),
  state: stateNameSchema.optional(),
  q: z.string().trim().optional(),
});

export const professionalsQuerySchema = z.object({
  category: categorySchema.optional(),
  state: stateNameSchema.optional(),
  q: z.string().trim().optional(),
});

export const publicListingSchema = z.object({
  id: z.string(),
  type: listingTypeSchema,
  title: z.string(),
  description: z.string(),
  category: categorySchema,
  state: z.string(),
  municipality: z.string(),
  lat: z.number(),
  lng: z.number(),
  createdAt: z.coerce.date(),
  authorName: z.string(),
  authorAvatarUrl: z.string(),
});

export const publicProfessionalSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatarUrl: z.string(),
  state: z.string(),
  municipality: z.string(),
  bio: z.string().nullable(),
  categories: z.array(categorySchema),
  listingsCount: z.number(),
  primaryCategory: categorySchema.nullable(),
});


export function parseSearchParams<T>(
  schema: z.ZodType<T>,
  params: URLSearchParams
): z.ZodSafeParseResult<T> {
  const raw: Record<string, string> = {};
  params.forEach((value, key) => {
    raw[key] = value;
  });
  return schema.safeParse(raw);
}
