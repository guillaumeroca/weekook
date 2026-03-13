import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ── Stats ─────────────────────────────────────────────────────────────────────

// GET /stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [userCount, kookerCount, bookingCount, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.kookerProfile.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPriceInCents: true },
        where: { status: { in: ['confirmed', 'completed'] } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        userCount,
        kookerCount,
        bookingCount,
        revenueInCents: revenueAgg._sum.totalPriceInCents ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Users ─────────────────────────────────────────────────────────────────────

// GET /users
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          createdAt: true,
          kookerProfile: { select: { id: true, active: true, verified: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: { users, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
});

// PUT /users/:id
router.put('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { role, suspended } = req.body;

    const data: any = {};
    if (role !== undefined) data.role = role;
    if (suspended !== undefined) data.role = suspended ? 'suspended' : 'user';

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id
router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, data: { message: 'Utilisateur supprimé' } });
  } catch (error) {
    next(error);
  }
});

// ── Kookers ───────────────────────────────────────────────────────────────────

// GET /kookers
router.get('/kookers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { city: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
      ];
    }

    const [kookers, total] = await Promise.all([
      prisma.kookerProfile.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, avatar: true } },
          _count: { select: { services: true, bookingsReceived: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.kookerProfile.count({ where }),
    ]);

    res.json({ success: true, data: { kookers, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
});

// PUT /kookers/:id
router.put('/kookers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { featured, verified, active } = req.body;

    const data: any = {};
    if (featured !== undefined) data.featured = featured;
    if (verified !== undefined) data.verified = verified;
    if (active !== undefined) data.active = active;

    const kooker = await prisma.kookerProfile.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    res.json({ success: true, data: kooker });
  } catch (error) {
    next(error);
  }
});

// ── Bookings ──────────────────────────────────────────────────────────────────

// GET /bookings
router.get('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          kookerProfile: {
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
          },
          service: { select: { id: true, title: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ success: true, data: { bookings, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
});

// ── Services ──────────────────────────────────────────────────────────────────

// GET /services
router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        include: {
          kookerProfile: {
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
          },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.service.count(),
    ]);

    res.json({ success: true, data: { services, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
});

// ── Testimonials ──────────────────────────────────────────────────────────────

// GET /testimonials
router.get('/testimonials', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      include: {
        kookerProfile: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: testimonials });
  } catch (error) {
    next(error);
  }
});

// PUT /testimonials/:id
router.put('/testimonials/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { featured, authorName, authorRole, content, rating } = req.body;

    const data: any = {};
    if (featured !== undefined) data.featured = featured;
    if (authorName !== undefined) data.authorName = authorName;
    if (authorRole !== undefined) data.authorRole = authorRole;
    if (content !== undefined) data.content = content;
    if (rating !== undefined) data.rating = rating;

    const testimonial = await prisma.testimonial.update({ where: { id }, data });
    res.json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
});

// DELETE /testimonials/:id
router.delete('/testimonials/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.testimonial.delete({ where: { id } });
    res.json({ success: true, data: { message: 'Témoignage supprimé' } });
  } catch (error) {
    next(error);
  }
});

// ── Config ────────────────────────────────────────────────────────────────────

// GET /config
router.get('/config', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await prisma.config.findMany({ orderBy: { key: 'asc' } });
    const result: Record<string, any> = {};
    for (const c of configs) {
      try {
        result[c.key] = JSON.parse(c.value);
      } catch {
        result[c.key] = c.value;
      }
    }
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// PUT /config/:key
router.put('/config/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const config = await prisma.config.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });

    res.json({ success: true, data: { key: config.key, value: JSON.parse(config.value) } });
  } catch (error) {
    next(error);
  }
});

export default router;
