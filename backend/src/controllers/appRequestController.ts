import { Request, Response } from 'express';
import AppRequest from '../models/AppRequest.sequelize';
import App from '../models/App.sequelize';
import User from '../models/User.sequelize';

// Create an app request
export const createAppRequest = async (req: Request, res: Response) => {
  try {
    const { appId, message } = req.body;
    const requesterId = (req as any).user?.id;

    // Validate input
    if (!appId || !message) {
      return res.status(400).json({ success: false, message: 'App ID and message are required' });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters' });
    }

    // Check if app exists
    const app = await App.findByPk(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'App not found' });
    }

    // Get requester info
    const requester = await User.findByPk(requesterId);
    if (!requester) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if requester already requested this app
    const existingRequest = await AppRequest.findOne({ where: { appId, requesterId } });
    if (existingRequest) {
      return res.status(409).json({ success: false, message: 'You have already requested this app' });
    }

    // Create app request
    const appRequest = await AppRequest.create({
      appId,
      publisherId: app.userId,
      requesterId,
      requesterEmail: requester.email,
      requesterPhone: requester.phone,
      requesterName: requester.fullName,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'App request created successfully',
      appRequest,
    });
  } catch (error) {
    console.error('Error creating app request:', error);
    res.status(500).json({ success: false, message: 'Error creating app request', error });
  }
};

// Get app requests for a publisher
export const getPublisherAppRequests = async (req: Request, res: Response) => {
  try {
    const publisherId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    const where: any = { publisherId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await AppRequest.findAndCountAll({
      where,
      include: [
        { model: App, attributes: ['id', 'title', 'logo'] },
        { model: User, as: 'requester', attributes: ['id', 'fullName', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      requests: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching app requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching app requests', error });
  }
};

// Get app requests for a specific app
export const getAppRequests = async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const publisherId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Verify user is the publisher of this app
    const app = await App.findByPk(appId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'App not found' });
    }

    if (app.userId !== publisherId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view requests for this app' });
    }

    const { count, rows } = await AppRequest.findAndCountAll({
      where: { appId },
      include: [{ model: User, as: 'requester', attributes: ['id', 'fullName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      requests: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching app requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching app requests', error });
  }
};

// Update app request status
export const updateAppRequestStatus = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const publisherId = (req as any).user?.id;
    const isAdmin = (req as any).user?.isAdmin;

    // Validate status
    if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Find request
    const appRequest = await AppRequest.findByPk(requestId);
    if (!appRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify user is the publisher or admin
    if (appRequest.publisherId !== publisherId && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
    }

    // Update status
    appRequest.status = status as any;
    await appRequest.save();

    res.status(200).json({
      success: true,
      message: 'Request status updated successfully',
      appRequest,
    });
  } catch (error) {
    console.error('Error updating app request:', error);
    res.status(500).json({ success: false, message: 'Error updating app request', error });
  }
};

// Get user's app requests
export const getUserAppRequests = async (req: Request, res: Response) => {
  try {
    const requesterId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await AppRequest.findAndCountAll({
      where: { requesterId },
      include: [{ model: App, attributes: ['id', 'title', 'logo'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      requests: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user app requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching user app requests', error });
  }
};

// Delete an app request
export const deleteAppRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = (req as any).user?.id;

    const appRequest = await AppRequest.findByPk(requestId);
    if (!appRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Allow deletion by requester or publisher
    if (appRequest.requesterId !== userId && appRequest.publisherId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this request' });
    }

    await appRequest.destroy();

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting app request:', error);
    res.status(500).json({ success: false, message: 'Error deleting app request', error });
  }
};

// Reply to an app request
export const replyToAppRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { replyMessage } = req.body;
    const publisherId = (req as any).user?.id;

    // Validate input
    if (!replyMessage || replyMessage.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    // Find the request
    const appRequest = await AppRequest.findByPk(requestId);
    if (!appRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify user is the publisher
    if (appRequest.publisherId !== publisherId) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this request' });
    }

    // Update request with reply
    appRequest.replyMessage = replyMessage.trim();
    appRequest.replyAt = new Date();
    await appRequest.save();

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      appRequest,
    });
  } catch (error) {
    console.error('Error replying to app request:', error);
    res.status(500).json({ success: false, message: 'Error replying to app request', error });
  }
};

// Admin: Get all app requests
export const getAllAppRequests = async (req: Request, res: Response) => {
  try {
    const { status, limit = 1000, skip = 0 } = req.query;

    let where: any = {};
    if (status) {
      where.status = status;
    }

    const { count, rows: appRequests } = await AppRequest.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(skip),
    });

    res.status(200).json({
      success: true,
      count: appRequests.length,
      total: count,
      appRequests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Delete app request
export const deleteAppRequestAdmin = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const appRequest = await AppRequest.findByPk(requestId);

    if (!appRequest) {
      return res.status(404).json({ success: false, message: 'App request not found' });
    }

    await appRequest.destroy();

    res.status(200).json({
      success: true,
      message: 'App request deleted successfully',
      appRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
