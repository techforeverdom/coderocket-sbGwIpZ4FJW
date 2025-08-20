import { Router } from 'express';
import { DonationsController } from '../controllers/donations.controller';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/checkout', DonationsController.createCheckout);
router.post('/confirm', DonationsController.confirmPayment);
router.get('/fees/calculate', DonationsController.calculateFees);

// Optional auth routes
router.get('/:id', optionalAuth, DonationsController.getDonation);

// Protected routes
router.post('/:id/refund', authenticateToken, requireRole(['admin', 'super_admin']), DonationsController.createRefund);
router.get('/campaign/:campaignId', authenticateToken, DonationsController.getCampaignDonations);

export { router as donationsRouter };