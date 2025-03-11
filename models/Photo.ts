import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Photo || mongoose.model('Photo', PhotoSchema); 