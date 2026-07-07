import { PrismaClient } from "@prisma/client";
import { keepUserEmails, purgeDemoUsers } from "../src/lib/purge-demo-users";

const prisma = new PrismaClient();

async function main() {
  const { deleted, kept } = await purgeDemoUsers(prisma);
  if (deleted === 0) {
    console.log("No hay datos de prueba que eliminar.");
    return;
  }
  console.log(`Eliminados ${deleted} usuario(s) de prueba.`);
  console.log(`Conservados: ${kept.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
