import { Router } from 'express';
import { DonationsController } from '../controllers/donations.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/checkout', DonationsController.createCheckout);
router.post('/confirm', DonationsController.confirmPayment);
router.get('/fees/calculate', DonationsController.calculateFees);

// Protected routes
router.get('/:id', authenticateToken, DonationsController.getDonation);
router.post('/:id/refund', authenticateToken, DonationsController.createRefund);
router.get('/campaign/:campaignId', authenticateToken, DonationsController.getCampaignDonations);

export { router as donationsRouter };