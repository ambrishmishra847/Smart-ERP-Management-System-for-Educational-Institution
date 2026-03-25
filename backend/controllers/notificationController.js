import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ message: 'userId and message are required' });
    }
    const notif = await Notification.create({
      userId,
      title: title || '',
      message,
      type: type || 'general',
      link: link || '',
    });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const ids = req.body.ids || req.params.id;
    const filter =
      Array.isArray(ids)
        ? { userId: req.user.id, _id: { $in: ids } }
        : { userId: req.user.id, _id: ids };

    await Notification.updateMany(filter, { readStatus: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { readStatus: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
