import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple Prisma instances during development
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}