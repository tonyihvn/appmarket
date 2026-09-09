import { Request, Response } from 'express';
import Favorite from '../models/Favorite.sequelize';
import App from '../models/App.sequelize';

// Add app to favorites
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { appId } = req.body;
    const userId = (req as any).user?.id;

    if (!appId || !userId) {
      return res.status(400).json({ success: false, message: 'App ID and User ID are required' });
    }

    // Check if app exists
    const app = await App.findByPk(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'App not found' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ where: { userId, appId } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'App is already in favorites' });
    }

    // Create favorite
    const favorite = await Favorite.create({ userId, appId });

    res.status(201).json({
      success: true,
      message: 'App added to favorites',
      favorite,
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ success: false, message: 'Error adding favorite', error });
  }
};

// Remove app from favorites
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const userId = (req as any).user?.id;

    if (!appId || !userId) {
      return res.status(400).json({ success: false, message: 'App ID and User ID are required' });
    }

    const result = await Favorite.destroy({
      where: { userId, appId },
    });

    if (result === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.status(200).json({
      success: true,
      message: 'App removed from favorites',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ success: false, message: 'Error removing favorite', error });
  }
};

// Get user's favorite apps
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { userId },
      include: [
        {
          model: App,
          as: undefined,
          attributes: { exclude: ['userId'] },
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const favorites = rows.map((fav: any) => ({
      id: fav.id,
      userId: fav.userId,
      appId: fav.appId,
      ...fav.App?.dataValues,
    }));

    res.status(200).json({
      success: true,
      favorites,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, message: 'Error fetching favorites', error });
  }
};

// Check if app is favorited by user
export const isFavorited = async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const userId = (req as any).user?.id;

    const favorite = await Favorite.findOne({ where: { userId, appId } });

    res.status(200).json({
      success: true,
      isFavorited: !!favorite,
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ success: false, message: 'Error checking favorite status', error });
  }
};

// Get favorite count for an app
export const getFavoriteCount = async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;

    const count = await Favorite.count({ where: { appId } });

    res.status(200).json({
      success: true,
      appId,
      favoriteCount: count,
    });
  } catch (error) {
    console.error('Error getting favorite count:', error);
    res.status(500).json({ success: false, message: 'Error getting favorite count', error });
  }
};
