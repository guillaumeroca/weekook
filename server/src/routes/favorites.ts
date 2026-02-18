import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

const router = Router();
const prisma = new PrismaClient();

// GET / - Get user's favorites
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          kookerProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /:kookerId - Add favorite
router.post(
  '/:kookerId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const kookerProfileId = parseInt(req.params.kookerId, 10);

      if (isNaN(kookerProfileId)) {
        throw new AppError('ID invalide', 400);
      }

      // Check kooker exists
      const kookerProfile = await prisma.kookerProfile.findUnique({
        where: { id: kookerProfileId },
      });

      if (!kookerProfile) {
        throw new AppError('Profil kooker non trouve', 404);
      }

      // Upsert: ignore if already exists
      const existing = await prisma.favorite.findUnique({
        where: {
          userId_kookerProfileId: { userId, kookerProfileId },
        },
      });

      if (existing) {
        return res.json({
          success: true,
          data: existing,
        });
      }

      const favorite = await prisma.favorite.create({
        data: { userId, kookerProfileId },
      });

      res.status(201).json({
        success: true,
        data: favorite,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /:kookerId - Remove favorite
router.delete(
  '/:kookerId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const kookerProfileId = parseInt(req.params.kookerId, 10);

      if (isNaN(kookerProfileId)) {
        throw new AppError('ID invalide', 400);
      }

      const existing = await prisma.favorite.findUnique({
        where: {
          userId_kookerProfileId: { userId, kookerProfileId },
        },
      });

      if (!existing) {
        throw new AppError('Favori non trouve', 404);
      }

      await prisma.favorite.delete({
        where: {
          userId_kookerProfileId: { userId, kookerProfileId },
        },
      });

      res.json({
        success: true,
        data: { message: 'Favori supprime avec succes' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
