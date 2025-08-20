import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/bfg_fundraising',
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  
  fees: {
    platformFeePercentage: 8,
    stripeFeePercentage: 2.9,
    stripeFeeFixed: 30,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

// Validation for production environment
if (config.nodeEnv === 'production') {
  if (!config.stripe.secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required in production');
  }

  if (!config.stripe.webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required in production');
  }

  if (config.jwt.secret === 'dev-jwt-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production');
  }
}

console.log('🔧 Configuration loaded:', {
  environment: config.nodeEnv,
  port: config.port,
  stripeConfigured: !!config.stripe.secretKey,
  databaseConfigured: !!config.database.url,
  platformFee: `${config.fees.platformFeePercentage}%`,
});

export { config };