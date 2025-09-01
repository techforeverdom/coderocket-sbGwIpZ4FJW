import { Pool } from 'pg';
import { config } from './config';

// Create PostgreSQL connection pool
export const db = new Pool({
  connectionString: config.database.url,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
db.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

db.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Handle connection issues gracefully
db.on('acquire', () => {
  console.log('Database connection acquired from pool');
});

db.on('remove', () => {
  console.log('Database connection removed from pool');
});

// Test the connection on startup
async function testConnection() {
  try {
    const client = await db.connect();
    console.log('✅ Database connection test successful');
    client.release();
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    // Don't exit in development, but warn
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
}

// Test connection on startup
testConnection();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await db.end();
});

process.on('SIGTERM', async () => {
  console.log('Closing database connections...');
  await db.end();
});

// Export query helper for easier testing
export const query = (text: string, params?: any[]) => db.query(text, params);

// Export transaction helper
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};