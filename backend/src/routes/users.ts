import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  getUserProfile,
  updateUserProfile,
  createCompanyProfile,
  createFreelancerProfile,
  getCompanyProfile,
  getFreelancerProfile,
  getUsersByType,
  getAllUsers,
  deleteUser,
} from '../controllers/userController';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route   POST /api/users/company-profile
 * @desc    Create/update company profile
 * @access  Private
 */
router.post('/company-profile', protect, createCompanyProfile);

/**
 * @route   POST /api/users/freelancer-profile
 * @desc    Create/update freelancer profile
 * @access  Private
 */
router.post('/freelancer-profile', protect, createFreelancerProfile);

/**
 * @route   GET /api/users/company/:userId
 * @desc    Get company profile by user ID
 * @access  Public
 */
router.get('/company/:userId', getCompanyProfile);

/**
 * @route   GET /api/users/freelancer/:userId
 * @desc    Get freelancer profile by user ID
 * @access  Public
 */
router.get('/freelancer/:userId', getFreelancerProfile);

/**
 * @route   GET /api/users/type/:type
 * @desc    Get users by type (AppBuilder, RegularUser)
 * @access  Public
 */
router.get('/type/:type', getUsersByType);

/**
 * @route   GET /api/users/admin/all
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', protect, adminOnly, getAllUsers);

/**
 * @route   DELETE /api/users/admin/:userId
 * @desc    Delete user (admin only)
 * @access  Private/Admin
 */
router.delete('/admin/:userId', protect, adminOnly, deleteUser);

export default router;
