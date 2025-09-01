import { Request, Response, NextFunction } from 'express';
import { errorLogger } from './logger.middleware';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log error details
  errorLogger(error, `${req.method} ${req.url}`);

  // Don't send stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Send error response
  res.status(statusCode).json({
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    ...(isDevelopment && {
      stack: error.stack,
      details: error,
    }),
  });
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Common error types
export class ValidationError extends Error {
  statusCode = 400;
  isOperational = true;
  
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  isOperational = true;
  
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  isOperational = true;
  
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  isOperational = true;
  
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ServiceUnavailableError extends Error {
  statusCode = 503;
  isOperational = true;
  
  constructor(message: string = 'Service Unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}