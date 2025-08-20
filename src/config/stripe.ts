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
  currency: 'usd' as const,
  paymentMethodTypes: ['card'] as const,
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

// Type definitions for better type safety
export type PaymentMethodType = 'card' | 'acss_debit' | 'affirm' | 'afterpay_clearpay' | 'alipay' | 'au_becs_debit' | 'bacs_debit' | 'bancontact' | 'blik' | 'boleto' | 'cashapp' | 'customer_balance' | 'eps' | 'fpx' | 'giropay' | 'grabpay' | 'ideal' | 'interac_present' | 'klarna' | 'konbini' | 'link' | 'oxxo' | 'p24' | 'paynow' | 'paypal' | 'pix' | 'promptpay' | 'sepa_debit' | 'sofort' | 'us_bank_account' | 'wechat_pay' | 'zip';

export interface StripeConfig {
  currency: string;
  paymentMethodTypes: readonly string[];
  captureMethod: string;
  confirmationMethod: string;
}