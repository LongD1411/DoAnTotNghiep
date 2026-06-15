import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to initialize PrismaClient');
}

const prisma = new PrismaClient();

export default prisma;