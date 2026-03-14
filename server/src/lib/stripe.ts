import Stripe from 'stripe';
import { env } from '../config/env.js';

let stripe: Stripe | null = null;

if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    typescript: true,
  });
} else {
  console.warn('[stripe] STRIPE_SECRET_KEY non configurée — les paiements sont désactivés.');
}

export default stripe;
