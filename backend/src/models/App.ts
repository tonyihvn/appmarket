import mongoose, { Schema, Document } from 'mongoose';

export interface IApp extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  subtitle: string;
  description: string;
  techStack: string[];
  logo: string;
  screenshots: string[];
  category: mongoose.Types.ObjectId;
  price: number | null;
  isFree: boolean;
  isSaaS: boolean;
  isOffline: boolean;
  githubRepository?: string;
  distributionFormat: 'executable' | 'web' | 'source' | 'hybrid';
  deploymentMethods?: string[];
  officialWebsite?: string;
  liveDemo?: string;
  documentation?: string;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appSchema = new Schema<IApp>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide app title'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Please provide app subtitle'],
    },
    description: {
      type: String,
      required: [true, 'Please provide app description'],
    },
    techStack: {
      type: [String],
      required: true,
    },
    logo: {
      type: String,
      required: [true, 'Please provide app logo'],
    },
    screenshots: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    price: {
      type: Number,
      default: null,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    isSaaS: {
      type: Boolean,
      default: false,
    },
    isOffline: {
      type: Boolean,
      default: false,
    },
    githubRepository: {
      type: String,
      default: null,
    },
    distributionFormat: {
      type: String,
      enum: ['executable', 'web', 'source', 'hybrid'],
      required: true,
    },
    deploymentMethods: {
      type: String,
      default: null,
    },
    officialWebsite: {
      type: String,
      default: null,
    },
    liveDemo: {
      type: String,
      default: null,
    },
    documentation: {
      type: String,
      default: null,
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
    downloadCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
appSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IApp>('App', appSchema);
