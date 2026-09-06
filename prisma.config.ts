import { defineConfig } from "prisma/config";

// A placeholder is used so `prisma generate` can run before DATABASE_URL is set.
// The real DATABASE_URL is always read from the environment at runtime (lib/prisma.ts)
// and during `prisma db push` (see start.sh).
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
