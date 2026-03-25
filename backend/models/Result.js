import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    marks: { type: Number, required: true, min: 0, max: 100 },
    term: { type: String, trim: true }, // e.g. "Mid Term", "Final"
  },
  { timestamps: true }
);

resultSchema.index({ studentId: 1, subjectId: 1, term: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);
