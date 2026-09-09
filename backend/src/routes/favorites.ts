import express from 'express';
import { protect } from '../middleware/auth';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorited,
  getFavoriteCount,
} from '../controllers/favoriteController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Add app to favorites
router.post('/', addFavorite);

// Remove app from favorites
router.delete('/:appId', removeFavorite);

// Get user's favorite apps
router.get('/list', getUserFavorites);

// Check if app is favorited
router.get('/check/:appId', isFavorited);

// Get favorite count for an app (public, but placed here for organization)
router.get('/count/:appId', getFavoriteCount);

export default router;
