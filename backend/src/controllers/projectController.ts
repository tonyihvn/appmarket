import { Request, Response } from 'express';
import ProjectRequest from '../models/ProjectRequest.sequelize';
import Category from '../models/Category.sequelize';
import User from '../models/User.sequelize';
import { AuthRequest } from '../middleware/auth';

// Get all project requests
export const getProjectRequests = async (req: Request, res: Response) => {
  try {
    const { category, status = 'open', limit = 20, skip = 0 } = req.query;

    let where: any = { status };

    if (category) {
      const cat = await Category.findOne({ where: { slug: category as string } });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    const { count, rows: projects } = await ProjectRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['id', 'fullName', 'email', 'profilePicture', 'rating'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(skip),
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      total: count,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Create project request
export const createProjectRequest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      budget,
      budgetType,
      category,
      requiredSkills,
      timeline,
      attachments,
    } = req.body;

    console.log('=== CREATE PROJECT REQUEST ===');
    console.log('User ID:', (req as any).user?.id);
    console.log('Request Body:', {
      title,
      description,
      budget,
      budgetType,
      category,
      requiredSkills,
      timeline,
      attachments,
    });

    // Get category ID if slug provided
    let categoryId = category;
    if (category && isNaN(Number(category))) {
      console.log('Looking up category by slug:', category);
      const cat = await Category.findOne({ where: { slug: category } });
      console.log('Found category:', cat);
      if (!cat) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      categoryId = cat.id;
    }

    console.log('Creating project with categoryId:', categoryId);
    const project = await ProjectRequest.create({
      clientId: (req as any).user?.id,
      title,
      description,
      budget: parseFloat(budget),
      budgetType,
      categoryId,
      requiredSkills: requiredSkills || [],
      timeline: timeline || 'Flexible',
      attachments: attachments || [],
      status: 'open',
    });

    console.log('Project created:', project);

    // Fetch full project with relations
    const fullProject = await ProjectRequest.findByPk(project.id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'fullName', 'email', 'profilePicture', 'rating'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
      ],
    });

    console.log('Full project with relations:', fullProject);

    res.status(201).json({
      success: true,
      message: 'Project request created successfully',
      project: fullProject,
    });
  } catch (error) {
    console.error('=== CREATE PROJECT ERROR ===');
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get single project
export const getProjectRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await ProjectRequest.findByPk(id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'fullName', 'email', 'profilePicture', 'rating'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
      ],
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update project status
export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const project = await ProjectRequest.findByPk(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only client or admin can update project
    if (project.clientId !== (req as any).user?.id && !(req as any).user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await project.update({ status });

    // Fetch updated project with relations
    const updatedProject = await ProjectRequest.findByPk(id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'fullName', 'email', 'profilePicture', 'rating'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get user's projects
export const getUserProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await ProjectRequest.findAll({
      where: { clientId: (req as any).user?.id },
      include: [
        { model: User, as: 'client', attributes: ['id', 'fullName', 'email', 'profilePicture', 'rating'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Get all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { status, limit = 1000, skip = 0 } = req.query;

    let where: any = {};
    if (status) {
      where.status = status;
    }

    const { count, rows: projects } = await ProjectRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['id', 'fullName', 'email', 'profilePicture', 'rating'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(skip),
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      total: count,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await ProjectRequest.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
