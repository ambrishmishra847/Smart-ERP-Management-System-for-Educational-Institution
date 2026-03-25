import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';
import Assignment from '../models/Assignment.js';
import Notice from '../models/Notice.js';

/**
 * Admin dashboard stats and analytics.
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, recentActivities] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Course.countDocuments(),
      getRecentActivities(),
    ]);

    // Average attendance (last 30 days) - present / total
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const attendanceAgg = await Attendance.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $group: { _id: null, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }, total: { $sum: 1 } } },
    ]);
    const avgAttendance = attendanceAgg[0]
      ? Math.round((attendanceAgg[0].present / attendanceAgg[0].total) * 100)
      : 0;

    res.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      averageAttendance: avgAttendance,
      recentActivities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function getRecentActivities() {
  const [notices, assignments] = await Promise.all([
    Notice.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name'),
    Assignment.find().sort({ createdAt: -1 }).limit(5).populate('subject', 'subjectName'),
  ]);
  return {
    notices: notices.map((n) => ({ type: 'notice', title: n.title, date: n.date })),
    assignments: assignments.map((a) => ({ type: 'assignment', title: a.title, date: a.deadline })),
  };
}

/**
 * Student growth over months (for charts).
 */
export const getStudentGrowth = async (req, res) => {
  try {
    const data = await Student.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Attendance trends (last 30 days by day).
 */
export const getAttendanceTrends = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const data = await Attendance.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(
      data.map((d) => ({
        ...d,
        percentage: d.total
          ? Math.round((d.present / d.total) * 100)
          : 0,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Course distribution (students per course).
 */
export const getCourseDistribution = async (req, res) => {
  try {
    const data = await Student.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { _id: 1, count: 1, courseName: '$course.courseName' } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Performance overview (average marks per subject).
 */
export const getPerformanceOverview = async (req, res) => {
  try {
    const data = await Result.aggregate([
      { $group: { _id: '$subjectId', avgMarks: { $avg: '$marks' }, count: { $sum: 1 } } },
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' },
      { $project: { _id: 1, avgMarks: { $round: ['$avgMarks', 2] }, count: 1, subjectName: '$subject.subjectName' } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Teacher: class attendance, assignment submissions, student performance.
 */
export const getTeacherAnalytics = async (req, res) => {
  try {
    const TeacherModel = await import('../models/Teacher.js').then((m) => m.default);
    const teacher = await TeacherModel.findOne({ userId: req.user.id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const subjectIds = teacher.subjects;

    const [attendanceStats, assignmentStats, performanceStats] = await Promise.all([
      Attendance.aggregate([
        { $match: { subjectId: { $in: subjectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Assignment.aggregate([
        { $match: { teacherId: teacher._id } },
        { $lookup: { from: 'submissions', localField: '_id', foreignField: 'assignmentId', as: 'subs' } },
        { $project: { title: 1, totalSubmissions: { $size: '$subs' } } },
      ]),
      Result.aggregate([
        { $match: { subjectId: { $in: subjectIds } } },
        { $group: { _id: null, avgMarks: { $avg: '$marks' } } },
      ]),
    ]);

    res.json({
      attendance: attendanceStats,
      assignments: assignmentStats,
      averagePerformance: performanceStats[0]?.avgMarks ? Math.round(performanceStats[0].avgMarks * 100) / 100 : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
