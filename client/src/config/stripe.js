import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() || '';

if (!publishableKey && import.meta.env.PROD) {
  throw new Error(
    'VITE_STRIPE_PUBLISHABLE_KEY is required in production. Set it before building the client.'
  );
}

export const stripePublishableKey = publishableKey;
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
