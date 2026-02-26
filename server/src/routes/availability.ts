import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireKooker } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

const router = Router();

// GET /kooker/:id - Get future availabilities for a kooker
router.get('/kooker/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kookerProfileId = parseInt(req.params.id, 10);
    if (isNaN(kookerProfileId)) {
      throw new AppError('ID invalide', 400);
    }

    const availabilities = await prisma.availability.findMany({
      where: {
        kookerProfileId,
        date: { gte: new Date() },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({
      success: true,
      data: availabilities,
    });
  } catch (error) {
    next(error);
  }
});

// PUT / - Batch update availabilities (delete old, create new)
router.put(
  '/',
  authenticate,
  requireKooker,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kookerProfileId = req.user!.kookerProfileId!;
      const { availabilities } = req.body;

      if (!Array.isArray(availabilities)) {
        throw new AppError('Le champ availabilities doit etre un tableau', 400);
      }

      // Delete all existing future availabilities for this kooker
      await prisma.availability.deleteMany({
        where: {
          kookerProfileId,
          date: { gte: new Date() },
        },
      });

      // Create new availabilities
      if (availabilities.length > 0) {
        await prisma.availability.createMany({
          data: availabilities.map(
            (a: { date: string; startTime: string; endTime: string; isAvailable?: boolean }) => ({
              kookerProfileId,
              date: new Date(a.date),
              startTime: a.startTime,
              endTime: a.endTime,
              isAvailable: a.isAvailable !== undefined ? a.isAvailable : true,
            })
          ),
        });
      }

      // Return the newly created availabilities
      const updated = await prisma.availability.findMany({
        where: {
          kookerProfileId,
          date: { gte: new Date() },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
