import { Request, Response } from 'express';
import Bid from '../models/Bid.sequelize';
import ProjectRequest from '../models/ProjectRequest.sequelize';
import User from '../models/User.sequelize';
import { AuthRequest } from '../middleware/auth';

// Get bids for a project
export const getProjectBids = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const bids = await Bid.findAll({
      where: { projectId },
      include: [{ model: User, as: 'bidder', attributes: ['id', 'fullName', 'email', 'rating', 'profilePicture'] }],
      order: [['createdAt', 'DESC']],
    });

    // Transform bid data for frontend compatibility
    const transformedBids = bids.map((bid) => {
      const bidData = bid.toJSON() as any;
      bidData._id = bidData.id;
      bidData.amount = bidData.bidAmount;
      bidData.timeline = bidData.deliveryDays;
      if (bidData.bidder) {
        bidData.bidder._id = bidData.bidder.id;
      }
      return bidData;
    });

    res.status(200).json({
      success: true,
      count: transformedBids.length,
      bids: transformedBids,
    });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Create bid
export const createBid = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, amount, proposal, timeline } = req.body;

    // Validate required fields
    if (!projectId || !amount || !proposal || !timeline) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: projectId, amount, proposal, timeline' 
      });
    }

    const project = await ProjectRequest.findByPk(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Extract number from timeline string (e.g., "2 weeks" -> 2)
    const timelineMatch = timeline.toString().match(/\d+/);
    const deliveryDays = timelineMatch ? parseInt(timelineMatch[0]) : 0;

    const bid = await Bid.create({
      projectId,
      bidderId: req.user?.id,
      bidAmount: parseFloat(amount),
      proposal,
      deliveryDays,
      status: 'pending',
    });

    // Increment bids count
    await project.increment('bidsCount');

    // Transform bid data for frontend compatibility
    const bidData = bid.toJSON() as any;
    bidData._id = bidData.id;
    bidData.amount = bidData.bidAmount;
    bidData.timeline = bidData.deliveryDays;

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      bid: bidData,
    });
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update bid status
export const updateBidStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const bid = await Bid.findByPk(id, { 
      include: [
        { model: ProjectRequest },
        { model: User, as: 'bidder' }
      ] 
    });

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    // Check if user is project owner or admin
    const project = await ProjectRequest.findByPk(bid.projectId);
    if (project?.clientId !== req.user?.id && !req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this bid' });
    }

    await bid.update({ status });

    // Transform bid data for frontend compatibility
    const bidData = bid.toJSON() as any;
    bidData._id = bidData.id;
    bidData.amount = bidData.bidAmount;
    bidData.timeline = bidData.deliveryDays;
    if (bidData.bidder) {
      bidData.bidder._id = bidData.bidder.id;
    }

    res.status(200).json({
      success: true,
      message: 'Bid status updated successfully',
      bid: bidData,
    });
  } catch (error) {
    console.error('Error updating bid status:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Get user's bids
export const getUserBids = async (req: AuthRequest, res: Response) => {
  try {
    const bids = await Bid.findAll({
      where: { bidderId: req.user?.id },
      include: [{ model: ProjectRequest }],
      order: [['createdAt', 'DESC']],
    });

    // Transform bid data for frontend compatibility
    const transformedBids = bids.map((bid) => {
      const bidData = bid.toJSON() as any;
      bidData._id = bidData.id;
      bidData.amount = bidData.bidAmount;
      bidData.timeline = bidData.deliveryDays;
      
      // Ensure projectId is set (from model or ProjectRequest)
      if (!bidData.projectId && bidData.ProjectRequest) {
        bidData.projectId = bidData.ProjectRequest.id;
      }
      
      if (bidData.ProjectRequest) {
        bidData.project = bidData.ProjectRequest;
        bidData.project._id = bidData.project.id;
        delete bidData.ProjectRequest;
      }
      
      console.log('Transformed bid:', { id: bidData.id, projectId: bidData.projectId, status: bidData.status });
      return bidData;
    });

    res.status(200).json({
      success: true,
      count: transformedBids.length,
      bids: transformedBids,
    });
  } catch (error) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Get all bids
export const getAllBids = async (req: Request, res: Response) => {
  try {
    const { status, limit = 1000, skip = 0 } = req.query;

    let where: any = {};
    if (status) {
      where.status = status;
    }

    const { count, rows: bids } = await Bid.findAndCountAll({
      where,
      include: [{ model: ProjectRequest }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(skip),
    });

    res.status(200).json({
      success: true,
      count: bids.length,
      total: count,
      bids,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Delete bid
export const deleteBid = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findByPk(bidId);

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    await bid.destroy();

    res.status(200).json({
      success: true,
      message: 'Bid deleted successfully',
      bid,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
