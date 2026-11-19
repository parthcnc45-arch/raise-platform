export const getMagicLinkEmailTemplate = (
  firstName: string,
  eventName: string,
  magic_link: string,
  deadline: string
) => {
  const nameDisplay = firstName?.trim() || 'Not found';
  const currentEventName = eventName?.trim() || 'Not found';
  const currentDeadline = deadline;
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
<style>
  @media screen {
    .font-normal { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", "Roboto Mono", "Droid Sans Mono", monospace; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5;">
  
  <!-- Preview text (hidden) -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Your application is saved. Use your personal link to continue anytime before ${currentDeadline}.
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
 
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); margin-top:20px; margin-bottom:20px;">
 
           <!-- Header -->
           <tr>
             <td style="background: linear-gradient(135deg, #1e3a5f, #2d4a7e); padding:32px 40px;">
               <p style="margin:0; font-size:24px; font-weight:700; color:#ffffff; letter-spacing:0.3px; font-family: 'Segoe UI', system-ui, sans-serif;">RAISE</p>
               <p style="margin:8px 0 0; font-size:14px; color:#c9d8e8; font-family: 'Segoe UI', system-ui, sans-serif;">${currentEventName}</p>
             </td>
           </tr>
 
           <!-- Body -->
           <tr>
             <td style="padding:48px 40px 32px;">
               <p style="margin:0 0 20px; font-size:16px; line-height:26px; color:#2d3748; font-family: 'Segoe UI', system-ui, sans-serif;">
                 ${nameDisplay},
               </p>
 
               <p style="margin:0 0 20px; font-size:16px; line-height:26px; color:#2d3748; font-family: 'Segoe UI', system-ui, sans-serif;">
                 Your <strong>${currentEventName} GP Application</strong> has been created. The personalized link below will allow you to return to this application at any time. Use the link to:
               </p>
 
               <ul style="margin:0 0 24px; padding-left:24px; font-size:16px; line-height:28px; color:#2d3748; font-family: 'Segoe UI', system-ui, sans-serif;">
                 <li style="margin-bottom:8px;">Access and complete your application.</li>
                 <li style="margin-bottom:8px;">Return and complete a partially completed application at a later time.</li>
                 <li style="margin-bottom:8px;">Update or correct your application.</li>
               </ul>
 
               <!-- CTA Button -->
               <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
                 <tr>
                   <td align="center" style="background: linear-gradient(135deg, #3182ce, #2c5aa0); border-radius:8px;">
                     <a href="${magic_link}" target="_blank"
                        style="display:inline-block; padding:16px 40px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; font-family: 'Segoe UI', system-ui, sans-serif; border-radius:4px;">
                       Continue Your Application
                     </a>
                   </td>
                 </tr>
               </table>
 
               <!-- Deadline box -->
               <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
                 <tr>
                   <td style="background-color:#fff7ed; border-left:4px solid #f68728; padding:20px 24px; border-radius:8px;;">
                     <p style="margin:0; font-size:15px; line-height:24px; color:#744210;">
                       The deadline for completing this application is <strong>${currentDeadline}</strong>. If you have any problems please contact us at <a href="mailto:community@raiseglobal.co" style="color:#2b6cb0; text-decoration:none;">community@raiseglobal.co</a>.
                     </p>
                   </td>
                 </tr>
               </table>
 
               <p style="margin:0 0 16px; font-size:13px; line-height:22px; color:#4a5568; font-family: 'Segoe UI', system-ui, sans-serif;">
                 If the button doesn't work, copy and paste this link into your browser:
               </p>
               <p style="margin:0 0 24px; font-size:13px; line-height:22px; word-break:break-all;">
                 <a href="${magic_link}" style="color:#2b6cb0;">${magic_link}</a>
               </p>
 
               <p style="margin:0 0 24px; font-size:16px; line-height:26px; color:#2d3748; font-family: 'Segoe UI', system-ui, sans-serif;">
                 Thank you for being part of the RAISE Community.
               </p>
 
               <p style="margin:20px 0 0; font-size:16px; line-height:26px; color:#2d3748; font-family: 'Segoe UI', system-ui, sans-serif;">
                 Warm regards,<br>
                 <strong style="color:#1e3a5f;">The RAISE Team</strong>
               </p>
             </td>
           </tr>
 
           <!-- Event details -->
           <tr>
             <td style="padding:0 40px 40px;">
               <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9fa; border-radius:10px;">
                 <tr>
                   <td style="padding:24px 30px;">
                     <p style="margin:0 0 10px; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:#1e3a5f; font-family: 'Segoe UI', system-ui, sans-serif;">Event Details</p>
                     <p style="margin:0; font-size:15px; line-height:24px; color:#2d3748; font-family: 'Segoe UI', system-ui, sans-serif;">
                       <strong>${currentEventName}</strong><br>
                       Thursday, October 22, 2026<br>
                       San Francisco, CA<br>
                       <a href="https://events.raiseglobal.co/event/2026GlobalSummit/Home" style="color:#2b6cb0;">https://events.raiseglobal.co/event/2026GlobalSummit/Home</a>
                     </p>
                   </td>
                 </tr>
               </table>
             </td>
           </tr>
 
           <!-- Footer / Legal -->
           <tr>
             <td style="background-color:#fafafa; border-top:1px solid #e2e8f0; padding:28px 40px;">
               <p style="margin:0 0 12px; font-size:12px; line-height:19px; color:#718096; font-family: 'Segoe UI', system-ui, sans-serif;">
                 This email is intended exclusively for the addressed recipient and may contain privileged and confidential information. Any unauthorized use, distribution, or copying of this email is strictly prohibited. If you have received this email in error, please notify the sender immediately and permanently delete it.
               </p>
               <p style="margin:0; font-size:12px; line-height:19px; color:#718096; font-family: 'Segoe UI', system-ui, sans-serif;">
                 Nothing in this email constitutes tax, legal, insurance, or investment advice, nor does it represent a solicitation or an offer to buy or sell any security or other financial instrument. Powerlaw Fund Adviser, LLC and Akkadian Ventures, Inc. (collectively, "Akkadian") are registered investment advisers with the Securities and Exchange Commission ("SEC"). Such registration does not imply a specific level of skill or training, nor does it constitute an endorsement of Akkadian by the SEC or any other regulatory agency. Akkadian Ventures, Inc.'s current disclosure brochure, Form ADV Part 2, is provided annually to Akkadian's clients and is also available upon request and on the SEC website:
                 <a href="https://adviserinfo.sec.gov" style="color:#718096;">https://adviserinfo.sec.gov</a>.
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
