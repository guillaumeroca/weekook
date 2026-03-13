import { forwardRef, useImperativeHandle } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { STRIPE_ELEMENT_OPTIONS } from '@/lib/stripe';

export interface StripePaymentFormHandle {
  confirmPayment: (clientSecret: string) => Promise<{ success: boolean; error?: string }>;
}

export const StripePaymentForm = forwardRef<StripePaymentFormHandle>((_props, ref) => {
  const stripe = useStripe();
  const elements = useElements();

  useImperativeHandle(ref, () => ({
    confirmPayment: async (clientSecret: string) => {
      if (!stripe || !elements) return { success: false, error: 'Stripe non chargé' };
      const card = elements.getElement(CardElement);
      if (!card) return { success: false, error: 'Élément carte non trouvé' };

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (error) return { success: false, error: error.message };
      if (paymentIntent?.status === 'requires_capture') return { success: true };
      return { success: false, error: 'Statut inattendu : ' + paymentIntent?.status };
    },
  }));

  return (
    <div className="border border-[#e5e7eb] rounded-[12px] px-4 py-3.5 bg-white focus-within:ring-2 focus-within:ring-[#c1a0fd] focus-within:border-transparent transition-all">
      <CardElement options={STRIPE_ELEMENT_OPTIONS} />
    </div>
  );
});
