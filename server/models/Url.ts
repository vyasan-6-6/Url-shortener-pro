import mongoose, { Schema, Model } from 'mongoose';
import { IUrl } from '../types';

const urlSchema = new Schema<IUrl>(
  {
    originalUrl: {
      type: String,
      required: [true, 'Please provide the original destination URL'],
      trim: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    clicks: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Url: Model<IUrl> = mongoose.model<IUrl>('Url', urlSchema);
export default Url;
