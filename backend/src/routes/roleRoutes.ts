import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getRoles, getRoleById } from '../controllers/roleController.js';

const router = express.Router();

// GET /api/v1/roles - List all roles (with optional search and pagination)
router.get('/', protect as any, getRoles as any);

// GET /api/v1/roles/:id - Get single role by ID
router.get('/:id', protect as any, getRoleById as any);

export default router;

