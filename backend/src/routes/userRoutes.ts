import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUsers } from '../controllers/userController.js';

const router = express.Router();

// GET /api/v1/users
router.get('/', protect as any, getUsers as any);

export default router;
