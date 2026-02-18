import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        kookerProfileId?: number | null;
      };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new UnauthorizedError('Token manquant');
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { kookerProfile: { select: { id: true } } },
    });

    if (!user) {
      throw new UnauthorizedError('Utilisateur non trouve');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      kookerProfileId: user.kookerProfile?.id || null,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Token invalide'));
    }
  }
}

export function requireKooker(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.kookerProfileId) {
    return next(new UnauthorizedError('Acces reserve aux kookers'));
  }
  next();
}
