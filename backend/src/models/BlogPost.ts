import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  userId: mongoose.Types.ObjectId;
  appId?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  published: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'App',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Please provide blog title'],
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content'],
    },
    excerpt: {
      type: String,
      required: true,
    },
    featuredImage: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'Update',
    },
    published: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
