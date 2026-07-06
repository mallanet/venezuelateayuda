import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Crea el usuario administrador inicial si no existe.
 * Credenciales configurables por ADMIN_EMAIL / ADMIN_PASSWORD.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@venezuelateayuda.org";
  const password = process.env.ADMIN_PASSWORD ?? "admin-vta-2026";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`El admin ${email} ya existe, no se hace nada.`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
      status: "APROBADO",
      emailVerified: new Date(),
      termsAcceptedAt: new Date(),
      profile: {
        create: {
          displayName: "Equipo de Moderación",
          state: "Distrito Capital",
          municipality: "Libertador",
        },
      },
    },
  });
  console.log(`Admin creado: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
