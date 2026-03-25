/**
 * Seed script: creates a Super Admin user if none exists.
 * Run: node scripts/seed.js (from backend folder, with MONGO_URI and JWT_SECRET in env)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI required');
  process.exit(1);
}

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  const existing = await User.findOne({ role: 'super_admin' });
  if (existing) {
    console.log('Super Admin already exists:', existing.email);
    await mongoose.disconnect();
    process.exit(0);
  }
  const admin = await User.create({
    name: 'Super_Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'super_admin',
  });
  console.log('Super Admin created:', admin.email, '| Password: admin123');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
