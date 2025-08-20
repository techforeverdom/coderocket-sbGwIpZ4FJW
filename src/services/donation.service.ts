import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateDonationParams {
  id?: string;
  campaignId: string;
  participantId?: string;
  amountCents: number;
  feeCents: number;
  netCents: number;
  stripePaymentIntentId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  message?: string;
  donorEmail?: string;
  donorName?: string;
}

export interface UpdateDonationParams {
  status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
  donorId?: string;
  stripePaymentIntentId?: string;
  feeCents?: number;
  netCents?: number;
}

export class DonationService {
  /**
   * Create a new donation record
   */
  static async create(params: CreateDonationParams) {
    const {
      id = uuidv4(),
      campaignId,
      participantId,
      amountCents,
      feeCents,
      netCents,
      stripePaymentIntentId,
      status,
      message,
      donorEmail,
      donorName,
    } = params;

    // Create temporary donor if email provided
    let donorId: string | null = null;
    if (donorEmail) {
      const donor = await db.query(
        `INSERT INTO donors (email, first_name, last_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET
           first_name = COALESCE(EXCLUDED.first_name, donors.first_name),
           last_name = COALESCE(EXCLUDED.last_name, donors.last_name),
           updated_at = NOW()
         RETURNING id`,
        [
          donorEmail,
          donorName?.split(' ')[0] || 'Anonymous',
          donorName?.split(' ').slice(1).join(' ') || 'Donor',
        ]
      );
      donorId = donor.rows[0].id;
    }

    const result = await db.query(
      `INSERT INTO donations (
         id, campaign_id, participant_id, donor_id, amount_cents, 
         fee_cents, net_cents, stripe_payment_intent_id, status, message
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        campaignId,
        participantId,
        donorId,
        amountCents,
        feeCents,
        netCents,
        stripePaymentIntentId,
        status,
        message,
      ]
    );

    return result.rows[0];
  }

  /**
   * Find donation by ID
   */
  static async findById(id: string) {
    const result = await db.query(
      `SELECT d.*, 
              don.email as donor_email,
              don.first_name as donor_first_name,
              don.last_name as donor_last_name,
              c.title as campaign_title,
              p.share_link_slug as participant_slug
       FROM donations d
       LEFT JOIN donors don ON d.donor_id = don.id
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN participants p ON d.participant_id = p.id
       WHERE d.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find donation by Stripe PaymentIntent ID
   */
  static async findByStripePaymentIntentId(paymentIntentId: string) {
    const result = await db.query(
      'SELECT * FROM donations WHERE stripe_payment_intent_id = $1',
      [paymentIntentId]
    );

    return result.rows[0] || null;
  }

  /**
   * Update donation
   */
  static async update(id: string, params: UpdateDonationParams) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at field
    fields.push(`updated_at = NOW()`);
    
    // Add id parameter
    values.push(id);

    const result = await db.query(
      `UPDATE donations 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Update donation status
   */
  static async updateStatus(id: string, status: 'pending' | 'succeeded' | 'failed' | 'refunded') {
    const result = await db.query(
      `UPDATE donations 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  /**
   * Get donations for a campaign
   */
  static async findByCampaignId(campaignId: string, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT d.*, 
              don.email as donor_email,
              don.first_name as donor_first_name,
              don.last_name as donor_last_name,
              p.share_link_slug as participant_slug
       FROM donations d
       LEFT JOIN donors don ON d.donor_id = don.id
       LEFT JOIN participants p ON d.participant_id = p.id
       WHERE d.campaign_id = $1
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [campaignId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get donations for a participant
   */
  static async findByParticipantId(participantId: string, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT d.*, 
              don.email as donor_email,
              don.first_name as donor_first_name,
              don.last_name as donor_last_name
       FROM donations d
       LEFT JOIN donors don ON d.donor_id = don.id
       WHERE d.participant_id = $1
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [participantId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get campaign donation statistics
   */
  static async getCampaignStats(campaignId: string) {
    const result = await db.query(
      `SELECT 
         COUNT(*) as total_donations,
         COUNT(DISTINCT donor_id) as unique_donors,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0) as total_raised_cents,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN net_cents ELSE 0 END), 0) as total_net_cents,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN fee_cents ELSE 0 END), 0) as total_fee_cents,
         COALESCE(AVG(CASE WHEN status = 'succeeded' THEN amount_cents ELSE NULL END), 0) as avg_donation_cents
       FROM donations 
       WHERE campaign_id = $1`,
      [campaignId]
    );

    return result.rows[0];
  }

  /**
   * Get donations by donor
   */
  static async findByDonorId(donorId: string, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT d.*, 
              c.title as campaign_title,
              c.hero_image_url,
              p.share_link_slug as participant_slug
       FROM donations d
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN participants p ON d.participant_id = p.id
       WHERE d.donor_id = $1 AND d.status = 'succeeded'
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [donorId, limit, offset]
    );

    return result.rows;
  }

  /**
   * Get donation statistics for a participant
   */
  static async getParticipantStats(participantId: string) {
    const result = await db.query(
      `SELECT 
         COUNT(*) as total_donations,
         COUNT(DISTINCT donor_id) as unique_donors,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0) as total_raised_cents,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN net_cents ELSE 0 END), 0) as total_net_cents,
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN fee_cents ELSE 0 END), 0) as total_fee_cents,
         COALESCE(AVG(CASE WHEN status = 'succeeded' THEN amount_cents ELSE NULL END), 0) as avg_donation_cents
       FROM donations 
       WHERE participant_id = $1`,
      [participantId]
    );

    return result.rows[0];
  }

  /**
   * Get recent donations across all campaigns
   */
  static async getRecentDonations(limit = 20, offset = 0) {
    const result = await db.query(
      `SELECT d.*, 
              don.email as donor_email,
              don.first_name as donor_first_name,
              don.last_name as donor_last_name,
              c.title as campaign_title,
              p.share_link_slug as participant_slug
       FROM donations d
       LEFT JOIN donors don ON d.donor_id = don.id
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN participants p ON d.participant_id = p.id
       WHERE d.status = 'succeeded'
       ORDER BY d.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  /**
   * Get donation totals by date range
   */
  static async getDonationsByDateRange(
    startDate: Date,
    endDate: Date,
    campaignId?: string
  ) {
    let query = `
      SELECT 
        DATE(created_at) as donation_date,
        COUNT(*) as donation_count,
        SUM(amount_cents) as total_amount_cents,
        SUM(net_cents) as total_net_cents,
        SUM(fee_cents) as total_fee_cents
      FROM donations 
      WHERE status = 'succeeded' 
        AND created_at >= $1 
        AND created_at <= $2
    `;
    
    const params: any[] = [startDate, endDate];

    if (campaignId) {
      query += ` AND campaign_id = $3`;
      params.push(campaignId);
    }

    query += ` GROUP BY DATE(created_at) ORDER BY donation_date DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Search donations by donor email or name
   */
  static async searchDonations(
    searchTerm: string,
    limit = 50,
    offset = 0,
    campaignId?: string
  ) {
    let query = `
      SELECT d.*, 
             don.email as donor_email,
             don.first_name as donor_first_name,
             don.last_name as donor_last_name,
             c.title as campaign_title,
             p.share_link_slug as participant_slug
      FROM donations d
      LEFT JOIN donors don ON d.donor_id = don.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN participants p ON d.participant_id = p.id
      WHERE (
        don.email ILIKE $1 OR 
        don.first_name ILIKE $1 OR 
        don.last_name ILIKE $1 OR
        CONCAT(don.first_name, ' ', don.last_name) ILIKE $1
      )
    `;

    const params: any[] = [`%${searchTerm}%`];
    let paramIndex = 2;

    if (campaignId) {
      query += ` AND d.campaign_id = $${paramIndex}`;
      params.push(campaignId);
      paramIndex++;
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get top donors for a campaign
   */
  static async getTopDonors(campaignId: string, limit = 10) {
    const result = await db.query(
      `SELECT 
         don.id,
         don.email,
         don.first_name,
         don.last_name,
         COUNT(d.id) as donation_count,
         SUM(d.amount_cents) as total_donated_cents,
         MAX(d.created_at) as last_donation_date
       FROM donations d
       JOIN donors don ON d.donor_id = don.id
       WHERE d.campaign_id = $1 AND d.status = 'succeeded'
       GROUP BY don.id, don.email, don.first_name, don.last_name
       ORDER BY total_donated_cents DESC
       LIMIT $2`,
      [campaignId, limit]
    );

    return result.rows;
  }

  /**
   * Bulk update donation statuses (for admin operations)
   */
  static async bulkUpdateStatus(
    donationIds: string[],
    status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  ) {
    if (donationIds.length === 0) {
      return [];
    }

    const placeholders = donationIds.map((_, index) => `$${index + 2}`).join(',');
    
    const result = await db.query(
      `UPDATE donations 
       SET status = $1, updated_at = NOW()
       WHERE id IN (${placeholders})
       RETURNING *`,
      [status, ...donationIds]
    );

    return result.rows;
  }
}