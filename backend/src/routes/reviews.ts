import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  getAppReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  deleteReviewAdmin,
} from '../controllers/reviewController';

const router = Router();

/**
 * @route   GET /api/reviews/:appId
 * @desc    Get reviews for an app
 * @access  Public
 */
router.get('/:appId', getAppReviews);

/**
 * @route   POST /api/reviews
 * @desc    Create new review
 * @access  Private
 */
router.post('/', protect, createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private
 */
router.put('/:id', protect, updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private
 */
router.delete('/:id', protect, deleteReview);

/**
 * @route   GET /api/reviews/admin/all
 * @desc    Get all reviews (admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', protect, adminOnly, getAllReviews);

/**
 * @route   DELETE /api/reviews/admin/:reviewId
 * @desc    Delete review (admin only)
 * @access  Private/Admin
 */
router.delete('/admin/:reviewId', protect, adminOnly, deleteReviewAdmin);

export default router;
