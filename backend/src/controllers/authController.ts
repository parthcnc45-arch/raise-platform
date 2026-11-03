import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user from Supabase with joined role
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, role_id, is_active, phone, avatar, created_at, updated_at, role:roles!role_id(id, name, code, permissions)')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error during login:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred during login',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create JWT Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables!');
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      jwtSecret as jwt.Secret,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
      }
    );

    // Format safe user object for response (excluding password)
    const safeUser = {
      id: user.id,
      _id: user.id, // For backwards compatibility with frontend
      name: user.name,
      email: user.email,
      role: user.role,
      role_id: user.role_id,
      isActive: user.is_active,
      is_active: user.is_active,
      phone: user.phone || '',
      avatar: user.avatar || '',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: {
        user: safeUser,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message,
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
      error: error.message,
    });
  }
};
