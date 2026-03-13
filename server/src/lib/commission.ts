import prisma from './prisma.js';

export async function getCommissionRate(): Promise<number> {
  const config = await prisma.config.findUnique({ where: { key: 'platformCommission' } });
  if (!config) return 20;
  const parsed = JSON.parse(config.value);
  const rate = typeof parsed === 'number' ? parsed : 20;
  return Math.max(0, Math.min(100, rate));
}
