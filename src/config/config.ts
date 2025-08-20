import dotenv from 'dotenv';

dotenv.config();

export const config = {
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
    platformFeePercentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '8'), // 6-10% configurable
    stripeFeePercentage: 2.9, // Stripe's standard fee
    stripeFeeFixed: 30, // 30 cents in cents
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
} as const;

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

// Validation for fee percentage
if (config.fees.platformFeePercentage < 6 || config.fees.platformFeePercentage > 10) {
  console.warn('PLATFORM_FEE_PERCENTAGE should be between 6 and 10, using default 8%');
  config.fees.platformFeePercentage = 8;
}

// Log configuration status
console.log('🔧 Configuration loaded:', {
  environment: config.nodeEnv,
  port: config.port,
  stripeConfigured: !!config.stripe.secretKey,
  databaseConfigured: !!config.database.url,
  platformFee: `${config.fees.platformFeePercentage}%`,
});