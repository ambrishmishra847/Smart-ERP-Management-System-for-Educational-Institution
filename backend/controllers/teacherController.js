import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('userId', 'name email')
      .populate('subjects', 'subjectName');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('subjects', 'subjectName');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { name, email, password, department, subjects } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'teacher' });
    const teacher = await Teacher.create({
      userId: user._id,
      department: department || '',
      subjects: subjects || [],
    });
    const populated = await Teacher.findById(teacher._id)
      .populate('userId', 'name email')
      .populate('subjects', 'subjectName');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { name, email, department, subjects } = req.body;
    const teacher = await Teacher.findById(req.params.id).populate('userId');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    if (name) teacher.userId.name = name;
    if (email) teacher.userId.email = email;
    await teacher.userId.save();
    if (department !== undefined) teacher.department = department;
    if (subjects) teacher.subjects = subjects;
    await teacher.save();
    const updated = await Teacher.findById(teacher._id)
      .populate('userId', 'name email')
      .populate('subjects', 'subjectName');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    await User.findByIdAndDelete(teacher.userId);
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
