import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'candidate' | 'employer' | 'agency' | 'admin';
      };
    }
  }
}

/**
 * Authenticate user via Supabase JWT token
 * Extracts the Bearer token from Authorization header and verifies it
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required. Please log in.' },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token. Please log in again.' },
      });
      return;
    }

    // Get user role from profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email!,
      role: profile?.role || 'candidate',
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Authentication failed.' },
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * Restricts route access to specific user roles
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { message: 'You do not have permission to access this resource.' },
      });
      return;
    }

    next();
  };
};
