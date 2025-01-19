import { PrismaClient } from "@prisma/client";
import "server-only";

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

try {
  if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
  } else {
    if (!global.cachedPrisma) {
      global.cachedPrisma = new PrismaClient();
    }
    prisma = global.cachedPrisma;
  }
  // Test the database connection
  prisma
    .$connect()
    .then(() => {
      console.log("Database connection successful");
    })
    .catch((error) => {
      console.error("Failed to connect to the database:", error);
    });
} catch (error) {
  console.error("Error initializing Prisma client:", error);
  throw error;
}

export const db = prisma;
