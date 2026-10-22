import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

// GET /api/v1/users - List users with pagination and search
router.get('/', protect as any, getUsers as any);

// GET /api/v1/users/:id - Get single user by ID
router.get('/:id', protect as any, getUserById as any);

// POST /api/v1/users - Create new user
router.post('/', protect as any, createUser as any);

// PUT /api/v1/users/:id - Update existing user
router.put('/:id', protect as any, updateUser as any);

// DELETE /api/v1/users/:id - Delete user
router.delete('/:id', protect as any, deleteUser as any);

export default router;
