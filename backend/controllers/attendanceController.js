import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

export const getAttendance = async (req, res) => {
  try {
    const { subjectId, date, studentId } = req.query;
    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (date) filter.date = new Date(date);
    if (studentId) filter.studentId = studentId;
    const attendance = await Attendance.find(filter)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate('subjectId', 'subjectName');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, date, status } = req.body;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    let record = await Attendance.findOne({ studentId, subjectId, date: d });
    if (record) {
      record.status = status;
      await record.save();
    } else {
      record = await Attendance.create({ studentId, subjectId, date: d, status });
    }
    const populated = await Attendance.findById(record._id)
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate('subjectId', 'subjectName');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const bulkMarkAttendance = async (req, res) => {
  try {
    const { subjectId, date, entries } = req.body; // entries: [{ studentId, status }]
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    for (const { studentId, status } of entries) {
      await Attendance.findOneAndUpdate(
        { studentId, subjectId, date: d },
        { status },
        { new: true, upsert: true }
      );
    }

    // Return populated records for this subject/date so UI can render names immediately
    const populated = await Attendance.find({ subjectId, date: d })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('subjectId', 'subjectName');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    const filter = { studentId };
    if (startDate) filter.date = { ...filter.date, $gte: new Date(startDate) };
    if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
    const attendance = await Attendance.find(filter)
      .populate('subjectId', 'subjectName')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
