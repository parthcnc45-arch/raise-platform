import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

      // Get user from Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role_id, is_active, phone, avatar, created_at, updated_at, role:roles!role_id(id, name, code)')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        return;
      }

      // Backward-compatible properties: _id, isActive, role
      req.user = {
        ...user,
        _id: user.id,
        isActive: user.is_active,
        role: user.role,
      };

      next();
      return;
    } catch (error) {
      console.error('Not authorized, token failed', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Role-based access control: allows only users whose role code is in the given list.
// Must run after `protect`.
export const authorize = (...allowedRoleCodes: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const role = Array.isArray(req.user?.role) ? req.user.role[0] : req.user?.role;
    const roleCode = typeof role === 'string' ? role : role?.code;

    if (!roleCode || !allowedRoleCodes.includes(roleCode)) {
      res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
      return;
    }

    next();
  };
};
