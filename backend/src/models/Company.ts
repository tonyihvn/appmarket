import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  logo?: string;
  information: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
  expertise: string[];
  employees?: number;
  founded?: Date;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    information: {
      type: String,
      required: [true, 'Please provide company information'],
    },
    address: {
      type: String,
      required: [true, 'Please provide company address'],
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: null,
    },
    expertise: {
      type: [String],
      required: true,
    },
    employees: {
      type: Number,
      default: null,
    },
    founded: {
      type: Date,
      default: null,
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

export default mongoose.model<ICompany>('Company', companySchema);
