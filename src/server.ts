import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';
import { donationsRouter } from './routes/donations.routes';
import { webhooksRouter } from './routes/webhooks.routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'idempotency-key', 'stripe-signature'],
}));

// Request logging
app.use(requestLogger);

// Body parsing middleware (JSON for most routes)
// Note: Webhooks need raw body, so they're processed first
app.use('/webhooks', webhooksRouter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      stripe: !!config.stripe.secretKey,
      database: !!config.database.url,
    },
  });
});

// API routes
app.use('/api/donations', donationsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'BFG Fundraising API',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      health: '/health',
      donations: '/api/donations',
      webhooks: '/webhooks',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/donations/checkout',
      'POST /api/donations/confirm',
      'GET /api/donations/:id',
      'POST /api/donations/:id/refund',
      'POST /webhooks/stripe',
    ],
  });
});

// Global error handler
app.use(errorHandler);

const PORT = Number(config.port) || 3000;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BFG Fundraising API running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
  
  // Log service status
  console.log('🔧 Services status:');
  console.log(`   💳 Stripe: ${config.stripe.secretKey ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log(`   🗄️  Database: ${config.database.url ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   💰 Platform fee: ${config.fees.platformFeePercentage}%`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { app };