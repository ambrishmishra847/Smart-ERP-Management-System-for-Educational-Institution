import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    enrollmentNumber: { type: String, required: true, unique: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true, min: 1, max: 10 },
    section: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
