import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function refreshToken(token: string): string {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, { ignoreExpiration: true }) as any;
    
    // Remove the original expiration and issued at claims
    delete decoded.exp;
    delete decoded.iat;
    
    // Generate new token with same payload
    return generateToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
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
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      req.user = decoded;

      // Check roles if specified
      if (roles && !roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      // Check organization membership if required
      if (reqOrg && !req.user.organizationId) {
        res.status(403).json({ error: 'Organization membership required' });
        return;
      }

      // Check same organization if required
      if (reqSameOrg) {
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