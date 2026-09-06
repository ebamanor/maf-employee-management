import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const url = new URL(connectionString);
const sslmode = url.searchParams.get("sslmode");
const needsSsl =
  sslmode === "require" ||
  sslmode === "prefer" ||
  url.searchParams.get("ssl") === "true" ||
  process.env.PGSSLMODE === "require";

const adapter = new PrismaPg({
  connectionString,
  ssl: needsSsl ? true : undefined,
});

export const prisma = new PrismaClient({ adapter });
