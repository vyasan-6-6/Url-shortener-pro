import mongoose, { Schema, Model } from 'mongoose';
import { IClick } from '../types';

const clickSchema = new Schema<IClick>(
  {
    urlId: {
      type: Schema.Types.ObjectId,
      ref: 'Url',
      required: true
    },
    browser: {
      type: String,
      default: 'Unknown'
    },
    ip: {
      type: String,
      default: 'Unknown'
    },
    referrer: {
      type: String,
      default: 'Direct'
    },
    clickedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Index on urlId for high-performance retrieval of analytics for a specific link
clickSchema.index({ urlId: 1 });

const Click: Model<IClick> = mongoose.model<IClick>('Click', clickSchema);
export default Click;
