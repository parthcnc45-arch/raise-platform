import nodemailer from 'nodemailer';

/**
 * Creates standard SMTP Transporter (used for local/Gmail development)
 */
const createLocalTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password',
    },
  });
};

/**
 * Creates Brevo SMTP Transporter (optional fallback if Brevo SMTP credentials used)
 */
const createBrevoTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER || process.env.SMTP_USER || '',
      pass: process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS || '',
    },
  });
};

/**
 * Send email via Brevo REST API
 * HTTPS Port 443 is never blocked by cloud hosts (Render, Vercel, AWS)
 */
const sendViaBrevoApi = async (to: string, subject: string, text: string, html?: string) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not defined in environment variables.');
  }

  // Parse sender name & email from EMAIL_FROM (e.g. "Raise Platform" <no-reply@raiseplatform.com>)
  const fromHeader = process.env.EMAIL_FROM || '"Raise Platform" <no-reply@raiseplatform.com>';
  const match = fromHeader.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
  const senderName = process.env.BREVO_SENDER_NAME || (match ? match[1] : 'Raise Platform') || 'Raise Platform';
  const senderEmail = process.env.BREVO_SENDER_EMAIL || (match ? match[2] : 'no-reply@raiseplatform.com') || 'no-reply@raiseplatform.com';

  const payload: Record<string, any> = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: to }],
    subject,
  };

  if (html) {
    payload.htmlContent = html;
  }
  if (text) {
    payload.textContent = text;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: any = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || `Brevo API error (${response.status})`;
    console.error('[Brevo Error]', errorMsg, data);
    throw new Error(errorMsg);
  }

  console.log('[Email] Message sent successfully via Brevo API:', data?.messageId);
  return { success: true, messageId: data?.messageId };
};

/**
 * Send email via SMTP (Nodemailer)
 */
const sendViaSmtp = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
  useBrevoSmtp = false
) => {
  const transporter = useBrevoSmtp ? createBrevoTransporter() : createLocalTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Raise Platform" <no-reply@raiseplatform.com>',
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email] Message sent via ${useBrevoSmtp ? 'Brevo SMTP' : 'local SMTP'}: %s`, info.messageId);
  return { success: true, messageId: info.messageId };
};

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: any;
}

/**
 * Main email dispatcher function based on APP_ENVIRONMENT:
 * - 'local'      -> Sends via SMTP (e.g. Gmail / Nodemailer)
 * - 'production' -> Sends via Brevo (REST API / Brevo SMTP)
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<SendEmailResult> => {
  const env = (
    process.env.APP_ENVIRONMENT ||
    process.env.APP_ENV ||
    process.env.NODE_ENV ||
    'local'
  ).toLowerCase().trim();

  const isProduction = env === 'production' || env === 'prod';

  try {
    if (isProduction) {
      console.log(`[Email] Environment is "${env}". Routing email via Brevo...`);
      if (process.env.BREVO_API_KEY) {
        return await sendViaBrevoApi(to, subject, text, html);
      } else if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS) {
        return await sendViaSmtp(to, subject, text, html, true);
      } else {
        console.warn('[Email Warning] APP_ENVIRONMENT is production, but BREVO_API_KEY is not set. Falling back to default SMTP.');
        return await sendViaSmtp(to, subject, text, html, false);
      }
    } else {
      console.log(`[Email] Environment is "${env}". Routing email via local SMTP...`);
      return await sendViaSmtp(to, subject, text, html, false);
    }
  } catch (error: any) {
    console.error(`[Email Error] Failed to send email via ${isProduction ? 'Brevo' : 'SMTP'}:`, error?.message || error);
    return { success: false, error: error?.message || error };
  }
};
