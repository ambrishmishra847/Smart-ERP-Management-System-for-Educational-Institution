import Assignment from '../models/Assignment.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Notification from '../models/Notification.js';
import { sendAssignmentEmail } from '../services/emailService.js';
import { notifyClients } from '../services/socketService.js';

export const getAssignments = async (req, res) => {
  try {
    const { subjectId, teacherId } = req.query;
    const filter = {};
    if (subjectId) filter.subject = subjectId;
    if (teacherId) filter.teacherId = teacherId;
    const assignments = await Assignment.find(filter)
      .populate('subject', 'subjectName')
      .populate('teacherId')
      .sort({ deadline: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('subject', 'subjectName')
      .populate('teacherId');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    console.log('Creating assignment...');
    const assignment = await Assignment.create(req.body);
    const populated = await Assignment.findById(assignment._id)
      .populate('subject', 'subjectName')
      .populate('teacherId');

    // Notify students in same course as subject
    const subject = await Subject.findById(assignment.subject);
    const students = subject ? await Student.find({ course: subject.courseId }).populate('userId') : [];
    console.log('Assignment created, notifying students count:', students.length);
    for (const s of students) {
      await Notification.create({
        userId: s.userId._id,
        message: `New assignment: ${populated.title}`,
        type: 'assignment',
        link: `/student/assignments`,
      });
    }
    notifyClients('new_assignment', { assignment: populated });

    // Await email sending but swallow errors
    try {
      console.log('Triggering assignment emails to students:', students.length);
      await sendAssignmentEmail(students, populated);
    } catch (emailErr) {
      // eslint-disable-next-line no-console
      console.error('Assignment email error:', emailErr.message);
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('subject', 'subjectName')
      .populate('teacherId');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
