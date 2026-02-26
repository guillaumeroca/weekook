import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema } from '../schemas/review.js';
import { AppError } from '../utils/errors.js';

const router = Router();

// GET /kooker/:id - Get reviews for a kooker profile
router.get('/kooker/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kookerProfileId = parseInt(req.params.id, 10);
    if (isNaN(kookerProfileId)) {
      throw new AppError('ID invalide', 400);
    }

    const reviews = await prisma.review.findMany({
      where: { kookerProfileId },
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
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
});

// POST / - Create review and recalculate kooker's average rating
router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { kookerProfileId, rating, comment } = req.body;

      // Check if kooker profile exists
      const kookerProfile = await prisma.kookerProfile.findUnique({
        where: { id: kookerProfileId },
      });

      if (!kookerProfile) {
        throw new AppError('Profil kooker non trouve', 404);
      }

      // Prevent reviewing yourself
      if (kookerProfile.userId === userId) {
        throw new AppError('Vous ne pouvez pas laisser un avis sur votre propre profil', 400);
      }

      // Check for existing review
      const existingReview = await prisma.review.findFirst({
        where: { userId, kookerProfileId },
      });

      if (existingReview) {
        throw new AppError('Vous avez deja laisse un avis pour ce kooker', 409);
      }

      // Create the review
      const review = await prisma.review.create({
        data: {
          userId,
          kookerProfileId,
          rating,
          comment,
        },
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
      });

      // Recalculate average rating and review count
      const aggregation = await prisma.review.aggregate({
        where: { kookerProfileId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.kookerProfile.update({
        where: { id: kookerProfileId },
        data: {
          rating: Math.round((aggregation._avg.rating || 0) * 10) / 10,
          reviewCount: aggregation._count.rating,
        },
      });

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
