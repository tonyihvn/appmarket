import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectRequest extends Document {
  clientId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  category: mongoose.Types.ObjectId;
  requiredSkills: string[];
  timeline: string;
  attachments?: string[];
  status: 'open' | 'in_progress' | 'closed' | 'completed';
  bidsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectRequestSchema = new Schema<IProjectRequest>(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide project title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide project description'],
    },
    budget: {
      type: Number,
      required: [true, 'Please provide budget'],
    },
    budgetType: {
      type: String,
      enum: ['fixed', 'hourly'],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    requiredSkills: {
      type: [String],
      required: true,
    },
    timeline: {
      type: String,
      default: 'Flexible',
    },
    attachments: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'closed', 'completed'],
      default: 'open',
    },
    bidsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProjectRequest>('ProjectRequest', projectRequestSchema);
