import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateCampaignParams {
  id?: string;
  organizationId: string;
  title: string;
  description: string;
  goalCents: number;
  startDate: Date;
  endDate: Date;
  heroImageUrl?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  allowAnonymousDonations?: boolean;
  allowRecurringDonations?: boolean;
  minimumDonationCents?: number;
  maximumDonationCents?: number;
}

export interface UpdateCampaignParams {
  title?: string;
  description?: string;
  goalCents?: number;
  startDate?: Date;
  endDate?: Date;
  heroImageUrl?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  allowAnonymousDonations?: boolean;
  allowRecurringDonations?: boolean;
  minimumDonationCents?: number;
  maximumDonationCents?: number;
}

export class CampaignService {
  /**
   * Create a new campaign
   */
  static async create(params: CreateCampaignParams) {
    const {
      id = uuidv4(),
      organizationId,
      title,
      description,
      goalCents,
      startDate,
      endDate,
      heroImageUrl,
      status = 'draft',
      allowAnonymousDonations = true,
      allowRecurringDonations = false,
      minimumDonationCents = 100, // $1.00
      maximumDonationCents = null,
    } = params;

    try {
      const result = await db.query(
        `INSERT INTO campaigns (
           id, organization_id, title, description, goal_cents, 
           start_date, end_date, hero_image_url, status,
           allow_anonymous_donations, allow_recurring_donations,
           minimum_donation_cents, maximum_donation_cents
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          id,
          organizationId,
          title,
          description,
          goalCents,
          startDate,
          endDate,
          heroImageUrl,
          status,
          allowAnonymousDonations,
          allowRecurringDonations,
          minimumDonationCents,
          maximumDonationCents,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }

  /**
   * Find campaign by ID
   */
  static async findById(id: string) {
    try {
      const result = await db.query(
        `SELECT c.*, 
                o.name as organization_name,
                COUNT(DISTINCT p.id) as participant_count,
                COUNT(DISTINCT d.id) as donation_count,
                COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE 0 END), 0) as raised_cents
         FROM campaigns c
         LEFT JOIN organizations o ON c.organization_id = o.id
         LEFT JOIN participants p ON c.id = p.campaign_id
         LEFT JOIN donations d ON c.id = d.campaign_id
         WHERE c.id = $1
         GROUP BY c.id, o.name`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding campaign:', error);
      throw new Error('Failed to find campaign');
    }
  }

  /**
   * Update campaign
   */
  static async update(id: string, params: UpdateCampaignParams) {
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

    try {
      const result = await db.query(
        `UPDATE campaigns 
         SET ${fields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw new Error('Failed to update campaign');
    }
  }

