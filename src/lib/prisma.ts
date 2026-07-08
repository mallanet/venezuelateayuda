import { PrismaClient } from "@prisma/client";

declare global {
  var prismaClient: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  return url
    ? new PrismaClient({ datasources: { db: { url } } })
    : new PrismaClient();
}

let productionClient: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaClient ??= createPrismaClient();
    return globalThis.prismaClient;
  }
  productionClient ??= createPrismaClient();
  return productionClient;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
