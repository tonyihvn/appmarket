import { Request, Response } from 'express';
import Review from '../models/Review.sequelize';
import App from '../models/App.sequelize';
import { AuthRequest } from '../middleware/auth';

// Get reviews for an app
export const getAppReviews = async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { appId, status: 'approved' },
      attributes: ['id', 'appId', 'userId', 'rating', 'comment', 'createdAt'],
      include: [{ association: 'reviewer', attributes: ['fullName', 'profilePicture', 'rating'] }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(skip),
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: count,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Create review
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { appId, rating, comment } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      where: { appId, userId: req.user?.id },
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this app' });
    }

    const review = await Review.create({
      appId,
      userId: req.user?.id,
      rating,
      comment,
      status: 'pending', // Reviews need approval
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Update review
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check authorization - allow owner or admin
    if (review.userId !== req.user?.id && !req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    await review.update({ rating, comment });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Delete review
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check authorization - allow owner or admin
    if (review.userId !== req.user?.id && !req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.destroy();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Get all reviews
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { limit = 1000, skip = 0 } = req.query;

    const { count, rows: reviews } = await Review.findAndCountAll({
      attributes: ['id', 'appId', 'userId', 'rating', 'comment', 'status', 'createdAt'],
      include: [
        { association: 'reviewer', attributes: ['fullName', 'email'] },
        { model: App, attributes: ['name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(skip),
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: count,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Admin: Delete review
export const deleteReviewAdmin = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await review.destroy();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
