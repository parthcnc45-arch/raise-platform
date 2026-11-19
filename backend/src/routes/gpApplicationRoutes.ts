import express from 'express';
import {
  createGpApplication,
  getGpApplications,
  deleteGpApplication,
  updateGpApplication,
  getGpApplicationByMagicToken,
  resendMagicLink,
  getGpSession,
  checkGpSessionForToken,
  logoutGpSession,
  getGpApplicationDetails,
} from '../controllers/gpApplicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { requireGpSession } from '../middleware/gpSessionMiddleware.js';
import { magicLinkLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes (GP portal)
router.post('/view/:token', magicLinkLimiter, getGpApplicationByMagicToken as any);

// GP session routes (httpOnly cookie issued after magic link verification)
router.get('/session', requireGpSession as any, getGpSession as any);
router.post('/session/check', requireGpSession as any, checkGpSessionForToken as any);
router.post('/session/logout', logoutGpSession as any);

// Admin routes: authenticated + admin / super_admin only
router.use(protect as any);
router.use(authorize('super_admin', 'admin') as any);

router.post('/', createGpApplication as any);
router.get('/', getGpApplications as any);
router.get('/:id/details', getGpApplicationDetails as any);
router.delete('/:id', deleteGpApplication as any);
router.put('/:id', updateGpApplication as any);
router.post('/:id/resend-magic-link', resendMagicLink as any);

export default router;
