// All email templates for CleanTrack
// Each function returns { subject: string, html: string }
// Template variables use the function parameters — no raw placeholders in HTML.

// ─────────────────────────────────────────────────────────────
// SHARED: Base wrapper used by all emails
// ─────────────────────────────────────────────────────────────

function baseTemplate({
  companyName,
  logoUrl,
  heading,
  body,
  ctaText,
  ctaUrl,
  footer,
}: {
  companyName: string;
  logoUrl?: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  footer?: string;
}): string {
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="${companyName}" width="48" height="48" style="display:block;margin:0 auto 12px;border-radius:8px;" />`
    : `<div style="width:48px;height:48px;margin:0 auto 12px;background:#262626;border-radius:8px;text-align:center;line-height:48px;font-size:20px;font-weight:700;color:#FFFFFF;">${companyName.charAt(0).toUpperCase()}</div>`;

  const ctaButton = ctaText && ctaUrl
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0;">
        <tr>
          <td style="border-radius:8px;background-color:#10B981;">
            <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-family:'Inter',system-ui,-apple-system,sans-serif;font-size:16px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>
    `
    : '';

  const footerSection = footer
    ? `<p style="margin:20px 0 0;font-size:13px;color:#6B6B6B;line-height:1.5;">${footer}</p>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${heading}</title>
  <!--[if mso]>
  <style>body,table,td{font-family:Arial,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0F0F0F;font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Outer container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F0F;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Inner card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#1A1A1A;border:1px solid #333333;border-radius:16px;overflow:hidden;">

          <!-- Logo + Company Name -->
          <tr>
            <td style="padding:36px 36px 0;text-align:center;">
              ${logo}
              <p style="margin:0;font-size:14px;font-weight:600;color:#A0A0A0;letter-spacing:0.02em;">${companyName}</p>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td style="padding:28px 36px 0;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#FFFFFF;line-height:1.3;">${heading}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:16px 36px 0;text-align:center;">
              <div style="font-size:15px;color:#A0A0A0;line-height:1.6;">${body}</div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:4px 36px 0;text-align:center;">
              ${ctaButton}
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:8px 36px 0;text-align:center;">
              ${footerSection}
            </td>
          </tr>

          <!-- Bottom padding -->
          <tr>
            <td style="padding:36px 0 0;">&nbsp;</td>
          </tr>

        </table>
        <!-- End inner card -->

        <!-- Footer branding -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#6B6B6B;">
                &copy; ${new Date().getFullYear()} ${companyName} &middot; Powered by CleanTrack
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}


// ─────────────────────────────────────────────────────────────
// SHARED: Summary row helper (used in check-in/check-out emails)
// ─────────────────────────────────────────────────────────────

function summaryRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #333333;font-size:14px;color:#6B6B6B;width:140px;text-align:left;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #333333;font-size:14px;color:#FFFFFF;font-weight:500;text-align:left;">${value}</td>
    </tr>
  `;
}

function summaryTable(rows: { label: string; value: string }[]): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px auto 0;max-width:360px;">
      ${rows.map(r => summaryRow(r.label, r.value)).join('')}
    </table>
  `;
}


// ─────────────────────────────────────────────────────────────
// 1. INVITATION EMAIL
// Sent when admin invites a new cleaner
// ─────────────────────────────────────────────────────────────

export function getInvitationEmail({
  companyName,
  logoUrl,
  signupUrl,
  expiresInHours = 72,
}: {
  companyName: string;
  logoUrl?: string;
  signupUrl: string;
  expiresInHours?: number;
}): { subject: string; html: string } {
  return {
    subject: `You're invited to join ${companyName} on CleanTrack`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: `You're invited! 🎉`,
      body: `
        <p style="margin:0 0 12px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          <strong style="color:#FFFFFF;">${companyName}</strong> has invited you to join their cleaning team on CleanTrack.
        </p>
        <p style="margin:0;font-size:15px;color:#A0A0A0;line-height:1.6;">
          Create your account to start tracking your assignments, check in at job locations, and log your completed work.
        </p>
      `,
      ctaText: 'Create Your Account',
      ctaUrl: signupUrl,
      footer: `This invitation expires in ${expiresInHours} hours. If you didn't expect this email, you can safely ignore it.`,
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 2. CHECK-IN CONFIRMATION (to Cleaner)
// Sent after a successful check-in
// ─────────────────────────────────────────────────────────────

