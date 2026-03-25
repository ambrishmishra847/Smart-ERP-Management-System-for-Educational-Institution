import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';

export const getResults = async (req, res) => {
  try {
    const { studentId, subjectId } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (subjectId) filter.subjectId = subjectId;
    const results = await Result.find(filter)
      .populate('studentId')
      .populate('subjectId', 'subjectName');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('studentId')
      .populate('subjectId', 'subjectName');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);
    const populated = await Result.findById(result._id)
      .populate('studentId')
      .populate('subjectId', 'subjectName');

    // Notify student
    const student = await Student.findById(result.studentId).populate('userId');
    if (student?.userId) {
      await Notification.create({
        userId: student.userId._id,
        message: `Results published for ${populated.subjectId?.subjectName}`,
        type: 'general',
        link: '/student/results',
      });
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('studentId')
      .populate('subjectId', 'subjectName');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json({ message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
