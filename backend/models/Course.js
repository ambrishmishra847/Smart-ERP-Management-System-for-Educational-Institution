import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true }, // e.g. "3 years", "4 years"
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
