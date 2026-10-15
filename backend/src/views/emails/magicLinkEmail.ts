export const getMagicLinkEmailTemplate = (firstName: string, eventName: string, magic_link: string) => {
  const subject = `Complete Your GP Application - ${eventName}`;
  
  const text = `Hello ${firstName},

You have been invited to complete your GP application for ${eventName}.

Access your application here: ${magic_link}

Regards,
RAISE Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <p style="font-size: 16px;">Hello ${firstName},</p>
      <p style="font-size: 16px;">You have been invited to complete your GP application for <strong>${eventName}</strong>.</p>
      <p style="font-size: 16px;">Please click the button below to access your application:</p>
      <p style="margin: 24px 0;">
        <a href="${magic_link}" style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #FFF; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Complete Your Application
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 14px; word-break: break-all; color: #007BFF;">
        <a href="${magic_link}">${magic_link}</a>
      </p>
      <br/>
      <p style="font-size: 16px; border-top: 1px solid #eee; padding-top: 16px;">
        Regards,<br/>
        <strong>RAISE Team</strong>
      </p>
    </div>
  `;

  return { subject, text, html };
};
