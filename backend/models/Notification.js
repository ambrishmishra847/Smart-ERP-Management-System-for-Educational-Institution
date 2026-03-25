import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Human-friendly title (optional; can be derived from type)
    title: { type: String, trim: true, default: '' },
    message: { type: String, required: true },
    // Stored field (kept for backward compatibility with existing code)
    readStatus: { type: Boolean, default: false },
    type: { type: String, enum: ['assignment', 'announcement', 'graded', 'study_material', 'fee', 'general'], default: 'general' },
    link: { type: String, trim: true },
  },
  { timestamps: true }
);

// Compatibility alias: isRead <-> readStatus
notificationSchema.virtual('isRead')
  .get(function () {
    return this.readStatus;
  })
  .set(function (v) {
    this.readStatus = Boolean(v);
  });

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);
