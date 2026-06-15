#!/bin/sh
set -e

echo ">>> Pushing Prisma schema to database..."
npx prisma db push

echo ">>> Starting server..."
exec npm run dev
