import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  getAllAppsAdmin,
  getApps,
  getApp,
  createApp,
  updateApp,
  deleteApp,
  getAppsByCategory,
  getFeaturedApps,
  searchApps,
  getUserApps,
} from '../controllers/appController';

const router = Router();

/**
 * @route   GET /api/apps
 * @desc    Get all apps with filtering
 * @access  Public
 */
router.get('/', getApps);

/**
 * @route   GET /api/apps/admin/all
 * @desc    Get all apps, including unpublished apps (admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', protect, adminOnly, getAllAppsAdmin);

/**
 * @route   GET /api/apps/featured
 * @desc    Get featured apps
 * @access  Public
 */
router.get('/featured', getFeaturedApps);

/**
 * @route   GET /api/apps/search
 * @desc    Search apps
 * @access  Public
 */
router.get('/search', searchApps);

/**
 * @route   GET /api/apps/category/:categorySlug
 * @desc    Get apps by category
 * @access  Public
 */
router.get('/category/:categorySlug', getAppsByCategory);

/**
 * @route   GET /api/apps/user/my-apps
 * @desc    Get current user's apps
 * @access  Private
 */
router.get('/user/my-apps', protect, getUserApps);

/**
 * @route   GET /api/apps/:id
 * @desc    Get single app
 * @access  Public
 */
router.get('/:id', getApp);

/**
 * @route   POST /api/apps
 * @desc    Create new app
 * @access  Private
 */
router.post('/', protect, createApp);

/**
 * @route   PUT /api/apps/:id
 * @desc    Update app
 * @access  Private
 */
router.put('/:id', protect, updateApp);

/**
 * @route   DELETE /api/apps/:id
 * @desc    Delete app
 * @access  Private
 */
router.delete('/:id', protect, deleteApp);

export default router;
