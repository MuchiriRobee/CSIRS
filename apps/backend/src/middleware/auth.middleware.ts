import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/index.js';
import { UserRole } from '@csirs/shared/types';
import { ApiError } from '@csirs/shared/types';
import { JwtPayload } from '@csirs/shared/types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    const error: ApiError = { success: false, message: 'Access token required' };
    return res.status(401).json(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    const error: ApiError = { success: false, message: 'Invalid or expired token' };
    return res.status(403).json(error);
  }
};

export const requireRole = (allowedRoles: UserRole | UserRole[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error: ApiError = { success: false, message: 'Authentication required' };
      return res.status(401).json(error);
    }

    if (!roles.includes(req.user.role)) {
      const error: ApiError = { success: false, message: 'Insufficient permissions' };
      return res.status(403).json(error);
    }

    next();
  };
};

// Convenience guards
export const requireAdmin = requireRole('ADMIN');
export const requireReporterOrAdmin = requireRole(['REPORTER', 'ADMIN']);