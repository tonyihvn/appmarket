import mongoose, { Schema, Document } from 'mongoose';

export interface IDemoSession extends Document {
  appId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  scheduledDate: Date;
  duration: number; // in minutes
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const demoSessionSchema = new Schema<IDemoSession>(
  {
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'App',
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 30,
    },
    meetingLink: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDemoSession>('DemoSession', demoSessionSchema);
