import { Router } from 'express';
import { WebhooksController } from '../controllers/webhooks.controller';
import express from 'express';

const router = Router();

// Stripe webhooks need raw body, so we use raw middleware
router.use('/stripe', express.raw({ type: 'application/json' }));

// Webhook endpoints
router.post('/stripe', WebhooksController.handleStripeWebhook);

export { router as webhooksRouter };