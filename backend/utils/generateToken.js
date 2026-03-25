import jwt from 'jsonwebtoken';

/**
 * Generate JWT for user id.
 * Uses JWT_SECRET and JWT_EXPIRE from env.
 */
export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
