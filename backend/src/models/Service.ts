import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryTime: number; // in days
  revisions: number;
  tags: string[];
  portfolio?: string[];
  rating: number;
  reviewCount: number;
  status: 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide service title'],
    },
    description: {
      type: String,
      required: [true, 'Please provide service description'],
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide service price'],
    },
    deliveryTime: {
      type: Number,
      required: true,
    },
    revisions: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
    },
    portfolio: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IService>('Service', serviceSchema);
