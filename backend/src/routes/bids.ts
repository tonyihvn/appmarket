import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  getProjectBids,
  createBid,
  updateBidStatus,
  getUserBids,
  getAllBids,
  deleteBid,
} from '../controllers/bidController';

const router = Router();

/**
 * @route   GET /api/bids/project/:projectId
 * @desc    Get bids for a project
 * @access  Public
 */
router.get('/project/:projectId', getProjectBids);

/**
 * @route   GET /api/bids/user/my-bids
 * @desc    Get current user's bids
 * @access  Private
 */
router.get('/user/my-bids', protect, getUserBids);

/**
 * @route   POST /api/bids
 * @desc    Create new bid
 * @access  Private
 */
router.post('/', protect, createBid);

/**
 * @route   PUT /api/bids/:id/status
 * @desc    Update bid status
 * @access  Private (Project owner or admin)
 */
router.put('/:id/status', protect, updateBidStatus);

/**
 * @route   GET /api/bids/admin/all
 * @desc    Get all bids (admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', protect, adminOnly, getAllBids);

/**
 * @route   DELETE /api/bids/admin/:bidId
 * @desc    Delete bid (admin only)
 * @access  Private/Admin
 */
router.delete('/admin/:bidId', protect, adminOnly, deleteBid);

export default router;
