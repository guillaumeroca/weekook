import { PrismaClient } from '@prisma/client';

// Limit pool to 5 connections on dev VPS to avoid MySQL max_connections issues
const databaseUrl = process.env.DATABASE_URL || '';
const urlWithPool = databaseUrl.includes('?')
  ? `${databaseUrl}&connection_limit=5`
  : `${databaseUrl}?connection_limit=5`;

const prisma = new PrismaClient({
  datasources: { db: { url: urlWithPool } },
});

export default prisma;
