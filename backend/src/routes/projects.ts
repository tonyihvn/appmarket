import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  getProjectRequests,
  createProjectRequest,
  getProjectRequest,
  updateProjectStatus,
  getUserProjects,
  getAllProjects,
  deleteProject,
} from '../controllers/projectController';

const router = Router();

/**
 * @route   GET /api/projects
 * @desc    Get all project requests
 * @access  Public
 */
router.get('/', getProjectRequests);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project request
 * @access  Public
 */
router.get('/:id', getProjectRequest);

/**
 * @route   POST /api/projects
 * @desc    Create project request
 * @access  Private
 */
router.post('/', protect, createProjectRequest);

/**
 * @route   PUT /api/projects/:id/status
 * @desc    Update project status
 * @access  Private (Client or admin)
 */
router.put('/:id/status', protect, updateProjectStatus);

/**
 * @route   GET /api/projects/user/my-projects
 * @desc    Get current user's projects
 * @access  Private
 */
router.get('/user/my-projects', protect, getUserProjects);

/**
 * @route   GET /api/projects/admin/all
 * @desc    Get all projects (admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', protect, adminOnly, getAllProjects);

/**
 * @route   DELETE /api/projects/admin/:projectId
 * @desc    Delete project (admin only)
 * @access  Private/Admin
 */
router.delete('/admin/:projectId', protect, adminOnly, deleteProject);

export default router;
