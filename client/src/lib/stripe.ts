import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = fetch('/api/v1/stripe/config')
      .then(res => res.json())
      .then(data => {
        const key = data?.data?.publishableKey;
        if (!key) return null;
        return loadStripe(key);
      })
      .catch(() => null);
  }
  return stripePromise;
}

export const STRIPE_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#111125',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};
