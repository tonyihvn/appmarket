import mongoose, { Schema, Document } from 'mongoose';

export interface IBid extends Document {
  projectId: mongoose.Types.ObjectId;
  bidderId: mongoose.Types.ObjectId;
  bidAmount: number;
  proposal: string;
  deliveryDays: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const bidSchema = new Schema<IBid>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectRequest',
      required: true,
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bidAmount: {
      type: Number,
      required: [true, 'Please provide bid amount'],
    },
    proposal: {
      type: String,
      required: [true, 'Please provide a proposal'],
    },
    deliveryDays: {
      type: Number,
      required: [true, 'Please provide delivery timeline'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBid>('Bid', bidSchema);
