import express from 'express';
import { login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Simple test route to verify email configuration
router.get('/test-email', async (req, res) => {
  const to = process.env.EMAIL_USER;
  if (!to) {
    return res.status(400).json({ message: 'EMAIL_USER is not configured' });
  }
  try {
    await sendEmail({
      to,
      subject: 'Smart ERP Test Email',
      text: 'This is a test email from Smart ERP.',
      html: '<h2>Smart ERP Notification</h2><p>This is a test email from Smart ERP.</p>',
    });
    res.json({ message: `Test email sent to ${to}` });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to send test email' });
  }
});

export default router;
