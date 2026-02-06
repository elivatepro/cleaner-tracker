import nodemailer from "nodemailer";

interface InviteEmailParams {
  to: string;
  inviteLink: string;
  companyName: string;
  expiresAt: string;
}

interface CheckinEmailParams {
  to: string;
  companyName: string;
  locationName: string;
  checkinTime: string;
  cleanerName?: string;
  recipientRole: "cleaner" | "admin";
}

interface CheckoutEmailParams {
  to: string;
  companyName: string;
  locationName: string;
  checkinTime: string;
  checkoutTime: string;
  durationLabel: string;
  tasksCompleted: number;
  tasksTotal: number;
  photosCount: number;
  cleanerName?: string;
  recipientRole: "cleaner" | "admin";
}

interface AssignmentEmailParams {
  to: string;
  companyName: string;
  locationName: string;
  address?: string | null;
  cleanerName?: string | null;
}

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

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
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

export async function sendInviteEmail({
  to,
  inviteLink,
  companyName,
  expiresAt,
}: InviteEmailParams) {
  const transporter = createTransporter();
  const subject = `${companyName} invitation`;
  const expiryLabel = formatExpiry(expiresAt);

  const text = [
    `You have been invited to join ${companyName}.`,
    `Use this link to create your account: ${inviteLink}`,
    `This invitation expires on ${expiryLabel}.`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #171717; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">You're invited to ${companyName}</h2>
      <p style="margin: 0 0 12px;">
        Use the link below to create your account.
      </p>
      <p style="margin: 0 0 16px;">
        <a href="${inviteLink}" style="color: #000000; font-weight: 600;">Accept invitation</a>
      </p>
      <p style="margin: 0; color: #525252; font-size: 14px;">
        This invitation expires on ${expiryLabel}.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html,
  });
}

export async function sendCheckinEmail({
  to,
  companyName,
  locationName,
  checkinTime,
  cleanerName,
  recipientRole,
}: CheckinEmailParams) {
  const transporter = createTransporter();
  const timeLabel = formatDateTime(checkinTime);
  const subject =
    recipientRole === "admin"
      ? `${cleanerName || "Cleaner"} checked in at ${locationName}`
      : `Checked in at ${locationName}`;

  const textLines = [
    recipientRole === "admin"
      ? `${cleanerName || "A cleaner"} checked in.`
      : `Your check-in is confirmed.`,
    `Location: ${locationName}`,
    `Time: ${timeLabel}`,
  ];

  const html = `
    <div style="font-family: Arial, sans-serif; color: #171717; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">${companyName} Check-in</h2>
      <p style="margin: 0 0 12px;">
        ${
          recipientRole === "admin"
            ? `${cleanerName || "A cleaner"} checked in.`
            : "Your check-in is confirmed."
        }
      </p>
      <p style="margin: 0;">
        <strong>Location:</strong> ${locationName}<br />
        <strong>Time:</strong> ${timeLabel}
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: textLines.join("\n"),
    html,
  });
}

export async function sendCheckoutEmail({
  to,
  companyName,
  locationName,
  checkinTime,
  checkoutTime,
  durationLabel,
  tasksCompleted,
  tasksTotal,
  photosCount,
  cleanerName,
  recipientRole,
}: CheckoutEmailParams) {
  const transporter = createTransporter();
  const checkinLabel = formatDateTime(checkinTime);
  const checkoutLabel = formatDateTime(checkoutTime);
  const subject =
    recipientRole === "admin"
      ? `${cleanerName || "Cleaner"} checked out at ${locationName}`
      : `Checked out at ${locationName}`;

  const textLines = [
    recipientRole === "admin"
      ? `${cleanerName || "A cleaner"} checked out.`
      : "Your checkout is complete.",
    `Location: ${locationName}`,
    `Check-in: ${checkinLabel}`,
    `Check-out: ${checkoutLabel}`,
    `Duration: ${durationLabel}`,
    `Tasks: ${tasksCompleted}/${tasksTotal}`,
    `Photos: ${photosCount}`,
  ];

  const html = `
    <div style="font-family: Arial, sans-serif; color: #171717; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">${companyName} Checkout</h2>
      <p style="margin: 0 0 12px;">
        ${
          recipientRole === "admin"
            ? `${cleanerName || "A cleaner"} checked out.`
            : "Your checkout is complete."
        }
      </p>
      <p style="margin: 0;">
        <strong>Location:</strong> ${locationName}<br />
        <strong>Check-in:</strong> ${checkinLabel}<br />
        <strong>Check-out:</strong> ${checkoutLabel}<br />
        <strong>Duration:</strong> ${durationLabel}<br />
        <strong>Tasks:</strong> ${tasksCompleted}/${tasksTotal}<br />
        <strong>Photos:</strong> ${photosCount}
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: textLines.join("\n"),
    html,
  });
}

export async function sendAssignmentEmail({
  to,
  companyName,
  locationName,
  address,
  cleanerName,
}: AssignmentEmailParams) {
  const transporter = createTransporter();
  const subject = `Assigned to ${locationName}`;

  const textLines = [
    `Hi ${cleanerName || "there"},`,
    `You have been assigned to ${locationName}.`,
  ];
  if (address) textLines.push(`Address: ${address}`);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #171717; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">New Assignment</h2>
      <p style="margin: 0 0 12px;">Hi ${cleanerName || "there"}, you have been assigned to <strong>${locationName}</strong>.</p>
      ${address ? `<p style="margin: 0 0 12px;"><strong>Address:</strong> ${address}</p>` : ""}
      <p style="margin: 0; color: #525252; font-size: 14px;">Sent from ${companyName}.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: textLines.join("\n"),
    html,
  });
}
