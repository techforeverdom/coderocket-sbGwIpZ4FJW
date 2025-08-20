import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    // Invalid token, but continue without authentication
    console.warn('Invalid token provided in optional auth:', error);
    next();
  }
}

export function requireOrganization(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!req.user.organizationId) {
    res.status(403).json({ error: 'Organization membership required' });
    return;
  }

  next();
}

export function requireSameOrganization(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const { organizationId } = req.params;
  
  if (!organizationId) {
    res.status(400).json({ error: 'Organization ID required in request' });
    return;
  }

  if (req.user.organizationId !== organizationId) {
    res.status(403).json({ error: 'Access denied to this organization' });
    return;
  }

  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Super admin access required' });
    return;
  }

  next();
}

export function generateToken(payload: {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}): string {
  try {
    const secret = config.jwt.secret;
    const expiresIn = config.jwt.expiresIn;
    
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

export function verifyToken(token: string): any {
  try {
    const secret = config.jwt.secret;
    
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function refreshToken(token: string): string {
  try {
    const secret = config.jwt.secret;
    
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    const decoded = jwt.verify(token, secret, { ignoreExpiration: true }) as any;
    
    // Remove the original expiration and issued at claims
    const { exp, iat, ...payload } = decoded;
    
    // Generate new token with same payload
    return generateToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    });
  } catch (error) {
    throw new Error('Invalid token for refresh');
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

export function createAuthMiddleware(options: {
  required?: boolean;
  roles?: string[];
  requireOrganization?: boolean;
  requireSameOrganization?: boolean;
}) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const { required = true, roles, requireOrganization: reqOrg, requireSameOrganization: reqSameOrg } = options;

    // Extract token
    const token = extractTokenFromHeader(req.headers['authorization']);

    if (!token) {
      if (required) {
        res.status(401).json({ error: 'Access token required' });
        return;
      } else {
        next();
        return;
      }
    }

    try {
      const secret = config.jwt.secret;
      
      if (!secret) {
        res.status(500).json({ error: 'JWT configuration error' });
        return;
      }

      const decoded = jwt.verify(token, secret) as any;
      req.user = decoded;

      // Check roles if specified
      if (roles && req.user && !roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      // Check organization membership if required
      if (reqOrg && req.user && !req.user.organizationId) {
        res.status(403).json({ error: 'Organization membership required' });
        return;
      }

      // Check same organization if required
      if (reqSameOrg && req.user) {
        const { organizationId } = req.params;
        if (!organizationId) {
          res.status(400).json({ error: 'Organization ID required in request' });
          return;
        }
        if (req.user.organizationId !== organizationId) {
          res.status(403).json({ error: 'Access denied to this organization' });
          return;
        }
      }

      next();
    } catch (error) {
      if (required) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
      } else {
        next();
        return;
      }
    }
  };
}

// Utility function to decode token without verification (for debugging)
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}

// Validate token format
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  return parts.length === 3;
}

// Create API key authentication middleware (for service-to-service communication)
export function authenticateApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({ error: 'API key required' });
    return;
  }
  
  // In a real implementation, you would validate the API key against a database
  // For now, we'll use a simple environment variable check
  const validApiKey = process.env.API_KEY;
  
  if (!validApiKey || apiKey !== validApiKey) {
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }
  
  next();
}

// Rate limiting helper (to be used with express-rate-limit)
export function createRateLimitKeyGenerator() {
  return (req: AuthRequest): string => {
    // Use user ID if authenticated, otherwise use IP
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    
    return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
  };
}