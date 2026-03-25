import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true, enum: ['present', 'absent', 'late'] },
  },
  { timestamps: true }
);

// One record per student per subject per date
attendanceSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
