import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

/**
 * Login: email, password, role.
 * Sets JWT in HTTP-only cookie and returns user (with role profile).
 */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password and role are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.role !== role) {
      return res.status(401).json({ message: 'Role does not match' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let profile = null;
    if (role === 'student') {
      profile = await Student.findOne({ userId: user._id }).populate('course');
    } else if (role === 'teacher') {
      profile = await Teacher.findOne({ userId: user._id }).populate('subjects');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Get current user (after protect middleware).
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id }).populate('course');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ userId: user._id }).populate('subjects');
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

/**
 * Logout: clear JWT cookie.
 */
export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};
