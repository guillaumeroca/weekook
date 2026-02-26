import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET / - Get featured testimonials
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { featured: true },
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
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
