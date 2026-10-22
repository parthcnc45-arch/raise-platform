import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';

const router = express.Router();

// GET /api/v1/events
router.get('/', protect as any, getEvents as any);

// GET /api/v1/events/:id
router.get('/:id', protect as any, getEventById as any);

// POST /api/v1/events
router.post('/', protect as any, createEvent as any);

// PUT /api/v1/events/:id
router.put('/:id', protect as any, updateEvent as any);

// DELETE /api/v1/events/:id
router.delete('/:id', protect as any, deleteEvent as any);

export default router;
