import nodemailer from "nodemailer";
import * as templates from "./email-templates";
import { getAppUrl } from "./utils";

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing Gmail SMTP credentials.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTimeOnly(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

// ─────────────────────────────────────────────────────────────
// 1. INVITATION
// ─────────────────────────────────────────────────────────────

interface InviteEmailParams {
  to: string;
  inviteLink: string;
  companyName: string;
  logoUrl?: string;
  expiresInHours?: number;
}

export async function sendInviteEmail({
  to,
  inviteLink,
  companyName,
  logoUrl,
  expiresInHours = 72,
}: InviteEmailParams) {
  const transporter = createTransporter();
  const { subject, html } = templates.getInvitationEmail({
    companyName,
    logoUrl,
    signupUrl: inviteLink,
    expiresInHours,
  });

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ─────────────────────────────────────────────────────────────
// 2. CHECK-IN
// ─────────────────────────────────────────────────────────────

interface CheckinEmailParams {
  to: string;
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  locationAddress: string;
  checkinTime: string;
  recipientRole: "cleaner" | "admin";
  dashboardUrl?: string;
}

export async function sendCheckinEmail({
  to,
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  locationAddress,
  checkinTime,
  recipientRole,
  dashboardUrl,
}: CheckinEmailParams) {
  const transporter = createTransporter();
  const timeLabel = formatTimeOnly(checkinTime);

  const { subject, html } = recipientRole === "admin"
    ? templates.getCheckinAdminNotificationEmail({
        companyName,
        logoUrl,
        cleanerName,
        locationName,
        locationAddress,
        checkinTime: timeLabel,
        dashboardUrl: dashboardUrl || `${getAppUrl()}/admin`,
      })
    : templates.getCheckinConfirmationEmail({
        companyName,
        logoUrl,
        cleanerName,
        locationName,
        locationAddress,
        checkinTime: timeLabel,
      });

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ─────────────────────────────────────────────────────────────
// 3. CHECK-OUT
// ─────────────────────────────────────────────────────────────

interface CheckoutEmailParams {
  to: string;
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  locationAddress: string;
  checkinTime: string;
  checkoutTime: string;
  durationLabel: string;
  tasksCompleted: number;
  totalTasks: number;
  photosCount: number;
  hasRemarks: boolean;
  recipientRole: "cleaner" | "admin";
  activityDetailUrl?: string;
}

export async function sendCheckoutEmail({
  to,
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  locationAddress,
  checkinTime,
  checkoutTime,
  durationLabel,
  tasksCompleted,
  totalTasks,
  photosCount,
  hasRemarks,
  recipientRole,
  activityDetailUrl,
}: CheckoutEmailParams) {
  const transporter = createTransporter();
  const checkinLabel = formatTimeOnly(checkinTime);
  const checkoutLabel = formatTimeOnly(checkoutTime);

  const { subject, html } = recipientRole === "admin"
    ? templates.getCheckoutAdminNotificationEmail({
        companyName,
        logoUrl,
        cleanerName,
        locationName,
        locationAddress,
        checkinTime: checkinLabel,
        checkoutTime: checkoutLabel,
        duration: durationLabel,
        tasksCompleted,
        totalTasks,
        photosCount,
        hasRemarks,
        activityDetailUrl: activityDetailUrl || `${getAppUrl()}/admin/activity`,
      })
    : templates.getCheckoutConfirmationEmail({
        companyName,
        logoUrl,
        cleanerName,
        locationName,
        locationAddress,
        checkinTime: checkinLabel,
        checkoutTime: checkoutLabel,
        duration: durationLabel,
        tasksCompleted,
        totalTasks,
      });

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ─────────────────────────────────────────────────────────────
// 4. GEOFENCE ALERT
// ─────────────────────────────────────────────────────────────

interface GeofenceEmailParams {
  to: string;
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  action: "check-in" | "check-out";
  distance: number;
  radius: number;
  time: string;
  activityDetailUrl: string;
}

export async function sendGeofenceViolationEmail({
  to,
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  action,
  distance,
  radius,
  time,
  activityDetailUrl,
}: GeofenceEmailParams) {
  const transporter = createTransporter();
  const { subject, html } = templates.getGeofenceViolationEmail({
    companyName,
    logoUrl,
    cleanerName,
    locationName,
    action,
    distance,
    radius,
    time: formatTimeOnly(time),
    activityDetailUrl,
  });

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ─────────────────────────────────────────────────────────────
// 5. ACCOUNT STATUS
// ─────────────────────────────────────────────────────────────

export async function sendAccountDeactivatedEmail({
  to,
  companyName,
  logoUrl,
  cleanerName,
}: {
  to: string;
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
}) {
  const transporter = createTransporter();
  const { subject, html } = templates.getAccountDeactivatedEmail({
    companyName,
    logoUrl,
    cleanerName,
  });

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendAccountReactivatedEmail({
  to,
  companyName,
  logoUrl,
  cleanerName,
  appUrl,
}: {
  to: string;
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  appUrl: string;
}) {
  const transporter = createTransporter();
  const { subject, html } = templates.getAccountReactivatedEmail({
    companyName,
    logoUrl,
    cleanerName,
    appUrl,
  });

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ─────────────────────────────────────────────────────────────
// 6. WELCOME
// ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail({
  to,
  companyName,
  logoUrl,
  cleanerName,
  appUrl,
}: {
  to: string;
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  appUrl: string;
}) {
  const transporter = createTransporter();
  const { subject, html } = templates.getWelcomeEmail({
    companyName,
    logoUrl,
    cleanerName,
    appUrl,
  });

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ─────────────────────────────────────────────────────────────
// 7. ASSIGNMENT
// ─────────────────────────────────────────────────────────────

interface AssignmentEmailParams {
  to: string;
  companyName: string;
  logoUrl?: string;
  cleanerName: string;
  locationName: string;
  locationAddress: string;
  appUrl: string;
}

export async function sendAssignmentEmail({
  to,
  companyName,
  logoUrl,
  cleanerName,
  locationName,
  locationAddress,
  appUrl,
}: AssignmentEmailParams) {
  const transporter = createTransporter();
  const { subject, html } = templates.getAssignmentEmail({
    companyName,
    logoUrl,
    cleanerName,
    locationName,
    locationAddress,
    appUrl,
  });

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
