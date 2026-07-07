import type { PrismaClient } from "@prisma/client";

/** Correos de voluntarios reales que nunca deben borrarse al limpiar demos. */
export const REAL_VOLUNTEER_EMAILS = [
  "calma-universidadcontinental@venezuelateayuda.org",
] as const;

export function keepUserEmails(): string[] {
  const admin = process.env.ADMIN_EMAIL ?? "admin@venezuelateayuda.org";
  return [admin, ...REAL_VOLUNTEER_EMAILS];
}

/** Elimina usuarios de prueba; conserva admin y voluntarios reales. */
export async function purgeDemoUsers(prisma: PrismaClient) {
  const keep = keepUserEmails();
  const pending = await prisma.user.count({ where: { email: { notIn: keep } } });
  if (pending === 0) return { deleted: 0, kept: keep };

  const result = await prisma.user.deleteMany({ where: { email: { notIn: keep } } });
  return { deleted: result.count, kept: keep };
}
