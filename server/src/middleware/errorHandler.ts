import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import prisma from '../lib/prisma.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  console.error('Unexpected error:', err);

  // Log 5xx errors to DB (fire-and-forget)
  prisma.errorLog.create({
    data: {
      message: err.message || 'Unknown error',
      stack: err.stack ?? null,
      route: req.path ?? null,
      method: req.method ?? null,
      statusCode: 500,
      userId: (req as any).user?.userId ?? null,
    },
  }).catch(() => {});

  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur',
  });
}
