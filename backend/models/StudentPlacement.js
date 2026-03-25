import mongoose from 'mongoose';

const studentPlacementSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    placementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Placement', required: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

studentPlacementSchema.index({ studentId: 1, placementId: 1 }, { unique: true });

export default mongoose.model('StudentPlacement', studentPlacementSchema);

