import Student from '../models/Student.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';

export const getStudents = async (req, res) => {
  try {
    const { courseId, subjectId, semester, section } = req.query;
    const filter = {};

    // Allow teachers to fetch students for a selected subject:
    // subjectId -> Subject.courseId -> filter students by course
    if (subjectId) {
      const subject = await Subject.findById(subjectId).select('courseId');
      if (subject?.courseId) filter.course = subject.courseId;
    }
    if (courseId) filter.course = courseId;
    if (semester) filter.semester = Number(semester);
    if (section) filter.section = section;

    const students = await Student.find(filter)
      .populate('userId', 'name email')
      .populate('course', 'courseName duration');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('course', 'courseName duration');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, email, password, enrollmentNumber, course, semester, section } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });
    const existingEnroll = await Student.findOne({ enrollmentNumber });
    if (existingEnroll) return res.status(400).json({ message: 'Enrollment number already exists' });

    const user = await User.create({ name, email, password, role: 'student' });
    const student = await Student.create({
      userId: user._id,
      enrollmentNumber,
      course,
      semester: Number(semester),
      section,
    });
    const populated = await Student.findById(student._id)
      .populate('userId', 'name email')
      .populate('course', 'courseName duration');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { name, email, course, semester, section } = req.body;
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (name) student.userId.name = name;
    if (email) student.userId.email = email;
    await student.userId.save();
    if (course) student.course = course;
    if (semester) student.semester = Number(semester);
    if (section) student.section = section;
    await student.save();
    const updated = await Student.findById(student._id)
      .populate('userId', 'name email')
      .populate('course', 'courseName duration');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
