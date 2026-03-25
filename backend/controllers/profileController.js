import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const base = {
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
    };

    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id }).populate('course');
      if (!student) {
        return res.json(base);
      }

      const records = await Attendance.find({ studentId: student._id });
      const total = records.length;
      const present = records.filter((a) => a.status === 'present').length;
      const attendancePct = total ? Math.round((present / total) * 100) : null;

      return res.json({
        ...base,
        role: 'student',
        studentId: student.enrollmentNumber,
        course: student.course?.courseName || '',
        semester: student.semester,
        attendance: attendancePct != null ? `${attendancePct}%` : '',
      });
    }

    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id }).populate('subjects', 'subjectName');
      if (!teacher) {
        return res.json(base);
      }

      return res.json({
        ...base,
        role: 'teacher',
        teacherId: teacher._id,
        department: teacher.department || '',
        subjects: Array.isArray(teacher.subjects) ? teacher.subjects.map((s) => s.subjectName) : [],
      });
    }

    // super_admin / admin profile
    return res.json({
      ...base,
      role: 'admin',
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to load profile' });
  }
};

