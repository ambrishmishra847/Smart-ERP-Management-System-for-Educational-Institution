import Timetable from '../models/Timetable.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { notifyRole } from '../services/socketService.js';

export const getTimetable = async (req, res) => {
  try {
    const { courseId, semester, section, dayOfWeek, day } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (semester) filter.semester = Number(semester);
    if (section) filter.section = section;
    if (dayOfWeek !== undefined) filter.dayOfWeek = Number(dayOfWeek);
    if (day) filter.day = day;
    const timetable = await Timetable.find(filter)
      .populate('courseId', 'courseName')
      .populate('subjectId', 'subjectName')
      .populate('teacherId')
      .sort({ dayOfWeek: 1, slot: 1 });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeacherTimetable = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.json([]);

    const timetable = await Timetable.find({ teacherId: teacher._id })
      .populate('courseId', 'courseName')
      .populate('subjectId', 'subjectName')
      .populate('teacherId')
      .sort({ dayOfWeek: 1, slot: 1 });

    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentTimetable = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.json([]);

    const timetable = await Timetable.find({
      courseId: student.course,
      semester: student.semester,
      section: student.section,
    })
      .populate('courseId', 'courseName')
      .populate('subjectId', 'subjectName')
      .populate('teacherId')
      .sort({ dayOfWeek: 1, slot: 1 });

    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTimetableById = async (req, res) => {
  try {
    const slot = await Timetable.findById(req.params.id)
      .populate('courseId', 'courseName')
      .populate('subjectId', 'subjectName')
      .populate('teacherId');
    if (!slot) return res.status(404).json({ message: 'Timetable slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTimetableSlot = async (req, res) => {
  try {
    const slot = await Timetable.create(req.body);
    const populated = await Timetable.findById(slot._id)
      .populate('courseId', 'courseName')
      .populate('subjectId', 'subjectName')
      .populate('teacherId');

    // Notify impacted students + teacher (simple: notify all students; refine later per course/section)
    const studentUsers = await User.find({ role: 'student' }).select('_id');
    if (studentUsers.length) {
      await Notification.insertMany(
        studentUsers.map((u) => ({
          userId: u._id,
          title: 'Timetable Updated',
          message: 'A timetable slot was added/updated. Please check your schedule.',
          type: 'general',
          link: '/student/timetable',
        })),
        { ordered: false }
      );
    }
    notifyRole('student', 'notification', { type: 'timetable' });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTimetableSlot = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('courseId', 'courseName')
      .populate('subjectId', 'subjectName')
      .populate('teacherId');
    if (!slot) return res.status(404).json({ message: 'Timetable slot not found' });

    const studentUsers = await User.find({ role: 'student' }).select('_id');
    if (studentUsers.length) {
      await Notification.insertMany(
        studentUsers.map((u) => ({
          userId: u._id,
          title: 'Timetable Updated',
          message: 'A timetable slot was updated. Please check your schedule.',
          type: 'general',
          link: '/student/timetable',
        })),
        { ordered: false }
      );
    }
    notifyRole('student', 'notification', { type: 'timetable' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTimetableSlot = async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Timetable slot not found' });

    const studentUsers = await User.find({ role: 'student' }).select('_id');
    if (studentUsers.length) {
      await Notification.insertMany(
        studentUsers.map((u) => ({
          userId: u._id,
          title: 'Timetable Updated',
          message: 'A timetable slot was removed. Please check your schedule.',
          type: 'general',
          link: '/student/timetable',
        })),
        { ordered: false }
      );
    }
    notifyRole('student', 'notification', { type: 'timetable' });
    res.json({ message: 'Timetable slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
