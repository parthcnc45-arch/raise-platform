import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { login, logout } from '../controllers/authController.js';


const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', login);

// POST /api/v1/auth/logout
router.post('/logout', protect as any, logout as any);

export default router;
