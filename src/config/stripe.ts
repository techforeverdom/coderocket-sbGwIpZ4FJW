import Stripe from 'stripe';
import { config } from './config';

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
  paymentMethodTypes: ['card'],
  captureMethod: 'automatic',
  confirmationMethod: 'automatic',
};

export function isStripeConfigured(): boolean {
  return stripe !== null;
}

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  return stripe;
}