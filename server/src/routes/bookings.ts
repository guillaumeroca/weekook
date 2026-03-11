import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireKooker } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema, updateBookingStatusSchema } from '../schemas/booking.js';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors.js';
import {
  sendBookingRequestToKooker,
  sendBookingConfirmedToUser,
  sendBookingCancelledToUser,
  sendBookingCancelledToKooker,
} from '../lib/email.js';

// Envoie un message système dans la messagerie interne (fire-and-forget)
async function sendSystemMessage(senderId: number, receiverId: number, content: string, kookerRecipientId: number, bookingId?: number): Promise<void> {
  try {
    await prisma.message.create({ data: { senderId, receiverId, content, kookerRecipientId, ...(bookingId ? { bookingId } : {}) } });
  } catch (err) {
    console.error('[booking] Failed to send system message:', err);
  }
}

const router = Router();

// GET /my - Get current user's bookings
router.get(
  '/my',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const t0 = Date.now();
      console.log(`[bookings/my] userId=${userId} - start`);

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

      console.log(`[bookings/my] userId=${userId} - query done in ${Date.now() - t0}ms, found ${bookings.length}`);

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
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      // Notifications (fire-and-forget)
      const kookerUser = booking.kookerProfile.user as { id: number; email: string; firstName: string; lastName: string; avatar: string | null };
      const clientUser = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });
      const clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}`.trim() : 'Un utilisateur';
      const kookerName = `${kookerUser.firstName} ${kookerUser.lastName}`.trim();

      sendBookingRequestToKooker(
        kookerUser.email,
        kookerName,
        clientName,
        booking.service.title,
        booking.date,
        booking.startTime,
        booking.guests,
        booking.totalPriceInCents
      );

      sendSystemMessage(
        userId,
        kookerUser.id,
        `📅 Nouvelle demande de réservation pour "${booking.service.title}" le ${new Date(booking.date).toLocaleDateString('fr-FR')} à ${booking.startTime} (${booking.guests} convive${booking.guests > 1 ? 's' : ''}). Montant : ${(booking.totalPriceInCents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}.`,
        booking.kookerProfileId,
        booking.id
      );

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
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          kookerProfile: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      // Notifications (fire-and-forget)
      const clientUser = updated.user as { id: number; email: string; firstName: string; lastName: string };
      const kookerProfileUser = (updated.kookerProfile as any).user as { id: number; firstName: string; lastName: string };
      const kookerName = `${kookerProfileUser.firstName} ${kookerProfileUser.lastName}`.trim();

      if (status === 'confirmed') {
        sendBookingConfirmedToUser(
          clientUser.email,
          `${clientUser.firstName} ${clientUser.lastName}`.trim(),
          kookerName,
          updated.service.title,
          updated.date,
          updated.startTime,
          updated.guests,
          updated.totalPriceInCents
        );
        sendSystemMessage(
          kookerProfileUser.id,
          clientUser.id,
          `✅ Votre réservation pour "${updated.service.title}" le ${new Date(updated.date).toLocaleDateString('fr-FR')} à ${updated.startTime} a été confirmée par ${kookerName} !`,
          kookerProfileId,
          updated.id
        );
      } else if (status === 'cancelled') {
        sendBookingCancelledToUser(
          clientUser.email,
          `${clientUser.firstName} ${clientUser.lastName}`.trim(),
          kookerName,
          updated.service.title,
          updated.date
        );
        sendSystemMessage(
          kookerProfileUser.id,
          clientUser.id,
          `❌ Votre réservation pour "${updated.service.title}" le ${new Date(updated.date).toLocaleDateString('fr-FR')} a été annulée par ${kookerName}.`,
          kookerProfileId,
          updated.id
        );
      }

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

      // Fetch full booking info before update for notifications
      const fullBooking = await prisma.booking.findUnique({
        where: { id },
        include: {
          service: { select: { title: true } },
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          kookerProfile: {
            include: {
              user: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'cancelled' },
      });

      // Notifications (fire-and-forget)
      if (fullBooking) {
        const clientUser = fullBooking.user;
        const kookerUser = (fullBooking.kookerProfile as any).user as { id: number; email: string; firstName: string; lastName: string };
        const clientName = `${clientUser.firstName} ${clientUser.lastName}`.trim();
        const kookerName = `${kookerUser.firstName} ${kookerUser.lastName}`.trim();
        const serviceTitle = fullBooking.service.title;
        const date = fullBooking.date;

        if (isOwner) {
          // User cancelled → notify kooker
          sendBookingCancelledToKooker(kookerUser.email, kookerName, clientName, serviceTitle, date);
          sendSystemMessage(
            clientUser.id,
            kookerUser.id,
            `❌ ${clientName} a annulé sa réservation pour "${serviceTitle}" du ${new Date(date).toLocaleDateString('fr-FR')}.`,
            fullBooking.kookerProfileId
          );
        } else {
          // Kooker cancelled → notify user
          sendBookingCancelledToUser(clientUser.email, clientName, kookerName, serviceTitle, date);
          sendSystemMessage(
            kookerUser.id,
            clientUser.id,
            `❌ Votre réservation pour "${serviceTitle}" du ${new Date(date).toLocaleDateString('fr-FR')} a été annulée par ${kookerName}.`,
            fullBooking.kookerProfileId
          );
        }
      }

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
