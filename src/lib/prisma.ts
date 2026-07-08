import { PrismaClient } from "@prisma/client";

const createPrismaClient = (): PrismaClient => {
  const url = process.env.DATABASE_URL;
  return new PrismaClient(url ? { datasourceUrl: url } : {});
};

declare global {
  var prismaClient: PrismaClient | undefined;
}

export const prisma = globalThis.prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prisma;
}
