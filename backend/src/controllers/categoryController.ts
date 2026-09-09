import { Request, Response } from 'express';
import Category from '../models/Category.sequelize';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });

    // Transform id to _id for consistency with frontend expectations
    const categoriesData = categories.map((cat) => {
      const data = cat.toJSON() as any;
      data._id = data.id;
      return data;
    });

    res.status(200).json({
      success: true,
      count: categoriesData.length,
      categories: categoriesData,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get single category by slug
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    console.log('Fetching category with slug:', slug);

    const category = await Category.findOne({ where: { slug } });
    console.log('Found category:', category);

    if (!category) {
      console.log('Category not found for slug:', slug);
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Transform id to _id for consistency with frontend expectations
    const categoryData = category.toJSON() as any;
    categoryData._id = categoryData.id;
    console.log('Returning category data:', categoryData);

    res.status(200).json({
      success: true,
      category: categoryData,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Create category (Admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, slug, icon, color } = req.body;

    // Check if category already exists
    const existing = await Category.findOne({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    const category = await Category.create({
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      icon,
      color,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update category (Admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, slug, icon, color } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await category.update({
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      icon,
      color,
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
