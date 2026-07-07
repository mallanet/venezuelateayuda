import { PrismaClient } from "@prisma/client";

const createPrismaClient = (): PrismaClient => new PrismaClient();

declare global {
  var prismaClient: PrismaClient | undefined;
}

export const prisma = globalThis.prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prisma;
}
