import { PrismaClient } from '@prisma/client';

// Pool: 10 connections, 5s timeout (fail-fast instead of 10s default hang)
const databaseUrl = process.env.DATABASE_URL || '';
const separator = databaseUrl.includes('?') ? '&' : '?';
const urlWithPool = `${databaseUrl}${separator}connection_limit=10&pool_timeout=5`;

const prisma = new PrismaClient({
  datasources: { db: { url: urlWithPool } },
});

export default prisma;
