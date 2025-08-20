import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface WebhookEvent {
  id?: string;
  source: 'stripe' | 'paypal' | 'other';
  eventType: string;
  payload: any;
  receivedAt: Date;
  processed?: boolean;
  processedAt?: Date;
  error?: string;
}

export class WebhookService {
  /**
   * Log a webhook event
   */
  static async logEvent(event: WebhookEvent): Promise<WebhookEvent> {
    const id = event.id || uuidv4();
    
    try {
      const result = await db.query(
        `INSERT INTO webhook_events (
           id, source, event_type, payload, received_at, processed
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          id,
          event.source,
          event.eventType,
          JSON.stringify(event.payload),
          event.receivedAt,
          event.processed || false,
        ]
      );

      return {
        ...result.rows[0],
        payload: JSON.parse(result.rows[0].payload),
      };
    } catch (error) {
      console.error('Error logging webhook event:', error);
      throw new Error('Failed to log webhook event');
    }
  }

  /**
   * Mark webhook as processed
   */
  static async markAsProcessed(eventId: string): Promise<void> {
    try {
      await db.query(
        `UPDATE webhook_events 
         SET processed = true, processed_at = NOW()
         WHERE id = $1`,
        [eventId]
      );
    } catch (error) {
      console.error('Error marking webhook as processed:', error);
      throw new Error('Failed to mark webhook as processed');
    }
  }

  /**
   * Mark webhook as failed
   */
  static async markAsFailed(eventId: string, error: string): Promise<void> {
    try {
      await db.query(
        `UPDATE webhook_events 
         SET processed = false, error = $2, processed_at = NOW()
         WHERE id = $1`,
        [eventId, error]
      );
    } catch (error) {
      console.error('Error marking webhook as failed:', error);
      throw new Error('Failed to mark webhook as failed');
    }
  }

  /**
   * Get unprocessed webhook events
   */
  static async getUnprocessedEvents(limit = 100): Promise<WebhookEvent[]> {
    try {
      const result = await db.query(
        `SELECT * FROM webhook_events 
         WHERE processed = false 
         ORDER BY received_at ASC
         LIMIT $1`,
        [limit]
      );

      return result.rows.map(row => ({
        ...row,
        payload: JSON.parse(row.payload),
      }));
    } catch (error) {
      console.error('Error getting unprocessed events:', error);
      throw new Error('Failed to get unprocessed events');
    }
  }

  /**
   * Get webhook events by source
   */
  static async getEventsBySource(
    source: string,
    limit = 50,
    offset = 0
  ): Promise<WebhookEvent[]> {
    try {
      const result = await db.query(
        `SELECT * FROM webhook_events 
         WHERE source = $1
         ORDER BY received_at DESC
         LIMIT $2 OFFSET $3`,
        [source, limit, offset]
      );

      return result.rows.map(row => ({
        ...row,
        payload: JSON.parse(row.payload),
      }));
    } catch (error) {
      console.error('Error getting events by source:', error);
      throw new Error('Failed to get events by source');
    }
  }

  /**
   * Get webhook statistics
   */
  static async getWebhookStats(days = 30): Promise<any> {
    try {
      const result = await db.query(
        `SELECT 
           source,
           COUNT(*) as total_events,
           COUNT(CASE WHEN processed = true THEN 1 END) as processed_events,
           COUNT(CASE WHEN processed = false AND error IS NOT NULL THEN 1 END) as failed_events,
           COUNT(CASE WHEN processed = false AND error IS NULL THEN 1 END) as pending_events
         FROM webhook_events 
         WHERE received_at >= NOW() - INTERVAL '${days} days'
         GROUP BY source
         ORDER BY total_events DESC`
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting webhook stats:', error);
      throw new Error('Failed to get webhook statistics');
    }
  }

  /**
   * Retry failed webhook processing
   */
  static async retryFailedEvents(limit = 10): Promise<WebhookEvent[]> {
    try {
      const result = await db.query(
        `SELECT * FROM webhook_events 
         WHERE processed = false AND error IS NOT NULL
         ORDER BY received_at ASC
         LIMIT $1`,
        [limit]
      );

      const events = result.rows.map(row => ({
        ...row,
        payload: JSON.parse(row.payload),
      }));

      // Reset error status for retry
      if (events.length > 0) {
        const eventIds = events.map(e => e.id);
        await db.query(
          `UPDATE webhook_events 
           SET error = NULL, processed_at = NULL
           WHERE id = ANY($1)`,
          [eventIds]
        );
      }

      return events;
    } catch (error) {
      console.error('Error retrying failed events:', error);
      throw new Error('Failed to retry failed events');
    }
  }

  /**
   * Clean up old webhook events
   */
  static async cleanupOldEvents(daysToKeep = 90): Promise<number> {
    try {
      const result = await db.query(
        `DELETE FROM webhook_events 
         WHERE received_at < NOW() - INTERVAL '${daysToKeep} days'
         AND processed = true`,
      );

      return result.rowCount || 0;
    } catch (error) {
      console.error('Error cleaning up old events:', error);
      throw new Error('Failed to cleanup old events');
    }
  }
}