import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getEvents } from '../controllers/eventController.js';

const router = express.Router();

// GET /api/v1/events
router.get('/', protect as any, getEvents as any);

export default router;
