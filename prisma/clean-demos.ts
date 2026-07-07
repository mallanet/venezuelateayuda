import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@venezuelateayuda.org";

/** Correos de voluntarios reales que deben conservarse. */
const KEEP_EMAILS = [
  ADMIN_EMAIL,
  "calma-universidadcontinental@venezuelateayuda.org",
];

/** Elimina usuarios de prueba; conserva admin y voluntarios reales. */
async function main() {
  const toDelete = await prisma.user.findMany({
    where: { email: { notIn: KEEP_EMAILS } },
    select: { email: true },
  });

  if (toDelete.length === 0) {
    console.log("No hay datos de prueba que eliminar.");
    return;
  }

  const result = await prisma.user.deleteMany({
    where: { email: { notIn: KEEP_EMAILS } },
  });

  console.log(`Eliminados ${result.count} usuario(s) de prueba.`);
  console.log(`Conservados: ${KEEP_EMAILS.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
