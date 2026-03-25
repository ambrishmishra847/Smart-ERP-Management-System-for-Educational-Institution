import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    targetRole: { type: String, enum: ['all', 'student', 'teacher'], default: 'all' },
  },
  { timestamps: true }
);

export default mongoose.model('Notice', noticeSchema);
