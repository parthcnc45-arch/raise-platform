import express from 'express';
import { createGpApplication, getGpApplications, deleteGpApplication, updateGpApplication, getGpApplicationByMagicToken, resendMagicLink } from '../controllers/gpApplicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/view/:token', getGpApplicationByMagicToken as any);

// Protected routes
router.use(protect as any);

router.post('/', createGpApplication as any);
router.get('/', getGpApplications as any);
router.delete('/:id', deleteGpApplication as any);
router.put('/:id', updateGpApplication as any);
router.post('/:id/resend-magic-link', resendMagicLink as any);

export default router;
