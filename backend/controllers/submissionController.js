import Submission from '../models/Submission.js';
import Assignment from '../models/Assignment.js';
import Notification from '../models/Notification.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const getSubmissions = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.query;
    const filter = {};
    if (assignmentId) filter.assignmentId = assignmentId;
    if (studentId) filter.studentId = studentId;
    const submissions = await Submission.find(filter)
      .populate('assignmentId')
      .populate('studentId');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId')
      .populate('studentId');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSubmission = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.body;
    let fileUrl = req.body.fileUrl;
    if (req.file?.buffer) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'erp/submissions');
      fileUrl = url;
    }
    if (!fileUrl) return res.status(400).json({ message: 'File or fileUrl required' });

    const existing = await Submission.findOne({ assignmentId, studentId });
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const submission = await Submission.create({
      assignmentId,
      studentId,
      fileUrl,
      submissionDate: new Date(),
    });
    const populated = await Submission.findById(submission._id)
      .populate('assignmentId')
      .populate('studentId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade: grade != null ? Number(grade) : undefined, feedback },
      { new: true }
    )
      .populate('assignmentId')
      .populate('studentId');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Notify student (submission.studentId is populated)
    if (submission?.studentId?.userId) {
      await Notification.create({
        userId: submission.studentId.userId,
        message: `Assignment graded: ${submission.assignmentId?.title}. Grade: ${grade}`,
        type: 'graded',
        link: '/student/assignments',
      });
    }
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
