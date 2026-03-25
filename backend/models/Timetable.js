import mongoose from 'mongoose';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timetableSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true, trim: true },
    // Kept for grid rendering + uniqueness. Also supports `day` string for API compatibility.
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Sunday, 1 = Monday, ...
    day: { type: String, trim: true }, // e.g. "Monday"
    slot: { type: Number, required: true }, // period number
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true },
    classroom: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

timetableSchema.index({ courseId: 1, semester: 1, section: 1, dayOfWeek: 1, slot: 1 }, { unique: true });

timetableSchema.pre('validate', function (next) {
  if (this.dayOfWeek === undefined || this.dayOfWeek === null) {
    if (this.day) {
      const idx = DAYS.findIndex((d) => d.toLowerCase() === String(this.day).toLowerCase());
      if (idx >= 0) this.dayOfWeek = idx;
    }
  }
  if (!this.day && this.dayOfWeek !== undefined && this.dayOfWeek !== null) {
    this.day = DAYS[this.dayOfWeek];
  }
  next();
});

export default mongoose.model('Timetable', timetableSchema);
