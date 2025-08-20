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

// Use simple configuration without readonly constraints
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'],
  captureMethod: 'automatic',
  confirmationMethod: 'automatic',
};

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
export interface StripeConfig {
  currency: string;
  paymentMethodTypes: string[];
  captureMethod: string;
  confirmationMethod: string;
}

// Supported payment method types (for reference)
export const SUPPORTED_PAYMENT_METHODS = [
  'card',
  'acss_debit',
  'affirm',
  'afterpay_clearpay',
  'alipay',
  'au_becs_debit',
  'bacs_debit',
  'bancontact',
  'blik',
  'boleto',
  'cashapp',
  'customer_balance',
  'eps',
  'fpx',
  'giropay',
  'grabpay',
  'ideal',
  'interac_present',
  'klarna',
  'konbini',
  'link',
  'oxxo',
  'p24',
  'paynow',
  'paypal',
  'pix',
  'promptpay',
  'sepa_debit',
  'sofort',
  'us_bank_account',
  'wechat_pay',
  'zip'
] as const;