export const getMagicLinkEmailTemplate = (
  firstName: string,
  eventName: string,
  magic_link: string,
  deadline?: string
) => {
  const nameDisplay = firstName?.trim() || 'Code';
  const currentEventName = eventName?.trim() || '2026 RAISE Global Summit';
  const currentDeadline = deadline || 'June 1, 2026';
  const subject = `Your ${currentEventName} GP Application Link`;

  const text = `${nameDisplay},

Your ${currentEventName} GP Application has been created. The personalized link below will allow you to return to this application at any time. Use the link to:

  • Access and complete your application.
  • Return and complete a partially completed application at a later time.
  • Update or correct your application.

${magic_link}

The deadline for completing this application is ${currentDeadline}. If you have any problems please contact us at community@raiseglobal.co.

Thank you for being part of the RAISE Community.

The RAISE Team
${currentEventName}
Thursday, October 22, 2026
San Francisco, CA
https://events.raiseglobal.co/event/2026GlobalSummit/Home

--------------------------------------------------
This email is intended exclusively for the addressed recipient and may contain privileged and confidential information. Any unauthorized use, distribution, or copying of this email is strictly prohibited. If you have received this email in error, please notify the sender immediately and permanently delete it.

Nothing in this email constitutes tax, legal, insurance, or investment advice, nor does it represent a solicitation or an offer to buy or sell any security or other financial instrument. Powerlaw Fund Adviser, LLC and Akkadian Ventures, Inc. (collectively, "Akkadian") are registered investment advisers with the Securities and Exchange Commission ("SEC"). Such registration does not imply a specific level of skill or training, nor does it constitute an endorsement of Akkadian by the SEC or any other regulatory agency. Akkadian Ventures, Inc.'s current disclosure brochure, Form ADV Part 2, is provided annually to Akkadian's clients and is also available upon request and on the SEC website: https://adviserinfo.sec.gov.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your ${currentEventName} GP Application Link</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">
 
  <!-- Preview text (hidden) -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Your application is saved. Use your personal link to continue anytime before ${currentDeadline}.
  </div>
 
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
 
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
 
          <!-- Header -->
          <tr>
            <td style="background-color:#1f3a68; padding:28px 40px;">
              <p style="margin:0; font-size:22px; font-weight:bold; color:#ffffff; letter-spacing:0.5px;">RAISE</p>
              <p style="margin:4px 0 0; font-size:13px; color:#c9d4e8;">${currentEventName}</p>
            </td>
          </tr>
 
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 24px;">
              <p style="margin:0 0 16px; font-size:15px; line-height:24px; color:#333333;">
                ${nameDisplay},
              </p>
 
              <p style="margin:0 0 16px; font-size:15px; line-height:24px; color:#333333;">
                Your <strong>${currentEventName} GP Application</strong> has been created. The personalized link below will allow you to return to this application at any time. Use the link to:
              </p>
 
              <ul style="margin:0 0 24px; padding-left:20px; font-size:15px; line-height:26px; color:#333333;">
                <li>Access and complete your application.</li>
                <li>Return and complete a partially completed application at a later time.</li>
                <li>Update or correct your application.</li>
              </ul>
 
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
                <tr>
                  <td align="center" style="background-color:#1f3a68; border-radius:6px;">
                    <a href="${magic_link}" target="_blank"
                       style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none;">
                      Continue Your Application
                    </a>
                  </td>
                </tr>
              </table>
 
              <!-- Deadline box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#fff8e6; border-left:4px solid #f0a500; padding:16px 20px; border-radius:4px;">
                    <p style="margin:0; font-size:14px; line-height:22px; color:#5c4400;">
                      The deadline for completing this application is <strong>${currentDeadline}</strong>. If you have any problems please contact us at <a href="mailto:community@raiseglobal.co" style="color:#1f5fbf; text-decoration:none;">community@raiseglobal.co</a>.
                    </p>
                  </td>
                </tr>
              </table>
 
              <p style="margin:0 0 8px; font-size:13px; line-height:20px; color:#666666;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px; font-size:13px; line-height:20px; word-break:break-all;">
                <a href="${magic_link}" style="color:#1f5fbf;">${magic_link}</a>
              </p>
 
              <p style="margin:0 0 24px; font-size:15px; line-height:24px; color:#333333;">
                Thank you for being part of the RAISE Community.
              </p>
 
              <p style="margin:16px 0 0; font-size:15px; line-height:24px; color:#333333;">
                Warm regards,<br>
                <strong style="color:#1f3a68;">The RAISE Team</strong>
              </p>
            </td>
          </tr>
 
          <!-- Event details -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6fa; border-radius:6px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px; font-size:12px; font-weight:bold; text-transform:uppercase; letter-spacing:1px; color:#1f3a68;">Event Details</p>
                    <p style="margin:0; font-size:14px; line-height:22px; color:#333333;">
                      <strong>${currentEventName}</strong><br>
                      Thursday, October 22, 2026<br>
                      San Francisco, CA<br>
                      <a href="https://events.raiseglobal.co/event/2026GlobalSummit/Home" style="color:#1f5fbf;">https://events.raiseglobal.co/event/2026GlobalSummit/Home</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
 
          <!-- Footer / Legal -->
          <tr>
            <td style="background-color:#fafafa; border-top:1px solid #e5e5e5; padding:24px 40px;">
              <p style="margin:0 0 12px; font-size:11px; line-height:17px; color:#888888;">
                This email is intended exclusively for the addressed recipient and may contain privileged and confidential information. Any unauthorized use, distribution, or copying of this email is strictly prohibited. If you have received this email in error, please notify the sender immediately and permanently delete it.
              </p>
              <p style="margin:0; font-size:11px; line-height:17px; color:#888888;">
                Nothing in this email constitutes tax, legal, insurance, or investment advice, nor does it represent a solicitation or an offer to buy or sell any security or other financial instrument. Powerlaw Fund Adviser, LLC and Akkadian Ventures, Inc. (collectively, "Akkadian") are registered investment advisers with the Securities and Exchange Commission ("SEC"). Such registration does not imply a specific level of skill or training, nor does it constitute an endorsement of Akkadian by the SEC or any other regulatory agency. Akkadian Ventures, Inc.'s current disclosure brochure, Form ADV Part 2, is provided annually to Akkadian's clients and is also available upon request and on the SEC website:
                <a href="https://adviserinfo.sec.gov" style="color:#888888;">https://adviserinfo.sec.gov</a>.
              </p>
            </td>
          </tr>
 
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
};
