import { getStripe, isStripeConfigured, STRIPE_CONFIG } from '../config/stripe';
import { config } from '../config/config';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

export interface CreatePaymentIntentParams {
  amountCents: number;
  campaignId: string;
  participantId?: string;
  donorEmail?: string;
  donorName?: string;
  message?: string;
  idempotencyKey?: string;
}

export interface FeeCalculation {
  amountCents: number;
  platformFeeCents: number;
  stripeFeeCents: number;
  totalFeeCents: number;
  netCents: number;
}

export class StripeService {
  /**
   * Check if Stripe is configured
   */
  static isConfigured(): boolean {
    return isStripeConfigured();
  }

  /**
   * Calculate fees for a donation amount
   */
  static calculateFees(amountCents: number): FeeCalculation {
    // Platform fee (configurable 6-10%)
    const platformFeeCents = Math.round(
      (amountCents * config.fees.platformFeePercentage) / 100
    );
    
    // Stripe fee (2.9% + $0.30)
    const stripeFeeCents = Math.round(
      (amountCents * config.fees.stripeFeePercentage) / 100 + config.fees.stripeFeeFixed
    );
    
    const totalFeeCents = platformFeeCents + stripeFeeCents;
    const netCents = amountCents - totalFeeCents;
    
    return {
      amountCents,
      platformFeeCents,
      stripeFeeCents,
      totalFeeCents,
      netCents: Math.max(0, netCents), // Ensure non-negative
    };
  }

  /**
   * Create a PaymentIntent for donation checkout
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    const stripe = getStripe();
    const {
      amountCents,
      campaignId,
      participantId,
      donorEmail,
      donorName,
      message,
      idempotencyKey = uuidv4(),
    } = params;

    // Validate minimum amount (Stripe requires at least $0.50)
    if (amountCents < 50) {
      throw new Error('Donation amount must be at least $0.50');
    }

    const feeCalculation = this.calculateFees(amountCents);

    const metadata: Record<string, string> = {
      campaign_id: campaignId,
      amount_cents: amountCents.toString(),
      platform_fee_cents: feeCalculation.platformFeeCents.toString(),
      stripe_fee_cents: feeCalculation.stripeFeeCents.toString(),
      total_fee_cents: feeCalculation.totalFeeCents.toString(),
      net_cents: feeCalculation.netCents.toString(),
    };

    if (participantId) {
      metadata.participant_id = participantId;
    }

    if (donorEmail) {
      metadata.donor_email = donorEmail;
    }

    if (donorName) {
      metadata.donor_name = donorName;
    }

    if (message) {
      metadata.message = message.substring(0, 500); // Stripe metadata limit
    }

    try {
      // Create PaymentIntent with proper types
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: amountCents,
        currency: STRIPE_CONFIG.currency,
        payment_method_types: STRIPE_CONFIG.paymentMethodTypes as any, // Use 'any' to avoid type conflicts
        capture_method: STRIPE_CONFIG.captureMethod as any,
        confirmation_method: STRIPE_CONFIG.confirmationMethod as any,
        metadata,
        description: `Donation to campaign ${campaignId}`,
      };

      // Add receipt email if provided
      if (donorEmail) {
        paymentIntentParams.receipt_email = donorEmail;
      }

      const paymentIntent = await stripe.paymentIntents.create(
        paymentIntentParams,
        {
          idempotencyKey,
        }
      );

      return paymentIntent;
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Retrieve a PaymentIntent by ID
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving PaymentIntent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  /**
   * Create a refund for a PaymentIntent
   */
  static async createRefund(
    paymentIntentId: string,
    amountCents?: number,
    reason?: Stripe.RefundCreateParams.Reason,
    idempotencyKey?: string
  ): Promise<Stripe.Refund> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason: reason || 'requested_by_customer',
      };

      if (amountCents) {
        refundParams.amount = amountCents;
      }

      return await stripe.refunds.create(refundParams, {
        idempotencyKey: idempotencyKey || uuidv4(),
      });
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string = config.stripe.webhookSecret
  ): Stripe.Event {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    if (!secret) {
      throw new Error('Webhook secret is not configured');
    }

    const stripe = getStripe();
    
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Create a customer (optional, for recurring donors)
   */
  static async createCustomer(params: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      return await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: params.metadata,
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * List payment methods for a customer
   */
  static async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw new Error('Failed to list payment methods');
    }
  }

  /**
   * Update a PaymentIntent
   */
  static async updatePaymentIntent(
    paymentIntentId: string,
    params: Stripe.PaymentIntentUpdateParams
  ): Promise<Stripe.PaymentIntent> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      return await stripe.paymentIntents.update(paymentIntentId, params);
    } catch (error) {
      console.error('Error updating PaymentIntent:', error);
      throw new Error('Failed to update payment intent');
    }
  }

  /**
   * Cancel a PaymentIntent
   */
  static async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      return await stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      console.error('Error canceling PaymentIntent:', error);
      throw new Error('Failed to cancel payment intent');
    }
  }

  /**
   * Get balance information
   */
  static async getBalance(): Promise<Stripe.Balance> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      return await stripe.balance.retrieve();
    } catch (error) {
      console.error('Error retrieving balance:', error);
      throw new Error('Failed to retrieve balance');
    }
  }

  /**
   * Create a setup intent for saving payment methods
   */
  static async createSetupIntent(params: {
    customerId?: string;
    paymentMethodTypes?: string[];
    usage?: 'on_session' | 'off_session';
  }): Promise<Stripe.SetupIntent> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      const setupIntentParams: Stripe.SetupIntentCreateParams = {
        payment_method_types: params.paymentMethodTypes || ['card'],
        usage: params.usage || 'off_session',
      };

      if (params.customerId) {
        setupIntentParams.customer = params.customerId;
      }

      return await stripe.setupIntents.create(setupIntentParams);
    } catch (error) {
      console.error('Error creating SetupIntent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  /**
   * Get payment method details
   */
  static async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    try {
      return await stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      console.error('Error retrieving payment method:', error);
      throw new Error('Failed to retrieve payment method');
    }
  }
}