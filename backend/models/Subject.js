import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true, trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  },
  { timestamps: true }
);

export default mongoose.model('Subject', subjectSchema);
