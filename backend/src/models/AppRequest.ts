import mongoose, { Schema, Document } from 'mongoose';

export interface IAppRequest extends Document {
  appId: mongoose.Schema.Types.ObjectId;
  publisherId: mongoose.Schema.Types.ObjectId;
  requesterId: mongoose.Schema.Types.ObjectId;
  requesterEmail: string;
  requesterPhone: string;
  requesterName: string;
  message: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const appRequestSchema = new Schema<IAppRequest>(
  {
    appId: {
      type: Schema.Types.ObjectId,
      ref: 'App',
      required: [true, 'App ID is required'],
    },
    publisherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Publisher ID is required'],
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required'],
    },
    requesterEmail: {
      type: String,
      required: [true, 'Requester email is required'],
    },
    requesterPhone: {
      type: String,
      required: [true, 'Requester phone is required'],
    },
    requesterName: {
      type: String,
      required: [true, 'Requester name is required'],
    },
    message: {
      type: String,
      required: [true, 'Request message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
appRequestSchema.index({ appId: 1, publisherId: 1 });
appRequestSchema.index({ requesterId: 1 });
appRequestSchema.index({ publisherId: 1 });

export default mongoose.model<IAppRequest>('AppRequest', appRequestSchema);
