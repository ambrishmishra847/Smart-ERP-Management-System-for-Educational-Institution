import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROLES } from '../utils/constants';
import { setAuthUser, getUser } from '../services/auth';
import api from '../services/api';

/**
 * Protects routes: requires login and optionally a specific role.
 * Verifies session via /auth/me (cookie-based JWT).
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data?.user) {
          setUser(data.user);
          setAuthUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboard = user.role === ROLES.SUPER_ADMIN ? '/admin' : user.role === ROLES.TEACHER ? '/teacher' : '/student';
    return <Navigate to={dashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
