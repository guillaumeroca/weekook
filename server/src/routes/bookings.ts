import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireKooker } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema, updateBookingStatusSchema } from '../schemas/booking.js';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors.js';

const router = Router();
const prisma = new PrismaClient();

// GET /my - Get current user's bookings
router.get(
  '/my',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
          service: {
            select: {
              id: true,
              title: true,
              type: true,
              priceInCents: true,
              durationMinutes: true,
            },
          },
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
        orderBy: { date: 'desc' },
      });

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /kooker - Get bookings received as kooker
router.get(
  '/kooker',
  authenticate,
  requireKooker,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kookerProfileId = req.user!.kookerProfileId!;

      const bookings = await prisma.booking.findMany({
        where: { kookerProfileId },
        include: {
          service: {
            select: {
              id: true,
              title: true,
              type: true,
              priceInCents: true,
              durationMinutes: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST / - Create booking
router.post(
  '/',
  authenticate,
  validate(createBookingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { serviceId, date, startTime, guests, notes } = req.body;

      // Get the service to calculate total price and find kooker
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          priceInCents: true,
          durationMinutes: true,
          kookerProfileId: true,
          maxGuests: true,
          active: true,
        },
      });

      if (!service) {
        throw new NotFoundError('Service non trouve');
      }

      if (!service.active) {
        throw new AppError('Ce service n\'est plus disponible', 400);
      }

      if (guests > service.maxGuests) {
        throw new AppError(
          `Le nombre maximum d'invites pour ce service est ${service.maxGuests}`,
          400
        );
      }

      // Auto-calculate total price: price * guests
      const totalPriceInCents = service.priceInCents * guests;

      const booking = await prisma.booking.create({
        data: {
          userId,
          kookerProfileId: service.kookerProfileId,
          serviceId,
          date: new Date(date),
          startTime,
          guests,
          totalPriceInCents,
          notes,
        },
        include: {
          service: {
            select: {
              id: true,
              title: true,
              type: true,
              priceInCents: true,
              durationMinutes: true,
            },
          },
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
      });

      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id/status - Update booking status (kooker only)
router.put(
  '/:id/status',
  authenticate,
  requireKooker,
  validate(updateBookingStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('ID invalide', 400);
      }

      const kookerProfileId = req.user!.kookerProfileId!;
      const { status } = req.body;

      // Verify the kooker owns this booking
      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new NotFoundError('Reservation non trouvee');
      }
      if (booking.kookerProfileId !== kookerProfileId) {
        throw new ForbiddenError('Vous ne pouvez modifier que vos propres reservations');
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          service: {
            select: { id: true, title: true },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
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

// PUT /:id/cancel - Cancel booking (user or kooker)
router.put(
  '/:id/cancel',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('ID invalide', 400);
      }

      const userId = req.user!.userId;
      const kookerProfileId = req.user!.kookerProfileId;

      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new NotFoundError('Reservation non trouvee');
      }

      // User or kooker can cancel
      const isOwner = booking.userId === userId;
      const isKooker = kookerProfileId && booking.kookerProfileId === kookerProfileId;

      if (!isOwner && !isKooker) {
        throw new ForbiddenError('Vous ne pouvez annuler que vos propres reservations');
      }

      if (booking.status === 'cancelled') {
        throw new AppError('Cette reservation est deja annulee', 400);
      }

      if (booking.status === 'completed') {
        throw new AppError('Impossible d\'annuler une reservation terminee', 400);
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'cancelled' },
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
