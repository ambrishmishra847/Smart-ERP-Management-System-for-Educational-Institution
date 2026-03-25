import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiBell } from 'react-icons/fi';
import { ROLE_LABELS } from '../utils/constants';
import NotificationPanel from './NotificationPanel';
import { getUser, logout as clearUser } from '../services/auth';
import { logout as apiLogout } from '../services/authService';
import api from '../services/api';

const Navbar = ({ onMenuClick, title }) => {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(() => getUser());
  const notifRef = useRef(null);
  useEffect(() => {
    if (!showNotif) return;
    const close = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showNotif]);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const { data } = await api.get('/notifications');
        const arr = Array.isArray(data) ? data : [];
        setUnreadCount(arr.filter((n) => !n.readStatus).length);
      } catch {
        setUnreadCount(0);
      }
    };
    loadCount();
    const handler = () => loadCount();
    window.addEventListener('rt-notification', handler);
    return () => window.removeEventListener('rt-notification', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore network errors on logout, just clear local state
    }
    clearUser();
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Menu"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 truncate">{title || 'Dashboard'}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotif((v) => !v)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 relative"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <NotificationPanel onClose={() => setShowNotif(false)} onUnreadChange={(n) => setUnreadCount(n)} />
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <span className="text-sm text-slate-600">{user?.name}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {ROLE_LABELS[user?.role] || user?.role}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600"
          aria-label="Logout"
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
