import Notice from '../models/Notice.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { notifyClients, notifyRole } from '../services/socketService.js';
import { sendAnnouncementEmail } from '../services/emailService.js';

export const getNotices = async (req, res) => {
  try {
    const { targetRole } = req.query;
    const filter = {};
    if (targetRole) filter.$or = [{ targetRole }, { targetRole: 'all' }];
    const notices = await Notice.find(filter)
      .populate('createdBy', 'name')
      .sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('createdBy', 'name');
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createNotice = async (req, res) => {
  try {
    console.log('Creating announcement notice...');
    const notice = await Notice.create({ ...req.body, createdBy: req.user.id });
    const populated = await Notice.findById(notice._id).populate('createdBy', 'name');

    // Notify users based on targetRole
    const roleFilter = populated.targetRole === 'all' ? {} : { role: populated.targetRole };
    const byRoleLink = (role) => (role === 'teacher' ? '/teacher/notices' : role === 'student' ? '/student/notices' : '/admin/notices');

    const userDocs = await User.find(roleFilter).select('_id role email');
    console.log('Announcement created, triggering email notifications for users:', userDocs.length);
    const notifications = userDocs.map((u) => ({
      userId: u._id,
      title: 'New Announcement',
      message: populated.title ? `New announcement: ${populated.title}` : 'New announcement posted',
      type: 'announcement',
      link: byRoleLink(u.role),
    }));
    if (notifications.length) {
      await Notification.insertMany(notifications, { ordered: false });
    }

    // Email notifications (non-blocking for request)
    try {
      const emails = userDocs.map((u) => u.email).filter(Boolean);
      console.log('Sending announcement emails to:', emails.length, 'users');
      if (emails.length) {
        await sendAnnouncementEmail(emails, populated);
      }
    } catch (emailErr) {
      // eslint-disable-next-line no-console
      console.error('Announcement email error:', emailErr.message);
    }

    notifyClients('new_announcement', { notice: populated });
    if (populated.targetRole === 'all') {
      notifyRole('student', 'notification', { type: 'announcement' });
      notifyRole('teacher', 'notification', { type: 'announcement' });
      notifyRole('super_admin', 'notification', { type: 'announcement' });
    } else {
      notifyRole(populated.targetRole, 'notification', { type: 'announcement' });
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLatestAnnouncement = async (req, res) => {
  try {
    const latest = await Notice.find().sort({ date: -1, createdAt: -1 }).limit(1);
    const n = latest[0];
    if (!n) return res.json(null);
    res.json({
      id: n._id,
      title: n.title,
      date: n.date || n.createdAt,
      targetRole: n.targetRole,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('createdBy', 'name');
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
