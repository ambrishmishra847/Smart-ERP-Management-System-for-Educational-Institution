import express from 'express';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

router.get('/test-email', async (req, res) => {
  console.log('Testing email system...');

  const to = process.env.EMAIL_USER;
  if (!to) {
    console.warn('EMAIL_USER is not set; cannot send test email');
    return res.status(400).send('EMAIL_USER is not configured');
  }

  try {
    await sendEmail({
      to,
      subject: 'Smart ERP Test Email',
      html: '<h2>Email system working</h2><p>This is a test email from Smart ERP.</p>',
    });
    res.send(`Test email triggered for ${to}`);
  } catch (error) {
    console.error('Test email sending failed:', error.message);
    res.status(500).send('Test email failed');
  }
});

export default router;