  /**
   * Get campaigns by organization
   */
  static async findByOrganizationId(organizationId: string, limit = 50, offset = 0) {
    try {
      const result = await db.query(
        `SELECT c.*, 
                COUNT(DISTINCT p.id) as participant_count,
                COUNT(DISTINCT d.id) as donation_count,
                COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE 0 END), 0) as raised_cents
         FROM campaigns c
         LEFT JOIN participants p ON c.id = p.campaign_id
         LEFT JOIN donations d ON c.id = d.campaign_id
         WHERE c.organization_id = $1
         GROUP BY c.id
         ORDER BY c.created_at DESC
         LIMIT $2 OFFSET $3`,
        [organizationId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error finding campaigns by organization:', error);
      throw new Error('Failed to find campaigns');
    }
  }

  /**
   * Get active campaigns
   */
  static async getActiveCampaigns(limit = 20, offset = 0) {
    try {
      const result = await db.query(
        `SELECT c.*, 
                o.name as organization_name,
                COUNT(DISTINCT p.id) as participant_count,
                COUNT(DISTINCT d.id) as donation_count,
                COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE 0 END), 0) as raised_cents
         FROM campaigns c
         LEFT JOIN organizations o ON c.organization_id = o.id
         LEFT JOIN participants p ON c.id = p.campaign_id
         LEFT JOIN donations d ON c.id = d.campaign_id
         WHERE c.status = 'active' 
           AND c.start_date <= NOW() 
           AND c.end_date >= NOW()
         GROUP BY c.id, o.name
         ORDER BY c.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting active campaigns:', error);
      throw new Error('Failed to get active campaigns');
    }
  }

  /**
   * Search campaigns
   */
  static async searchCampaigns(searchTerm: string, limit = 20, offset = 0) {
    try {
      const result = await db.query(
        `SELECT c.*, 
                o.name as organization_name,
                COUNT(DISTINCT p.id) as participant_count,
                COUNT(DISTINCT d.id) as donation_count,
                COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE 0 END), 0) as raised_cents
         FROM campaigns c
         LEFT JOIN organizations o ON c.organization_id = o.id
         LEFT JOIN participants p ON c.id = p.campaign_id
         LEFT JOIN donations d ON c.id = d.campaign_id
         WHERE (c.title ILIKE $1 OR c.description ILIKE $1 OR o.name ILIKE $1)
           AND c.status = 'active'
         GROUP BY c.id, o.name
         ORDER BY raised_cents DESC, c.created_at DESC
         LIMIT $2 OFFSET $3`,
        [`%${searchTerm}%`, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error searching campaigns:', error);
      throw new Error('Failed to search campaigns');
    }
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(id: string) {
    try {
      const result = await db.query(
        `SELECT 
           c.goal_cents,
           COUNT(DISTINCT d.id) as total_donations,
           COUNT(DISTINCT d.donor_id) as unique_donors,
           COUNT(DISTINCT p.id) as total_participants,
           COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE 0 END), 0) as total_raised_cents,
           COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.net_cents ELSE 0 END), 0) as total_net_cents,
           COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.fee_cents ELSE 0 END), 0) as total_fee_cents,
           COALESCE(AVG(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE NULL END), 0) as avg_donation_cents,
           COALESCE(MAX(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE NULL END), 0) as max_donation_cents,
           COALESCE(MIN(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE NULL END), 0) as min_donation_cents
         FROM campaigns c
         LEFT JOIN donations d ON c.id = d.campaign_id
         LEFT JOIN participants p ON c.id = p.campaign_id
         WHERE c.id = $1
         GROUP BY c.id, c.goal_cents`,
        [id]
      );

      const stats = result.rows[0];
      
      if (stats) {
        // Calculate progress percentage
        stats.progress_percentage = stats.goal_cents > 0 
          ? Math.round((stats.total_raised_cents / stats.goal_cents) * 100)
          : 0;
      }

      return stats;
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      throw new Error('Failed to get campaign statistics');
    }
  }

  /**
   * Delete campaign (soft delete)
   */
  static async delete(id: string) {
    try {
      const result = await db.query(
        `UPDATE campaigns 
         SET status = 'deleted', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw new Error('Failed to delete campaign');
    }
  }

  /**
   * Get top performing campaigns
   */
  static async getTopCampaigns(limit = 10, days = 30) {
    try {
      const result = await db.query(
        `SELECT c.*, 
                o.name as organization_name,
                COUNT(DISTINCT d.id) as donation_count,
                COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE 0 END), 0) as raised_cents,
                ROUND((COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount_cents ELSE 0 END), 0) * 100.0 / c.goal_cents), 2) as progress_percentage
         FROM campaigns c
         LEFT JOIN organizations o ON c.organization_id = o.id
         LEFT JOIN donations d ON c.id = d.campaign_id AND d.created_at >= NOW() - INTERVAL '${days} days'
         WHERE c.status = 'active'
         GROUP BY c.id, o.name
         ORDER BY raised_cents DESC, progress_percentage DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting top campaigns:', error);
      throw new Error('Failed to get top campaigns');
    }
  }
}