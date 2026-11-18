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
<body style="margin: 0; padding: 24px 20px; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #222222;">
  <div style="max-width: 720px; margin: 0;">
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #222222;">
      ${nameDisplay},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #222222;">
      Your ${currentEventName} GP Application has been created. The personalized link below will allow you to return to this application at any time. Use the link to:
    </p>

    <ul style="margin: 0 0 24px 0; padding-left: 24px; font-size: 14px; color: #222222; line-height: 1.6;">
      <li style="margin-bottom: 6px;">Access and complete your application.</li>
      <li style="margin-bottom: 6px;">Return and complete a partially completed application at a later time.</li>
      <li style="margin-bottom: 6px;">Update or correct your application.</li>
    </ul>

    <p style="margin: 0 0 24px 0; font-size: 14px; word-break: break-all;">
      <a href="${magic_link}" style="color: #1a73e8; text-decoration: underline;">${magic_link}</a>
    </p>

    <p style="margin: 0 0 20px 0; font-size: 14px; color: #222222;">
      The deadline for completing this application is ${currentDeadline}. If you have any problems please contact us at <a href="mailto:community@raiseglobal.co" style="color: #1a73e8; text-decoration: underline;">community@raiseglobal.co</a>.
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #222222;">
      Thank you for being part of the RAISE Community.
    </p>

    <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.5; color: #222222;">
      <strong style="color: #2b4c7e; font-size: 16px;">The RAISE Team</strong><br />
      ${currentEventName}<br />
      Thursday, October 22, 2026<br />
      San Francisco, CA<br />
      <a href="https://events.raiseglobal.co/event/2026GlobalSummit/Home" style="color: #1a73e8; text-decoration: underline;">https://events.raiseglobal.co/event/2026GlobalSummit/Home</a>
    </p>

    <div style="border-top: 1px solid #777777; margin: 30px 0 20px 0; width: 100%;"></div>

    <p style="margin: 0 0 16px 0; font-size: 11px; line-height: 1.5; color: #555555; font-style: italic;">
      This email is intended exclusively for the addressed recipient and may contain privileged and confidential information. Any unauthorized use, distribution, or copying of this email is strictly prohibited. If you have received this email in error, please notify the sender immediately and permanently delete it.
    </p>

    <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #555555; font-style: italic;">
      Nothing in this email constitutes tax, legal, insurance, or investment advice, nor does it represent a solicitation or an offer to buy or sell any security or other financial instrument. Powerlaw Fund Adviser, LLC and Akkadian Ventures, Inc. (collectively, &quot;Akkadian&quot;) are registered investment advisers with the Securities and Exchange Commission (&quot;SEC&quot;). Such registration does not imply a specific level of skill or training, nor does it constitute an endorsement of Akkadian by the SEC or any other regulatory agency. Akkadian Ventures, Inc.'s current disclosure brochure, Form ADV Part 2, is provided annually to Akkadian's clients and is also available upon request and on the SEC website: <a href="https://adviserinfo.sec.gov" style="color: #1a73e8; text-decoration: underline;">https://adviserinfo.sec.gov</a>.
    </p>
  </div>
</body>
</html>`;

  return { subject, text, html };
};
