#!/bin/bash
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

# Use the unpooled connection for Prisma migrations/db push if Vercel/Neon provides one.
MIGRATE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"

# Push the Prisma schema to the Postgres database.
# --accept-data-loss is needed in CI/non-interactive environments.
DATABASE_URL="$MIGRATE_URL" npx prisma db push --accept-data-loss --skip-generate

# Build the Next.js app.
npx next build
