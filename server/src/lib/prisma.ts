import { PrismaClient } from '@prisma/client';

// Force connection pool to 10 connections (default = num_cpus*2+1, ~5 on VPS)
// and reduce pool_timeout to fail fast instead of waiting 10s
const databaseUrl = process.env.DATABASE_URL || '';
const urlWithPool = databaseUrl.includes('?')
  ? `${databaseUrl}&connection_limit=20`
  : `${databaseUrl}?connection_limit=20`;

const prisma = new PrismaClient({
  datasources: { db: { url: urlWithPool } },
});

export default prisma;
