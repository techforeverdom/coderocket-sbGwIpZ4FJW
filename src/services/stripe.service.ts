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
  static isConfigured(): boolean {
    return isStripeConfigured();
  }

  static calculateFees(amountCents: number): FeeCalculation {
    const platformFeeCents = Math.round(
      (amountCents * config.fees.platformFeePercentage) / 100
    );
    
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
      netCents: Math.max(0, netCents),
    };
  }

  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
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

    if (participantId) metadata.participant_id = participantId;
    if (donorEmail) metadata.donor_email = donorEmail;
    if (donorName) metadata.donor_name = donorName;
    if (message) metadata.message = message.substring(0, 500);

    const paymentIntentParams: any = {
      amount: amountCents,
      currency: STRIPE_CONFIG.currency,
      payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
      capture_method: STRIPE_CONFIG.captureMethod,
      confirmation_method: STRIPE_CONFIG.confirmationMethod,
      metadata,
      description: `Donation to campaign ${campaignId}`,
    };

    if (donorEmail) {
      paymentIntentParams.receipt_email = donorEmail;
    }

    return await stripe.paymentIntents.create(paymentIntentParams, {
      idempotencyKey,
    });
  }

  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  static async createRefund(
    paymentIntentId: string,
    amountCents?: number,
    reason?: string,
    idempotencyKey?: string
  ): Promise<Stripe.Refund> {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    const stripe = getStripe();
    
    const refundParams: any = {
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    };

    if (amountCents) {
      refundParams.amount = amountCents;
    }

    return await stripe.refunds.create(refundParams, {
      idempotencyKey: idempotencyKey || uuidv4(),
    });
  }

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
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }
}