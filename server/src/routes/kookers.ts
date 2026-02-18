import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate, requireKooker } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { becomeKookerSchema, updateKookerProfileSchema } from '../schemas/kooker.js';
import { AppError, NotFoundError } from '../utils/errors.js';

const router = Router();
const prisma = new PrismaClient();

// GET / - Search kookers with filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      q,
      type,
      specialty,
      city,
      minPrice,
      maxPrice,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.KookerProfileWhereInput = {
      active: true,
    };

    // Search across user names, bio, city, specialties
    if (q) {
      const searchTerm = q as string;
      where.OR = [
        { user: { firstName: { contains: searchTerm } } },
        { user: { lastName: { contains: searchTerm } } },
        { bio: { contains: searchTerm } },
        { city: { contains: searchTerm } },
      ];
    }

    if (city) {
      where.city = { contains: city as string };
    }

    // Type and specialty filters require JSON field filtering
    // We filter in-application after fetching since Prisma JSON filtering varies by DB
    const [kookers, total] = await Promise.all([
      prisma.kookerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          services: {
            where: { active: true },
            select: {
              id: true,
              priceInCents: true,
              type: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
      }),
      prisma.kookerProfile.count({ where }),
    ]);

    // Post-filter by type and specialty (JSON fields)
    let filtered = kookers;

    if (type) {
      const typeFilter = type as string;
      filtered = filtered.filter((k) => {
        const kType = k.type as string[] | null;
        return kType && Array.isArray(kType) && kType.includes(typeFilter);
      });
    }

    if (specialty) {
      const specialtyFilter = specialty as string;
      filtered = filtered.filter((k) => {
        const kSpec = k.specialties as string[] | null;
        return kSpec && Array.isArray(kSpec) && kSpec.includes(specialtyFilter);
      });
    }

    // Price filter based on services
    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice as string, 10) * 100 : 0;
      const max = maxPrice ? parseInt(maxPrice as string, 10) * 100 : Infinity;
      filtered = filtered.filter((k) => {
        if (k.services.length === 0) return false;
        const lowestPrice = Math.min(...k.services.map((s) => s.priceInCents));
        return lowestPrice >= min && lowestPrice <= max;
      });
    }

    res.json({
      success: true,
      data: {
        kookers: filtered,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /dashboard/stats - Kooker dashboard statistics (must be before /:id)
router.get(
  '/dashboard/stats',
  authenticate,
  requireKooker,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kookerProfileId = req.user!.kookerProfileId!;

      const [totalBookings, pendingBookings, revenueResult, kookerProfile] = await Promise.all([
        prisma.booking.count({
          where: { kookerProfileId },
        }),
        prisma.booking.count({
          where: { kookerProfileId, status: 'pending' },
        }),
        prisma.booking.aggregate({
          where: { kookerProfileId, status: 'completed' },
          _sum: { totalPriceInCents: true },
        }),
        prisma.kookerProfile.findUnique({
          where: { id: kookerProfileId },
          select: { rating: true, reviewCount: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalBookings,
          pendingBookings,
          totalRevenue: revenueResult._sum.totalPriceInCents || 0,
          avgRating: kookerProfile?.rating || 0,
          totalReviews: kookerProfile?.reviewCount || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /:id - Full kooker profile
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError('ID invalide', 400);
    }

    const kooker = await prisma.kookerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
          },
        },
        services: {
          where: { active: true },
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            menuItems: { orderBy: { sortOrder: 'asc' } },
          },
        },
        reviewsReceived: {
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
        },
        availabilities: {
          where: {
            date: { gte: new Date() },
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!kooker) {
      throw new NotFoundError('Profil kooker non trouve');
    }

    res.json({
      success: true,
      data: kooker,
    });
  } catch (error) {
    next(error);
  }
});

// POST /become - Become a kooker
router.post(
  '/become',
  authenticate,
  validate(becomeKookerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const existing = await prisma.kookerProfile.findUnique({
        where: { userId },
      });

      if (existing) {
        throw new AppError('Vous etes deja kooker', 409);
      }

      const { bio, specialties, type, city, experience } = req.body;

      const kookerProfile = await prisma.kookerProfile.create({
        data: {
          userId,
          bio,
          specialties,
          type,
          city,
          experience,
        },
      });

      // Update user role
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'kooker' },
      });

      res.status(201).json({
        success: true,
        data: kookerProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /profile - Update kooker profile
router.put(
  '/profile',
  authenticate,
  requireKooker,
  validate(updateKookerProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kookerProfileId = req.user!.kookerProfileId!;
      const { bio, specialties, type, city, experience } = req.body;

      const data: Record<string, unknown> = {};
      if (bio !== undefined) data.bio = bio;
      if (specialties !== undefined) data.specialties = specialties;
      if (type !== undefined) data.type = type;
      if (city !== undefined) data.city = city;
      if (experience !== undefined) data.experience = experience;

      const updated = await prisma.kookerProfile.update({
        where: { id: kookerProfileId },
        data,
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
