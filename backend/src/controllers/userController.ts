import { Request, Response } from 'express';
import User from '../models/User.sequelize';
import Company from '../models/Company.sequelize';
import Freelancer from '../models/Freelancer.sequelize';
import { AuthRequest } from '../middleware/auth';

// Get user profile
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user?.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update user profile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, bio, profilePicture } = req.body;

    const user = await User.findByPk(req.user?.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({
      fullName,
      phone,
      bio,
      profilePicture,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Create or update company profile
export const createCompanyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      companyName,
      logo,
      information,
      address,
      email,
      phone,
      website,
      expertise,
    } = req.body;

    let company = await Company.findOne({ where: { userId: req.user?.id } });

    if (company) {
      // Update existing
      await company.update({
        companyName,
        logo,
        information,
        address,
        email,
        phone,
        website,
        expertise,
      });
    } else {
      // Create new
      company = await Company.create({
        userId: req.user?.id,
        companyName,
        logo,
        information,
        address,
        email,
        phone,
        website,
        expertise,
      });
    }

    // Also update user type
    const user = await User.findByPk(req.user?.id);
    if (user) {
      await user.update({ userType: 'AppBuilder' });
    }

    res.status(201).json({
      success: true,
      message: 'Company profile created/updated successfully',
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Create or update freelancer profile
export const createFreelancerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      phone,
      personalWebsite,
      techStack,
      about,
      expertise,
      portfolio,
    } = req.body;

    let freelancer = await Freelancer.findOne({ where: { userId: req.user?.id } });

    if (freelancer) {
      // Update existing
      await freelancer.update({
        fullName,
        phone,
        personalWebsite,
        techStack,
        about,
        expertise,
        portfolio,
      });
    } else {
      // Create new
      freelancer = await Freelancer.create({
        userId: req.user?.id,
        fullName,
        phone,
        personalWebsite,
        techStack,
        about,
        expertise,
        portfolio,
      });
    }

    // Also update user type
    const user = await User.findByPk(req.user?.id);
    if (user) {
      await user.update({ userType: 'AppBuilder' });
    }

    res.status(201).json({
      success: true,
      message: 'Freelancer profile created/updated successfully',
      freelancer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get company profile
export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const company = await Company.findOne({ where: { userId } });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get freelancer profile
export const getFreelancerProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const freelancer = await Freelancer.findOne({ where: { userId } });

    if (!freelancer) {
      return res.status(404).json({ success: false, message: 'Freelancer not found' });
    }

    res.status(200).json({
      success: true,
      freelancer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get users by type
export const getUsersByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const where: any = {};
    if (type !== 'all') {
      where.userType = type;
    }

    const users = await User.findAll({
      where,
      limit: Number(limit),
      offset: Number(skip),
      attributes: { exclude: ['password'] },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { limit = 1000, skip = 0 } = req.query;

    const users = await User.findAll({
      limit: Number(limit),
      offset: Number(skip),
      attributes: { exclude: ['password'] },
    });

    const count = await User.count();

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
