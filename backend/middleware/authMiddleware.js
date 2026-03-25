import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - verify JWT from HTTP-only cookie and attach user to req.
 */
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

/**
 * Restrict by role. Use after protect.
 * Usage: restrictTo('super_admin', 'teacher')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    const role = req.user.role;
    if (!roles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