export function getCheckinConfirmationEmail({
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  locationAddress,
  checkinTime,
}: {
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  locationAddress: string;
  checkinTime: string; // formatted, e.g. "9:02 AM"
}): { subject: string; html: string } {
  return {
    subject: `✅ Checked in at ${locationName}`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: 'Check-in Confirmed',
      body: `
        <p style="margin:0 0 16px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          Hi <strong style="color:#FFFFFF;">${cleanerName}</strong>, you've successfully checked in.
        </p>
        ${summaryTable([
          { label: 'Location', value: locationName },
          { label: 'Address', value: locationAddress },
          { label: 'Checked in at', value: checkinTime },
        ])}
      `,
      footer: 'Remember to check out when you\'re done. Have a great shift!',
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 3. CHECK-IN NOTIFICATION (to Admin)
// Sent to admin when a cleaner checks in
// ─────────────────────────────────────────────────────────────

export function getCheckinAdminNotificationEmail({
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  locationAddress,
  checkinTime,
  dashboardUrl,
}: {
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  locationAddress: string;
  checkinTime: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `${cleanerName} checked in at ${locationName}`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: 'New Check-in',
      body: `
        <p style="margin:0 0 16px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          <strong style="color:#FFFFFF;">${cleanerName}</strong> has checked in at a job location.
        </p>
        ${summaryTable([
          { label: 'Cleaner', value: cleanerName },
          { label: 'Location', value: locationName },
          { label: 'Address', value: locationAddress },
          { label: 'Time', value: checkinTime },
        ])}
      `,
      ctaText: 'View Dashboard',
      ctaUrl: dashboardUrl,
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 4. CHECK-OUT CONFIRMATION (to Cleaner)
// Sent after a successful checkout
// ─────────────────────────────────────────────────────────────

export function getCheckoutConfirmationEmail({
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  locationAddress,
  checkinTime,
  checkoutTime,
  duration,
  tasksCompleted,
  totalTasks,
}: {
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  locationAddress: string;
  checkinTime: string;
  checkoutTime: string;
  duration: string; // formatted, e.g. "2h 43m"
  tasksCompleted: number;
  totalTasks: number;
}): { subject: string; html: string } {
  const allDone = tasksCompleted === totalTasks;
  const taskStatus = allDone
    ? `<span style="color:#10B981;">${tasksCompleted}/${totalTasks} ✓ All complete</span>`
    : `<span style="color:#F59E0B;">${tasksCompleted}/${totalTasks}</span>`;

  return {
    subject: `✅ Checkout complete — ${locationName}`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: 'Checkout Complete',
      body: `
        <p style="margin:0 0 16px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          Nice work, <strong style="color:#FFFFFF;">${cleanerName}</strong>! Here's your shift summary.
        </p>
        ${summaryTable([
          { label: 'Location', value: locationName },
          { label: 'Address', value: locationAddress },
          { label: 'Check-in', value: checkinTime },
          { label: 'Check-out', value: checkoutTime },
          { label: 'Duration', value: `<strong style="color:#FFFFFF;">${duration}</strong>` },
          { label: 'Tasks', value: taskStatus },
        ])}
      `,
      footer: 'Great job today. See you at the next one!',
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 5. CHECK-OUT NOTIFICATION (to Admin)
// Sent to admin when a cleaner checks out
// ─────────────────────────────────────────────────────────────

export function getCheckoutAdminNotificationEmail({
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  locationAddress,
  checkinTime,
  checkoutTime,
  duration,
  tasksCompleted,
  totalTasks,
  photosCount,
  hasRemarks,
  activityDetailUrl,
}: {
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  locationAddress: string;
  checkinTime: string;
  checkoutTime: string;
  duration: string;
  tasksCompleted: number;
  totalTasks: number;
  photosCount: number;
  hasRemarks: boolean;
  activityDetailUrl: string;
}): { subject: string; html: string } {
  const allDone = tasksCompleted === totalTasks;
  const taskStatus = allDone
    ? `<span style="color:#10B981;">${tasksCompleted}/${totalTasks} ✓</span>`
    : `<span style="color:#F59E0B;">${tasksCompleted}/${totalTasks}</span>`;

  const extras: string[] = [];
  if (photosCount > 0) extras.push(`${photosCount} photo${photosCount > 1 ? 's' : ''} uploaded`);
  if (hasRemarks) extras.push('Remarks left');
  const extrasText = extras.length > 0
    ? `<p style="margin:16px 0 0;font-size:13px;color:#6B6B6B;">📎 ${extras.join(' · ')}</p>`
    : '';

  return {
    subject: `${cleanerName} checked out from ${locationName} — ${duration}`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: 'Checkout Report',
      body: `
        <p style="margin:0 0 16px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          <strong style="color:#FFFFFF;">${cleanerName}</strong> has completed their shift.
        </p>
        ${summaryTable([
          { label: 'Cleaner', value: cleanerName },
          { label: 'Location', value: locationName },
          { label: 'Address', value: locationAddress },
          { label: 'Check-in', value: checkinTime },
          { label: 'Check-out', value: checkoutTime },
          { label: 'Duration', value: `<strong style="color:#FFFFFF;">${duration}</strong>` },
          { label: 'Tasks', value: taskStatus },
        ])}
        ${extrasText}
      `,
      ctaText: 'View Full Details',
      ctaUrl: activityDetailUrl,
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 6. GEOFENCE VIOLATION ALERT (to Admin)
// Sent when a cleaner checks in or out outside the geofence
// ─────────────────────────────────────────────────────────────

export function getGeofenceViolationEmail({
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  action,
  distance,
  radius,
  time,
  activityDetailUrl,
}: {
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  action: 'check-in' | 'check-out';
  distance: number; // meters
  radius: number; // meters
  time: string;
  activityDetailUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `⚠️ Geofence alert — ${cleanerName} at ${locationName}`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: 'Geofence Violation',
      body: `
        <p style="margin:0 0 16px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          <strong style="color:#FFFFFF;">${cleanerName}</strong> completed a <strong style="color:#FFFFFF;">${action}</strong> outside the geofence radius.
        </p>
        ${summaryTable([
          { label: 'Cleaner', value: cleanerName },
          { label: 'Location', value: locationName },
          { label: 'Action', value: action === 'check-in' ? 'Check-in' : 'Check-out' },
          { label: 'Time', value: time },
          { label: 'Distance', value: `<span style="color:#F59E0B;">${distance}m</span> (limit: ${radius}m)` },
        ])}
        <p style="margin:16px 0 0;font-size:13px;color:#6B6B6B;line-height:1.5;">
          This could indicate GPS inaccuracy or the cleaner being at a nearby but incorrect location. Review the activity details for more context.
        </p>
      `,
      ctaText: 'Review Activity',
      ctaUrl: activityDetailUrl,
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 7. ACCOUNT DEACTIVATED (to Cleaner)
// Sent when admin deactivates a cleaner's account
// ─────────────────────────────────────────────────────────────

export function getAccountDeactivatedEmail({
  companyName,
  logoUrl,
  cleanerName,
}: {
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
}): { subject: string; html: string } {
  return {
    subject: `Your ${companyName} account has been deactivated`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: 'Account Deactivated',
      body: `
        <p style="margin:0 0 12px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          Hi <strong style="color:#FFFFFF;">${cleanerName}</strong>, your account with <strong style="color:#FFFFFF;">${companyName}</strong> has been deactivated.
        </p>
        <p style="margin:0;font-size:15px;color:#A0A0A0;line-height:1.6;">
          You will no longer be able to check in at job locations. If you believe this is a mistake, please contact your manager directly.
        </p>
      `,
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 8. ACCOUNT REACTIVATED (to Cleaner)
// Sent when admin reactivates a cleaner's account
// ─────────────────────────────────────────────────────────────

export function getAccountReactivatedEmail({
  companyName,
  logoUrl,
  cleanerName,
  appUrl,
}: {
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  appUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Welcome back to ${companyName}!`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: 'Account Reactivated',
      body: `
        <p style="margin:0 0 12px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          Hi <strong style="color:#FFFFFF;">${cleanerName}</strong>, your account with <strong style="color:#FFFFFF;">${companyName}</strong> has been reactivated.
        </p>
        <p style="margin:0;font-size:15px;color:#A0A0A0;line-height:1.6;">
          You can now log in and start checking in at your assigned locations again.
        </p>
      `,
      ctaText: 'Open CleanTrack',
      ctaUrl: appUrl,
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 9. WELCOME EMAIL (to Cleaner after successful signup)
// Sent after cleaner completes registration
// ─────────────────────────────────────────────────────────────

export function getWelcomeEmail({
  companyName,
  logoUrl,
  cleanerName,
  appUrl,
}: {
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  appUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Welcome to ${companyName}! 🎉`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: `Welcome aboard, ${cleanerName}!`,
      body: `
        <p style="margin:0 0 12px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          Your account has been created and you're all set to start using CleanTrack with <strong style="color:#FFFFFF;">${companyName}</strong>.
        </p>
        <p style="margin:0 0 4px;font-size:15px;color:#A0A0A0;line-height:1.6;">Here's how it works:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:12px auto 0;text-align:left;max-width:340px;">
          <tr>
            <td style="padding:8px 12px 8px 0;font-size:20px;vertical-align:top;">📍</td>
            <td style="padding:8px 0;font-size:14px;color:#A0A0A0;line-height:1.5;">Go to your assigned location</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;font-size:20px;vertical-align:top;">✅</td>
            <td style="padding:8px 0;font-size:14px;color:#A0A0A0;line-height:1.5;">Check in when you arrive</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;font-size:20px;vertical-align:top;">📋</td>
            <td style="padding:8px 0;font-size:14px;color:#A0A0A0;line-height:1.5;">Complete your tasks and check out when done</td>
          </tr>
        </table>
      `,
      ctaText: 'Open CleanTrack',
      ctaUrl: appUrl,
      footer: 'Tip: Add CleanTrack to your home screen for quick access!',
    }),
  };
}


// ─────────────────────────────────────────────────────────────
// 10. INVITATION REMINDER (to Cleaner — resend)
// Sent when admin clicks "Resend" on a pending invitation
// ─────────────────────────────────────────────────────────────

export function getInvitationReminderEmail({
  companyName,
  logoUrl,
  signupUrl,
  expiresInHours = 72,
}: {
  companyName: string;
  logoUrl?: string;
  signupUrl: string;
  expiresInHours?: number;
}): { subject: string; html: string } {
  return {
    subject: `Reminder: You're invited to join ${companyName}`,
    html: baseTemplate({
      companyName,
      logoUrl,
      heading: 'Friendly Reminder',
      body: `
        <p style="margin:0 0 12px;font-size:15px;color:#A0A0A0;line-height:1.6;">
          You were recently invited to join <strong style="color:#FFFFFF;">${companyName}</strong> on CleanTrack but haven't created your account yet.
        </p>
        <p style="margin:0;font-size:15px;color:#A0A0A0;line-height:1.6;">
          Tap the button below to get started — it only takes a minute.
        </p>
      `,
      ctaText: 'Create Your Account',
      ctaUrl: signupUrl,
      footer: `This invitation expires in ${expiresInHours} hours. If you didn't expect this email, you can safely ignore it.`,
    }),
  };
}
