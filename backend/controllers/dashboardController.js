import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Subject from '../models/Subject.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Result from '../models/Result.js';
import Notice from '../models/Notice.js';
import Timetable from '../models/Timetable.js';
import Placement from '../models/Placement.js';
import StudentPlacement from '../models/StudentPlacement.js';

/**
 * Admin dashboard metrics and data.
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const sixMonthsAgo = new Date(todayStart);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalSubjects,
      attendanceAgg,
      placements,
      studentPlacementCount,
      notices,
      studentGrowthAgg,
      attendanceAnalyticsAgg,
      timetableToday,
      classesTodayCount,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Course.countDocuments(),
      Subject.countDocuments(),
      Attendance.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Placement.find().sort({ createdAt: -1 }).limit(10),
      StudentPlacement.countDocuments(),
      Notice.find().sort({ date: -1 }).limit(5),
      // Students created per month (last 6 months)
      Student.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Attendance distribution for chart: present / absent / late (recent period)
      Attendance.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      // Today's timetable overview across all courses
      Timetable.find({ dayOfWeek: todayStart.getDay() })
        .populate('subjectId', 'subjectName')
        .populate({
          path: 'teacherId',
          populate: { path: 'userId', select: 'name' },
        })
        .sort({ slot: 1 })
        .limit(10),
      Timetable.countDocuments({ dayOfWeek: todayStart.getDay() }),
    ]);

    const totalAttendanceRecords = attendanceAgg.reduce((sum, a) => sum + a.count, 0);
    const presentCount = attendanceAgg.find((a) => a._id === 'present')?.count || 0;
    const averageAttendance =
      totalAttendanceRecords > 0 ? Math.round((presentCount / totalAttendanceRecords) * 100) : 0;

    const totalPlacementDrives = placements.length;
    const activePlacements = placements.filter((p) => p.deadline >= now);

    const studentAnalytics = studentGrowthAgg.map((row) => ({
      month: row._id,
      count: row.count,
    }));

    const attendanceAnalytics = ['present', 'absent', 'late'].map((status) => ({
      status,
      count: attendanceAnalyticsAgg.find((a) => a._id === status)?.count || 0,
    }));

    const recentActivities = [];

    // Student registrations
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name');
    recentStudents.forEach((s) => {
      recentActivities.push({
        type: 'Student registered',
        title: s.userId?.name || s.enrollmentNumber,
        date: s.createdAt,
      });
    });

    // Teacher added
    const recentTeachers = await Teacher.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name');
    recentTeachers.forEach((t) => {
      recentActivities.push({
        type: 'Teacher added',
        title: t.userId?.name,
        date: t.createdAt,
      });
    });

    // Assignment posted
    const recentAssignments = await Assignment.find().sort({ createdAt: -1 }).limit(5).select('title createdAt');
    recentAssignments.forEach((a) => {
      recentActivities.push({
        type: 'Assignment posted',
        title: a.title,
        date: a.createdAt,
      });
    });

    // Placement drive created
    placements.slice(0, 5).forEach((p) => {
      recentActivities.push({
        type: 'Placement drive created',
        title: p.companyName,
        date: p.createdAt,
      });
    });

    // Announcement posted
    notices.forEach((n) => {
      recentActivities.push({
        type: 'Announcement posted',
        title: n.title,
        date: n.date || n.createdAt,
      });
    });

    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      totalSubjects,
      averageAttendance,
      placements: {
        total: totalPlacementDrives,
        active: activePlacements.length,
        studentsApplied: studentPlacementCount,
        upcoming: activePlacements.slice(0, 5).map((p) => ({
          id: p._id,
          companyName: p.companyName,
          role: p.role,
          deadline: p.deadline,
        })),
      },
      recentActivities: recentActivities.slice(0, 20),
      announcements: notices.map((n) => ({
        id: n._id,
        title: n.title,
        category: n.targetRole || 'all',
        date: n.date || n.createdAt,
      })),
      studentAnalytics,
      attendanceAnalytics,
      timetableToday: timetableToday.map((slot) => ({
        id: slot._id,
        subject: slot.subjectId?.subjectName,
        teacher: slot.teacherId?.userId?.name,
        slot: slot.slot,
        startTime: slot.startTime,
        endTime: slot.endTime,
        classroom: slot.classroom,
      })),
      systemHealth: {
        activeUsers: totalStudents + totalTeachers,
        totalClassesToday: classesTodayCount,
        serverStatus: 'Online',
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load dashboard data' });
  }
};

/**
 * Teacher dashboard metrics and data.
 */
export const getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id }).populate('subjects');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const subjectIds = teacher.subjects.map((s) => s._id);

    // Find related courses for student counts
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).select('courseId');
    const courseIds = Array.from(new Set(subjects.map((s) => String(s.courseId))));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalStudents,
      totalSubjects,
      todayAttendanceCount,
      totalAssignments,
      performanceAgg,
      recentAssignments,
      recentNotices,
      upcomingClasses,
      attendanceTrendAgg,
    ] = await Promise.all([
      courseIds.length
        ? Student.countDocuments({ course: { $in: courseIds } })
        : Promise.resolve(0),
      Subject.countDocuments({ _id: { $in: subjectIds } }),
      Attendance.countDocuments({
        subjectId: { $in: subjectIds },
        date: { $gte: today, $lt: tomorrow },
        status: 'present',
      }),
      Assignment.countDocuments({ teacherId: teacher._id }),
      Result.aggregate([
        { $match: { subjectId: { $in: subjectIds } } },
        { $group: { _id: null, avgMarks: { $avg: '$marks' } } },
      ]),
      Assignment.find({ teacherId: teacher._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title deadline'),
      Notice.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title date'),
      Timetable.find({ teacherId: teacher._id })
        .populate('subjectId', 'subjectName')
        .sort({ dayOfWeek: 1, slot: 1 })
        .limit(5),
      // Attendance trend for last 7 days
      Attendance.aggregate([
        {
          $match: {
            subjectId: { $in: subjectIds },
            date: {
              $gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
              $lt: tomorrow,
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const performancePercentage = performanceAgg[0]?.avgMarks
      ? Math.round(performanceAgg[0].avgMarks)
      : 0;

    const recentActivities = [
      ...recentAssignments.map((a) => ({
        type: 'Assignment',
        title: a.title,
        meta: a.deadline ? `Due ${a.deadline.toLocaleDateString()}` : 'Assignment created',
      })),
      ...recentNotices.map((n) => ({
        type: 'Announcement',
        title: n.title,
        meta: n.date ? n.date.toLocaleDateString() : 'Announcement posted',
      })),
    ].slice(0, 5);

    const attendanceTrend = attendanceTrendAgg.map((d) => ({
      date: d._id,
      percentage: d.total ? Math.round((d.present / d.total) * 100) : 0,
    }));

    res.json({
      totalStudents,
      totalSubjects,
      todayAttendanceCount,
      assignmentsPending: totalAssignments,
      performancePercentage,
      recentActivities,
      upcomingClasses,
      attendanceTrend,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load dashboard data' });
  }
};

