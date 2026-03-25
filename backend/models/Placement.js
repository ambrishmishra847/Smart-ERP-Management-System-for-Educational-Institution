import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    registrationLink: { type: String, required: true, trim: true },
    eligibilityCriteria: { type: String, trim: true, default: '' },
    deadline: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

placementSchema.index({ deadline: 1 });
placementSchema.index({ companyName: 1, role: 1, deadline: -1 });

export default mongoose.model('Placement', placementSchema);

