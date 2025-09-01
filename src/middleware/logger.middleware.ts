import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request start
  console.log(`➡️  ${method} ${url} - ${ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Color code based on status
    let statusColor = '';
    if (statusCode >= 200 && statusCode < 300) {
      statusColor = '✅'; // Success
    } else if (statusCode >= 300 && statusCode < 400) {
      statusColor = '🔄'; // Redirect
    } else if (statusCode >= 400 && statusCode < 500) {
      statusColor = '⚠️ '; // Client error
    } else if (statusCode >= 500) {
      statusColor = '❌'; // Server error
    }
    
    console.log(`⬅️  ${statusColor} ${method} ${url} ${statusCode} ${duration}ms`);
  });
  
  next();
}

export function apiLogger(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export function errorLogger(error: Error, context?: string) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR${context ? ` (${context})` : ''}:`, {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
}