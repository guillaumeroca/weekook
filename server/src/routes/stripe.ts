import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import stripe from '../lib/stripe.js';
import { env } from '../config/env.js';
import { authenticate, requireKooker } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';
import Stripe from 'stripe';

const router = Router();

// ── GET /config — Return publishable key (public) ──────────────────────────
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: { publishableKey: env.STRIPE_PUBLISHABLE_KEY },
  });
});

// ── POST /connect/onboard — Create Stripe Express account + onboarding link ─
router.post(
  '/connect/onboard',
  authenticate,
  requireKooker,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!stripe) throw new AppError('Les paiements Stripe ne sont pas configurés.', 503);

      const kookerProfileId = req.user!.kookerProfileId!;

      const kookerProfile = await prisma.kookerProfile.findUnique({
        where: { id: kookerProfileId },
        select: { stripeAccountId: true },
      });

      let stripeAccountId = kookerProfile?.stripeAccountId;

      // Create a new Express account if none exists
      if (!stripeAccountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'FR',
          business_type: 'individual',
          business_profile: {
            mcc: '5812',
            url: 'https://weekook.com',
            product_description: 'Services de cuisine à domicile via la plateforme Weekook',
          },
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          metadata: {
            kookerProfileId: String(kookerProfileId),
          },
        });

        stripeAccountId = account.id;

        await prisma.kookerProfile.update({
          where: { id: kookerProfileId },
          data: { stripeAccountId },
        });
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${env.APP_URL}/kooker-dashboard?stripe=refresh`,
        return_url: `${env.APP_URL}/kooker-dashboard?stripe=return`,
        type: 'account_onboarding',
      });

      res.json({ success: true, data: { url: accountLink.url } });
    } catch (error) {
      next(error);
    }
  }
);

// ── GET /connect/status — Return Stripe account status ──────────────────────
router.get(
  '/connect/status',
  authenticate,
  requireKooker,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kookerProfileId = req.user!.kookerProfileId!;

      const kookerProfile = await prisma.kookerProfile.findUnique({
        where: { id: kookerProfileId },
        select: { stripeAccountId: true, stripeOnboardingComplete: true },
      });

      if (!kookerProfile?.stripeAccountId || !stripe) {
        return res.json({
          success: true,
          data: { connected: false, chargesEnabled: false, payoutsEnabled: false, onboardingComplete: false },
        });
      }

      const account = await stripe.accounts.retrieve(kookerProfile.stripeAccountId);
      const chargesEnabled = account.charges_enabled ?? false;
      const payoutsEnabled = account.payouts_enabled ?? false;
      const onboardingComplete = chargesEnabled && payoutsEnabled;

      // Update DB if onboarding just completed
      if (onboardingComplete && !kookerProfile.stripeOnboardingComplete) {
        await prisma.kookerProfile.update({
          where: { id: kookerProfileId },
          data: { stripeOnboardingComplete: true },
        });
      }

      res.json({
        success: true,
        data: { connected: true, chargesEnabled, payoutsEnabled, onboardingComplete },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /webhook — Stripe webhook handler ──────────────────────────────────
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!stripe || !sig || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Missing signature or webhook secret');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'payment_intent.amount_capturable_updated': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = parseInt(pi.metadata.bookingId, 10);
        if (bookingId) {
          await prisma.booking.updateMany({
            where: { id: bookingId, paymentStatus: 'pending_authorization' },
            data: { paymentStatus: 'authorized' },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = parseInt(pi.metadata.bookingId, 10);
        if (bookingId) {
          await prisma.booking.updateMany({
            where: { id: bookingId },
            data: { paymentStatus: 'failed', status: 'cancelled' },
          });
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        if (account.charges_enabled && account.payouts_enabled) {
          await prisma.kookerProfile.updateMany({
            where: { stripeAccountId: account.id },
            data: { stripeOnboardingComplete: true },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[stripe/webhook] Event processing error:', err);
  }

  res.json({ received: true });
});

export default router;
