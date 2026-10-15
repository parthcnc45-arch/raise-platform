import { Router } from 'express';
import { sendEmail } from '../services/emailService.js';

const router = Router();

router.post('/test-email', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to) {
    return res.status(400).json({ success: false, message: 'Recipient (to) is required' });
  }

  const defaultSubject = subject || 'Test Email from Raise Platform';
  const defaultText = text || 'This is a test email sent from the backend API.';
  
  console.log("API testing with User:", process.env.SMTP_USER);
  console.log("API testing with Pass length:", process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

  const result = await sendEmail(to, defaultSubject, defaultText, html);

  if (result.success) {
    res.status(200).json({ success: true, message: 'Email sent successfully', messageId: result.messageId });
  } else {
    res.status(500).json({ success: false, message: 'Failed to send email', error: result.error });
  }
});

export default router;
