import { Request, Response } from 'express';
import Service from '../models/Service.sequelize';
import User from '../models/User.sequelize';
import { AuthRequest } from '../middleware/auth';

// Get all services
export const getServices = async (req: Request, res: Response) => {
  try {
    const { category, search, limit = 20, skip = 0 } = req.query;

    let where: any = { status: 'active' };

    if (category) {
      where.category = category;
    }

    if (search) {
      // For Sequelize, we can use Op.like for text search
      const { Op } = require('sequelize');
      where.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows: services } = await Service.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['fullName', 'email', 'profilePicture', 'rating'] }],
      limit: Number(limit),
      offset: Number(skip),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: services.length,
      total: count,
      services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Create service
export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      price,
      deliveryTime,
      revisions,
      tags,
      portfolio,
    } = req.body;

    const service = await Service.create({
      userId: req.user?.id,
      title,
      description,
      category,
      pricePerHour: price,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get single service
export const getService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [{ model: User, attributes: ['fullName', 'email', 'profilePicture', 'rating'] }],
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update service
export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check authorization - allow owner or admin
    if (service.userId !== req.user?.id && !req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await service.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get user's services
export const getUserServices = async (req: AuthRequest, res: Response) => {
  try {
    const services = await Service.findAll({
      where: { userId: req.user?.id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
