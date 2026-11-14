import { Request, Response } from 'express';
import App from '../models/App.sequelize';
import Category from '../models/Category.sequelize';
import User from '../models/User.sequelize';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

// Get all apps with pagination and filtering
export const getApps = async (req: Request, res: Response) => {
  try {
    const { category, search, limit = 12, skip = 0, featured = false, sortBy = 'createdAt' } = req.query;

    console.log('getApps called with params:', { category, search, limit, skip, featured, sortBy });

    let where: any = { status: 'published' };

    if (category) {
      console.log('Looking for category:', category);
      const cat = await Category.findOne({ where: { slug: category as string } });
      console.log('Category found:', cat);
      if (cat) {
        where.categoryId = cat.id;
        console.log('Set categoryId filter to:', cat.id);
      } else {
        console.log('Category not found for slug:', category);
      }
    }

    if (search) {
      const searchTerm = `%${search}%`;
      const searchStr = String(search);
      const searchTermLower = searchStr.toLowerCase();
      
      // Split search into individual words for more flexible matching
      const words = searchTermLower.split(/\s+/).filter((w: string) => w.length > 0);
      
      // Build OR conditions for multiple fields
      const searchConditions = [
        { title: { [Op.like]: searchTerm } },
        { subtitle: { [Op.like]: searchTerm } },
        { description: { [Op.like]: searchTerm } },
        { tags: { [Op.substring]: search } }, // For JSON array fields
      ];

      // Add word-based search for better matching
      if (words.length > 0) {
        const wordConditions = words.map((word: string) => ({
          [Op.or]: [
            { title: { [Op.like]: `%${word}%` } },
            { subtitle: { [Op.like]: `%${word}%` } },
            { description: { [Op.like]: `%${word}%` } },
          ]
        })) as any;
        
        searchConditions.push(...wordConditions);
      }

      where = {
        ...where,
        [Op.or]: searchConditions,
      };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Sort by relevance if searching, otherwise by sort parameter
    let order: any = [['createdAt', 'ASC']];
    if (sortBy === '-createdAt') {
      order = [['createdAt', 'DESC']];
    } else if (sortBy === 'rating') {
      order = [['rating', 'DESC']];
    } else if (sortBy === 'popular') {
      order = [['downloadCount', 'DESC']];
    }
    
    // If searching, prioritize apps with title match, then rating
    if (search) {
      order = [
        ['rating', 'DESC'],
        ['downloadCount', 'DESC'],
        ['createdAt', 'DESC']
      ];
    }

    console.log('Query where clause:', where);
    const { count, rows: apps } = await App.findAndCountAll({
      where,
      include: [
        { model: User, as: 'publisher', attributes: ['id', 'fullName', 'email', 'rating', 'profilePicture'] },
        { model: Category, attributes: ['id', 'name', 'slug', 'icon', 'color'] },
      ],
      order,
      limit: Number(limit),
      offset: Number(skip),
    });

    console.log('Apps found:', apps.length, 'Total:', count);

    // Transform ids to _ids for consistency with frontend expectations
    const transformedApps = apps.map((app) => {
      const appData = app.toJSON() as any;
      appData._id = appData.id;
      
      // Ensure category is properly formatted
      if (appData.Category) {
        appData.category = appData.Category;
        appData.category._id = appData.category.id;
        delete appData.Category;
      } else if (appData.category) {
        appData.category._id = appData.category.id;
      }
      
      if (appData.publisher) {
        appData.publisher._id = appData.publisher.id;
      }
      return appData;
    });

    res.status(200).json({
      success: true,
      count: transformedApps.length,
      total: count,
      apps: transformedApps,
    });
  } catch (error) {
    console.error('Error in getApps:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Get all apps, including drafts and archived listings
export const getAllAppsAdmin = async (req: Request, res: Response) => {
  try {
    const { limit = 1000, skip = 0 } = req.query;
    const { count, rows: apps } = await App.findAndCountAll({
      include: [
        { model: User, as: 'publisher', attributes: ['id', 'fullName', 'email'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(skip),
    });

    const transformedApps = apps.map((app) => {
      const appData = app.toJSON() as any;
      appData._id = appData.id;
      if (appData.Category) {
        appData.category = { ...appData.Category, _id: appData.Category.id };
        delete appData.Category;
      }
      return appData;
    });

    res.status(200).json({ success: true, count: transformedApps.length, total: count, apps: transformedApps });
  } catch (error) {
    console.error('Error fetching apps for admin:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get single app
export const getApp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const app = await App.findByPk(id, {
      include: [
        { model: User, as: 'publisher', attributes: ['id', 'fullName', 'email', 'rating', 'profilePicture'] },
        { model: Category, attributes: ['id', 'name', 'slug', 'icon', 'color', 'appCount'] },
      ],
    });

    if (!app) {
      return res.status(404).json({ success: false, message: 'App not found' });
    }

    // Increment view count
    app.downloadCount = (app.downloadCount || 0) + 1;
    await app.save();

    // Transform id to _id for consistency
    const appData = app.toJSON() as any;
    appData._id = appData.id;
    
    // Ensure category is properly formatted
    if (appData.Category) {
      appData.category = appData.Category;
      appData.category._id = appData.category.id;
      delete appData.Category;
    } else if (appData.category) {
      appData.category._id = appData.category.id;
    }
    
    if (appData.publisher) {
      appData.publisher._id = appData.publisher.id;
    }

    res.status(200).json({
      success: true,
      app: appData,
    });
  } catch (error) {
    console.error('Error in getApp:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Create app
export const createApp = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      subtitle,
      description,
      techStack,
      logo,
      screenshots,
      category,
      price,
      isFree,
      isSaaS,
      isOffline,
      githubRepository,
      distributionFormat,
      deploymentMethod,
      officialWebsite,
      liveDemo,
      documentation,
      tags,
    } = req.body;

    // If category is provided as a slug, look it up
    let categoryId = category;
    if (category && isNaN(Number(category))) {
      // It's not a number, so treat it as a slug
      const foundCategory = await Category.findOne({ where: { slug: category } });
      if (!foundCategory) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      categoryId = foundCategory.id;
    }

    const app = await App.create({
      userId: (req as any).user?.id,
      title,
      subtitle,
      description,
      techStack: techStack || [],
      logo: logo || 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(title),
      screenshots: screenshots || [],
      categoryId,
      price: isFree ? null : price,
      isFree,
      isSaaS,
      isOffline,
      githubRepository,
      distributionFormat,
      deploymentMethod,
      officialWebsite,
      liveDemo,
      documentation,
      tags: tags || [],
      status: req.user?.isAdmin ? req.body.status || 'published' : 'published',
      featured: req.user?.isAdmin ? Boolean(req.body.featured) : false,
    });

    // Increment category app count
    const cat = await Category.findByPk(categoryId);
    if (cat) {
      cat.appCount = (cat.appCount || 0) + 1;
      await cat.save();
    }

    // Transform id to _id for consistency
    const appData = app.toJSON() as any;
    appData._id = appData.id;

    res.status(201).json({
      success: true,
      message: 'App created successfully',
      app: appData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update app
export const updateApp = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const app = await App.findByPk(id);

    if (!app) {
      return res.status(404).json({ success: false, message: 'App not found' });
    }

    // Check authorization - allow owner or admin
    if (app.userId !== (req as any).user?.id && !(req as any).user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this app' });
    }

    const updates = { ...req.body };
    if (updates.category !== undefined) {
      const categoryId = Number(updates.category);
      const category = Number.isNaN(categoryId)
        ? await Category.findOne({ where: { slug: updates.category } })
        : await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      updates.categoryId = category.id;
      delete updates.category;
    }
    if (updates.deploymentMethods !== undefined && updates.deploymentMethod === undefined) {
      updates.deploymentMethod = updates.deploymentMethods;
    }
    delete updates.deploymentMethods;

    if (updates.categoryId !== undefined && Number(updates.categoryId) !== Number(app.categoryId)) {
      const previousCategory = await Category.findByPk(app.categoryId);
      const nextCategory = await Category.findByPk(updates.categoryId);
      if (!nextCategory) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      if (previousCategory) {
        previousCategory.appCount = Math.max(0, (previousCategory.appCount || 1) - 1);
        await previousCategory.save();
      }
      nextCategory.appCount = (nextCategory.appCount || 0) + 1;
      await nextCategory.save();
    }

    await app.update(updates);

    res.status(200).json({
      success: true,
      message: 'App updated successfully',
      app,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Delete app
export const deleteApp = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const app = await App.findByPk(id);

    if (!app) {
      return res.status(404).json({ success: false, message: 'App not found' });
    }

    // Check authorization - allow owner or admin
    if (app.userId !== (req as any).user?.id && !(req as any).user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this app' });
    }

    // Decrement category app count
    if (app.categoryId) {
      const cat = await Category.findByPk(app.categoryId);
      if (cat) {
        cat.appCount = Math.max(0, (cat.appCount || 1) - 1);
        await cat.save();
      }
    }

    await app.destroy();

    res.status(200).json({
      success: true,
      message: 'App deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get apps by category
export const getAppsByCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { limit = 12, skip = 0 } = req.query;

    const category = await Category.findOne({ where: { slug } });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { count, rows: apps } = await App.findAndCountAll({
      where: { categoryId: category.id, status: 'published' },
      include: [
        { model: User, as: 'publisher', attributes: ['id', 'fullName', 'email', 'rating'] },
        { model: Category, attributes: ['id', 'name', 'slug', 'icon'] },
      ],
      limit: Number(limit),
      offset: Number(skip),
    });

    res.status(200).json({
      success: true,
      category,
      count: apps.length,
      total: count,
      apps,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get featured apps
export const getFeaturedApps = async (req: Request, res: Response) => {
  try {
    const { limit = 8 } = req.query;

    const apps = await App.findAll({
      where: { featured: true, status: 'published' },
      include: [
        { model: User, as: 'publisher', attributes: ['id', 'fullName', 'email', 'rating', 'profilePicture'] },
        { model: Category, attributes: ['id', 'name', 'slug', 'icon'] },
      ],
      limit: Number(limit),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: apps.length,
      apps,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Search apps
export const searchApps = async (req: Request, res: Response) => {
  try {
    const { q, limit = 12, skip = 0 } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchTerm = `%${q}%`;
    const searchTermLower = (q as string).toLowerCase();
    
    // Split search into individual words for flexible matching
    const words = searchTermLower.split(/\s+/).filter(w => w.length > 0);
    
    // Build search conditions with multiple fields
    const searchConditions: any[] = [
      { title: { [Op.like]: searchTerm } },
      { subtitle: { [Op.like]: searchTerm } },
      { description: { [Op.like]: searchTerm } },
    ];

    // Add word-based conditions for better phrase matching
    if (words.length > 0) {
      const wordConditions = words.map(word => ({
        [Op.or]: [
          { title: { [Op.like]: `%${word}%` } },
          { subtitle: { [Op.like]: `%${word}%` } },
          { description: { [Op.like]: `%${word}%` } },
        ]
      }));
      
      searchConditions.push(...wordConditions);
    }

    const { count, rows: apps } = await App.findAndCountAll({
      where: {
        status: 'published',
        [Op.or]: searchConditions,
      },
      include: [
        { model: User, as: 'publisher', attributes: ['id', 'fullName', 'email', 'rating', 'profilePicture'] },
        { model: Category, attributes: ['id', 'name', 'slug', 'icon', 'color'] },
      ],
      limit: Number(limit),
      offset: Number(skip),
      // Sort by rating and popularity for search results
      order: [
        ['rating', 'DESC'],
        ['downloadCount', 'DESC'],
        ['createdAt', 'DESC']
      ],
    });

    // Transform ids for frontend
    const transformedApps = apps.map((app) => {
      const appData = app.toJSON() as any;
      appData._id = appData.id;
      if (appData.category) {
        appData.category._id = appData.category.id;
      }
      if (appData.publisher) {
        appData.publisher._id = appData.publisher.id;
      }
      return appData;
    });

    res.status(200).json({
      success: true,
      query: q,
      count: transformedApps.length,
      total: count,
      apps: transformedApps,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get user apps
export const getUserApps = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 12, skip = 0 } = req.query;

    const { count, rows: apps } = await App.findAndCountAll({
      where: { userId: (req as any).user?.id },
      include: [
        { model: User, as: 'publisher', attributes: ['id', 'fullName', 'email', 'rating'] },
        { model: Category, attributes: ['id', 'name', 'slug', 'icon'] },
      ],
      limit: Number(limit),
      offset: Number(skip),
      order: [['createdAt', 'DESC']],
    });

    // Transform ids to _ids for consistency with frontend expectations
    const transformedApps = apps.map((app) => {
      const appData = app.toJSON() as any;
      appData._id = appData.id;
      if (appData.category) {
        appData.category._id = appData.category.id;
      }
      if (appData.publisher) {
        appData.publisher._id = appData.publisher.id;
      }
      return appData;
    });

    res.status(200).json({
      success: true,
      count: transformedApps.length,
      total: count,
      apps: transformedApps,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
