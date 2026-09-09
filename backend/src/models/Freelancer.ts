import mongoose, { Schema, Document } from 'mongoose';

export interface IFreelancer extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  personalWebsite?: string;
  techStack: string[];
  about: string;
  expertise: string[];
  portfolio?: string[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const freelancerSchema = new Schema<IFreelancer>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    personalWebsite: {
      type: String,
      default: null,
    },
    techStack: {
      type: [String],
      required: true,
    },
    about: {
      type: String,
      required: [true, 'Please provide about yourself'],
    },
    expertise: {
      type: [String],
      required: true,
    },
    portfolio: {
      type: [String],
      default: [],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFreelancer>('Freelancer', freelancerSchema);
