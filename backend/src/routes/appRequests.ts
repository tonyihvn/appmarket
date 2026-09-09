import express from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  createAppRequest,
  getPublisherAppRequests,
  getAppRequests,
  updateAppRequestStatus,
  getUserAppRequests,
  deleteAppRequest,
  replyToAppRequest,
  getAllAppRequests,
  deleteAppRequestAdmin,
} from '../controllers/appRequestController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create app request
router.post('/', createAppRequest);

// Get requests for user (requester)
router.get('/user/my-requests', getUserAppRequests);

// Get all requests for publisher
router.get('/publisher/all', getPublisherAppRequests);

// Get requests for specific app
router.get('/app/:appId', getAppRequests);

// Update request status
router.put('/:requestId/status', updateAppRequestStatus);

// Reply to request
router.put('/:requestId/reply', replyToAppRequest);

// Delete request
router.delete('/:requestId', deleteAppRequest);

// Admin routes
/**
 * @route   GET /api/app-requests/admin/all
 * @desc    Get all app requests (admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', adminOnly, getAllAppRequests);

/**
 * @route   DELETE /api/app-requests/admin/:requestId
 * @desc    Delete app request (admin only)
 * @access  Private/Admin
 */
router.delete('/admin/:requestId', adminOnly, deleteAppRequestAdmin);

export default router;
