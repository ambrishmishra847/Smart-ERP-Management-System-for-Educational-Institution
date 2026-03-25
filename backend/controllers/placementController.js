import Placement from '../models/Placement.js';
import Student from '../models/Student.js';
import StudentPlacement from '../models/StudentPlacement.js';
import { notifyRole } from '../services/socketService.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendPlacementEmail } from '../services/emailService.js';

export const getPlacements = async (req, res) => {
  try {
    const placements = await Placement.find()
      .populate('createdBy', 'name email role')
      .sort({ deadline: 1, createdAt: -1 });
    res.json(placements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPlacementById = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id).populate('createdBy', 'name email role');
    if (!placement) return res.status(404).json({ message: 'Placement not found' });
    res.json(placement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPlacement = async (req, res) => {
  try {
    const { companyName, role, description, registrationLink, eligibilityCriteria, deadline } = req.body;
    if (!companyName || !role || !registrationLink || !deadline) {
      return res.status(400).json({ message: 'companyName, role, registrationLink, deadline are required' });
    }

    console.log('Creating placement drive...');
    const placement = await Placement.create({
      companyName,
      role,
      description,
      registrationLink,
      eligibilityCriteria,
      deadline: new Date(deadline),
      createdBy: req.user._id,
    });

    const populated = await Placement.findById(placement._id).populate('createdBy', 'name email role');

    // Persist notifications for all students
    const studentUsers = await User.find({ role: 'student' }).select('_id email');
    console.log('Placement created, notifying student users count:', studentUsers.length);
    if (studentUsers.length) {
      await Notification.insertMany(
        studentUsers.map((u) => ({
          userId: u._id,
          title: 'New Placement Drive',
          message: populated.companyName ? `New placement drive: ${populated.companyName}` : 'New placement drive posted',
          type: 'general',
          link: '/student/placements',
        })),
        { ordered: false }
      );

      // Email notifications (non-blocking for request)
      try {
        const emails = studentUsers.map((u) => u.email).filter(Boolean);
        console.log('Triggering placement emails to students:', emails.length);
        if (emails.length) {
          await sendPlacementEmail(emails, populated);
        }
      } catch (emailErr) {
        // eslint-disable-next-line no-console
        console.error('Placement email error:', emailErr.message);
      }
    }

    // Real-time notify all students
    notifyRole('student', 'newPlacement', {
      _id: populated._id,
      companyName: populated.companyName,
      role: populated.role,
      eligibilityCriteria: populated.eligibilityCriteria,
      registrationLink: populated.registrationLink,
      deadline: populated.deadline,
    });
    notifyRole('student', 'notification', { type: 'placement' });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByIdAndDelete(req.params.id);
    if (!placement) return res.status(404).json({ message: 'Placement not found' });
    await StudentPlacement.deleteMany({ placementId: placement._id });
    res.json({ message: 'Placement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentPlacementStatus = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.json({ appliedPlacementIds: [] });

    const applied = await StudentPlacement.find({ studentId: student._id }).select('placementId registeredAt');
    res.json({
      appliedPlacementIds: applied.map((a) => String(a.placementId)),
      appliedCount: applied.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markPlacementApplied = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(400).json({ message: 'Student profile not found' });

    const placementId = req.params.id;
    const placement = await Placement.findById(placementId);
    if (!placement) return res.status(404).json({ message: 'Placement not found' });

    const doc = await StudentPlacement.findOneAndUpdate(
      { studentId: student._id, placementId },
      { $setOnInsert: { studentId: student._id, placementId, registeredAt: new Date() } },
      { new: true, upsert: true }
    );
    res.status(201).json(doc);
  } catch (err) {
    // Handle duplicate key race
    if (err?.code === 11000) return res.status(200).json({ message: 'Already applied' });
    res.status(500).json({ message: err.message });
  }
};

