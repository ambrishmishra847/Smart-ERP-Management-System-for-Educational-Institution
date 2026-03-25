import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NotificationPanel = ({ onClose, onUnreadChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readStatus).length,
    [notifications]
  );

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.slice(0, 15));
      } catch (e) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [unreadCount, onUnreadChange]);

  useEffect(() => {
    const handler = () => {
      api
        .get('/notifications')
        .then(({ data }) => setNotifications(Array.isArray(data) ? data.slice(0, 15) : []))
        .catch(() => {});
    };
    window.addEventListener('rt-notification', handler);
    return () => window.removeEventListener('rt-notification', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    } catch (e) {}
  };

  const openNotification = async (n) => {
    try {
      if (!n.readStatus) await api.patch(`/notifications/${n._id}/read`);
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, readStatus: true } : x)));
    } catch {}
    if (n.link) navigate(n.link);
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="font-medium text-slate-800">Notifications</span>
        {notifications.some((n) => !n.readStatus) && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs text-primary-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <FiBell className="w-8 h-8 text-slate-300" />
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n._id}
              type="button"
              onClick={() => openNotification(n)}
              className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 ${
                !n.readStatus ? 'bg-primary-50/50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">{n.title || 'Notification'}</p>
                {!n.readStatus && <span className="mt-0.5 w-2 h-2 rounded-full bg-rose-500" />}
              </div>
              <p className="text-sm text-slate-700 mt-0.5">{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
