import Stripe from 'stripe';
import { config } from './config';

// Only initialize Stripe if secret key is provided
let stripe: Stripe | null = null;

if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
  console.log('✅ Stripe initialized successfully');
} else {
  console.warn('⚠️  Stripe not initialized - STRIPE_SECRET_KEY not provided');
}

export { stripe };

export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'] as Stripe.PaymentIntentCreateParams.PaymentMethodType[],
  captureMethod: 'automatic' as const,
  confirmationMethod: 'automatic' as const,
} as const;

// Helper function to check if Stripe is available
export function isStripeConfigured(): boolean {
  return stripe !== null;
}

// Helper function to get Stripe instance with error handling
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
}