import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getServices,
  createService,
  getService,
  updateService,
  getUserServices,
} from '../controllers/serviceController';

const router = Router();

/**
 * @route   GET /api/services
 * @desc    Get all services
 * @access  Public
 */
router.get('/', getServices);

/**
 * @route   GET /api/services/:id
 * @desc    Get single service
 * @access  Public
 */
router.get('/:id', getService);

/**
 * @route   POST /api/services
 * @desc    Create service
 * @access  Private
 */
router.post('/', protect, createService);

/**
 * @route   PUT /api/services/:id
 * @desc    Update service
 * @access  Private
 */
router.put('/:id', protect, updateService);

/**
 * @route   GET /api/services/user/my-services
 * @desc    Get current user's services
 * @access  Private
 */
router.get('/user/my-services', protect, getUserServices);

export default router;
