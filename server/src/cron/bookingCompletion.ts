import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import { executeStripeTransfer } from '../lib/bookingTransfer.js';
import {
  sendConfirmationRequestToUser,
  sendConfirmationReminder1ToUser,
  sendConfirmationReminder2ToUser,
  sendAutoConfirmationToUser,
  sendCompletionToKooker,
} from '../lib/email.js';

// Timezone Europe/Paris
const TZ = 'Europe/Paris';

/**
 * Compute the end DateTime of a booking in UTC.
 */
function getBookingEndTime(bookingDate: Date, startTime: string, durationMinutes: number): Date {
  const [h, m] = startTime.split(':').map(Number);
  const end = new Date(bookingDate);
  end.setUTCHours(h, m + durationMinutes, 0, 0);
  return end;
}

/**
 * Task 1: Detect confirmed bookings whose timeslot has passed → move to awaiting_confirmation + send email 1
 * Runs every 5 minutes.
 */
async function transitionToAwaitingConfirmation(): Promise<void> {
  try {
    const now = new Date();

    const confirmedBookings = await prisma.booking.findMany({
      where: { status: 'confirmed' },
      include: {
        service: { select: { durationMinutes: true, title: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        kookerProfile: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });

    for (const booking of confirmedBookings) {
      const endTime = getBookingEndTime(booking.date, booking.startTime, booking.service.durationMinutes);

      if (now > endTime) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'awaiting_confirmation',
            awaitingConfirmationAt: now,
            reminderSentAt1: now,
          },
        });

        const userName = `${booking.user.firstName} ${booking.user.lastName}`.trim();
        const kookerUser = (booking.kookerProfile as any).user;
        const kookerName = `${kookerUser.firstName} ${kookerUser.lastName}`.trim();

        sendConfirmationRequestToUser(
          booking.user.email,
          userName,
          kookerName,
          booking.service.title,
          booking.date,
          booking.startTime,
          booking.id
        );

        // System message
        try {
          await prisma.message.create({
            data: {
              senderId: kookerUser.id,
              receiverId: booking.user.id,
              content: `🔔 La prestation "${booking.service.title}" est terminée. Merci de confirmer que tout s'est bien passé.`,
              kookerRecipientId: booking.kookerProfileId,
              bookingId: booking.id,
            },
          });
        } catch (err) {
          console.error('[cron] System message error:', err);
        }

        console.log(`[cron] Booking ${booking.id} → awaiting_confirmation`);
      }
    }
  } catch (err) {
    console.error('[cron] transitionToAwaitingConfirmation error:', err);
  }
}

/**
 * Task 2: Send reminder emails for awaiting_confirmation bookings.
 * Reminder 2 at +24h, Reminder 3 at +36h.
 * Runs every 30 minutes.
 */
async function sendReminders(): Promise<void> {
  try {
    const now = new Date();

    const awaitingBookings = await prisma.booking.findMany({
      where: { status: 'awaiting_confirmation' },
      include: {
        service: { select: { title: true } },
        user: { select: { email: true, firstName: true, lastName: true } },
        kookerProfile: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    for (const booking of awaitingBookings) {
      if (!booking.awaitingConfirmationAt) continue;

      const hoursSinceAwaiting = (now.getTime() - new Date(booking.awaitingConfirmationAt).getTime()) / (1000 * 60 * 60);
      const userName = `${booking.user.firstName} ${booking.user.lastName}`.trim();
      const kookerUser = (booking.kookerProfile as any).user;
      const kookerName = `${kookerUser.firstName} ${kookerUser.lastName}`.trim();

      // Reminder 2: after 24h
      if (hoursSinceAwaiting >= 24 && !booking.reminderSentAt2) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSentAt2: now },
        });
        sendConfirmationReminder1ToUser(
          booking.user.email,
          userName,
          kookerName,
          booking.service.title,
          booking.id
        );
        console.log(`[cron] Booking ${booking.id}: reminder 2 sent`);
      }

      // Reminder 3: after 36h
      if (hoursSinceAwaiting >= 36 && !booking.reminderSentAt3) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSentAt3: now },
        });
        sendConfirmationReminder2ToUser(
          booking.user.email,
          userName,
          kookerName,
          booking.service.title,
          booking.id
        );
        console.log(`[cron] Booking ${booking.id}: reminder 3 (last) sent`);
      }
    }
  } catch (err) {
    console.error('[cron] sendReminders error:', err);
  }
}

/**
 * Task 3: Auto-confirm after 48h → completed + Stripe transfer.
 * Runs every 15 minutes.
 */
async function autoConfirm(): Promise<void> {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48h ago

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'awaiting_confirmation',
        awaitingConfirmationAt: { lte: cutoff },
      },
      include: {
        service: { select: { title: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        kookerProfile: {
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        },
      },
    });

    for (const booking of expiredBookings) {
      // Atomically update only if still awaiting_confirmation
      const result = await prisma.booking.updateMany({
        where: { id: booking.id, status: 'awaiting_confirmation' },
        data: { status: 'completed' },
      });

      if (result.count === 0) continue; // Already changed by user

      // Stripe transfer
      await executeStripeTransfer(booking.id);

      const userName = `${booking.user.firstName} ${booking.user.lastName}`.trim();
      const kookerUser = (booking.kookerProfile as any).user as { id: number; email: string; firstName: string; lastName: string };
      const kookerName = `${kookerUser.firstName} ${kookerUser.lastName}`.trim();

      // Notify user
      sendAutoConfirmationToUser(
        booking.user.email,
        userName,
        kookerName,
        booking.service.title,
        booking.id
      );

      // Notify kooker
      sendCompletionToKooker(
        kookerUser.email,
        kookerName,
        userName,
        booking.service.title,
        booking.date,
        booking.totalPriceInCents
      );

      console.log(`[cron] Booking ${booking.id}: auto-confirmed after 48h`);
    }
  } catch (err) {
    console.error('[cron] autoConfirm error:', err);
  }
}

/**
 * Start all booking completion cron jobs.
 */
export function startBookingCompletionCron(): void {
  // Every 5 minutes: transition confirmed → awaiting_confirmation
  cron.schedule('*/5 * * * *', transitionToAwaitingConfirmation, { timezone: TZ });

  // Every 30 minutes: send reminders
  cron.schedule('*/30 * * * *', sendReminders, { timezone: TZ });

  // Every 15 minutes: auto-confirm after 48h
  cron.schedule('*/15 * * * *', autoConfirm, { timezone: TZ });

  console.log('[cron] Booking completion cron jobs started');
}
