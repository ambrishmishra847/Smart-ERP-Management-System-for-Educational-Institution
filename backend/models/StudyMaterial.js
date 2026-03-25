import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('StudyMaterial', studyMaterialSchema);
