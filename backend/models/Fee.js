import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    dueDate: { type: Date },
    paidDate: { type: Date },
    term: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Fee', feeSchema);
