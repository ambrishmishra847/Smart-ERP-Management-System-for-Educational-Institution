import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';

const roleLabel = (role) => {
  if (role === 'super_admin' || role === 'admin') return 'Admin';
  if (role === 'teacher') return 'Teacher';
  if (role === 'student') return 'Student';
  return role || 'User';
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await api.get('/profile');
        if (mounted) {
          setProfile(data);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load profile');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {error || 'Profile not available.'}
      </div>
    );
  }

  const avatarSrc = profile.avatar || '/default-avatar.png';
  const subjects = Array.isArray(profile.subjects) ? profile.subjects : [];

  return (
    <div className="w-full flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
            <img
              src={avatarSrc}
              alt={profile.name || 'Profile'}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">{profile.name}</h1>
          <p className="text-sm text-slate-500">{roleLabel(profile.role)}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
            <p className="mt-1 text-slate-800 break-all">{profile.email || '-'}</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
            <p className="mt-1 text-slate-800">{profile.phone || '-'}</p>
          </div>
        </div>

        {profile.role === 'student' && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase">Student ID</p>
              <p className="mt-1 text-slate-800">{profile.studentId || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase">Course</p>
              <p className="mt-1 text-slate-800">{profile.course || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase">Semester</p>
              <p className="mt-1 text-slate-800">{profile.semester ?? '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase">Attendance</p>
              <p className="mt-1 text-slate-800">{profile.attendance || '-'}</p>
            </div>
          </div>
        )}

        {profile.role === 'teacher' && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase">Teacher ID</p>
              <p className="mt-1 text-slate-800">{profile.teacherId || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase">Department</p>
              <p className="mt-1 text-slate-800">{profile.department || '-'}</p>
            </div>
            <div className="sm:col-span-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase">Subjects Teaching</p>
              <p className="mt-1 text-slate-800">
                {subjects.length ? subjects.join(', ') : '-'}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;

