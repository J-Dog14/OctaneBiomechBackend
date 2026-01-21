import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7+ requires connection URL to be passed to PrismaClient constructor
// instead of in the schema datasource block
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    // In development, only log query errors, not connection lifecycle warnings
    // The "Error in PostgreSQL connection: Error { kind: Closed }" messages
    // are harmless and occur due to Next.js hot-reloading and Neon connection pooling
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

