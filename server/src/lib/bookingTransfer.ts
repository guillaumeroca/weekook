import prisma from './prisma.js';
import stripe from './stripe.js';
import { getCommissionRate } from './commission.js';

/**
 * Execute Stripe transfer from platform to kooker after prestation is completed.
 * Returns true if transfer succeeded, false otherwise.
 */
export async function executeStripeTransfer(bookingId: number): Promise<boolean> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      totalPriceInCents: true,
      stripePaymentIntentId: true,
      paymentStatus: true,
      kookerProfileId: true,
    },
  });

  if (!booking || !stripe || !booking.stripePaymentIntentId || booking.paymentStatus !== 'captured') {
    return false;
  }

  const commissionRate = await getCommissionRate();
  const commissionInCents = Math.round(booking.totalPriceInCents * commissionRate / 100);
  const transferAmount = booking.totalPriceInCents - commissionInCents;

  const kProfile = await prisma.kookerProfile.findUnique({
    where: { id: booking.kookerProfileId },
    select: { stripeAccountId: true },
  });

  if (!kProfile?.stripeAccountId || transferAmount <= 0) {
    return false;
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: 'eur',
      destination: kProfile.stripeAccountId,
      transfer_group: `booking_${booking.id}`,
      metadata: {
        bookingId: String(booking.id),
        totalAmount: String(booking.totalPriceInCents),
        commission: String(commissionInCents),
        commissionRate: String(commissionRate),
      },
    });
    await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus: 'transferred' } });
    await prisma.payment.create({
      data: {
        bookingId,
        stripePaymentIntentId: booking.stripePaymentIntentId,
        type: 'transfer',
        amountInCents: transferAmount,
        commissionInCents,
        stripeTransferId: transfer.id,
        status: 'succeeded',
        metadata: { commissionRate },
      },
    });
    console.log(`[transfer] Booking ${bookingId}: ${transferAmount / 100}€ transferred to ${kProfile.stripeAccountId}`);
    return true;
  } catch (transferError) {
    console.error('[transfer] Stripe transfer failed:', transferError);
    await prisma.payment.create({
      data: {
        bookingId,
        stripePaymentIntentId: booking.stripePaymentIntentId,
        type: 'transfer',
        amountInCents: transferAmount,
        commissionInCents,
        status: 'failed',
        metadata: { error: String(transferError) },
      },
    });
    return false;
  }
}
