#!/bin/bash
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

# Push the Prisma schema to the Postgres database.
# --accept-data-loss is needed in CI/non-interactive environments.
npx prisma db push --accept-data-loss --skip-generate

# Build the Next.js app.
npx next build
