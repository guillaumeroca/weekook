import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

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

// POST / - Submit a testimonial (pending admin validation)
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorName, authorRole, content, rating } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      res.status(400).json({ success: false, error: 'Le témoignage doit faire au moins 10 caractères.' });
      return;
    }
    if (!authorName || typeof authorName !== 'string' || authorName.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Le nom est requis.' });
      return;
    }
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ success: false, error: 'La note doit être entre 1 et 5.' });
      return;
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        authorName: authorName.trim(),
        authorRole: authorRole?.trim() || null,
        content: content.trim(),
        rating: ratingNum,
        featured: false,
      },
    });

    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
});

export default router;
