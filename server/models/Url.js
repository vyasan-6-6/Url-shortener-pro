import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
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
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Add index on shortCode for high-performance database lookups
urlSchema.index({ shortCode: 1 });

const Url = mongoose.model('Url', urlSchema);
export default Url;
