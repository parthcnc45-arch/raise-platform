import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

    // Check if user exists and select password (as it might be excluded by default depending on schema config, though in our schema it's not excluded from DB, just toJSON)
    const user = await User.findOne({ email }).populate('role');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
       return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create JWT Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("JWT_SECRET is not defined in environment variables!");
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role
      },
      jwtSecret as jwt.Secret,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
      }
    );

    // Remove password from output (handled by toJSON transform in schema, but good to be explicit or just rely on it)
    
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: {
        user
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // With localStorage JWT, logout is primarily handled on the client side.
    // If you were using HttpOnly cookies, you would clear the cookie here.
    // Example: res.clearCookie('token');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
      error: error.message
    });
  }
};
