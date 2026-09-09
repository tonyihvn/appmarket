import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  appId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    appId: {
      type: Schema.Types.ObjectId,
      ref: 'App',
      required: [true, 'App ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, appId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);
