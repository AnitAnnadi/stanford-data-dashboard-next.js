import { sendEmail } from "../template";

const APPROVER_EMAILS = (process.env.STANFORD_APPROVER_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

export async function sendStanfordApprovalRequestEmail(
  applicantName: string,
  applicantEmail: string
) {
  if (APPROVER_EMAILS.length === 0) {
    console.warn(
      "STANFORD_APPROVER_EMAILS is not set — no approval notification sent."
    );
    return;
  }

  const dashboardUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_URL ?? ""
  }/dashboard/manageStanfordAdmins`;

  const subject = `New Stanford admin request from ${applicantName}`;
  const html = `
    <p>Hi,</p>
    <p><strong>${applicantName}</strong> (${applicantEmail}) has requested a <strong>Stanford admin</strong> account on the REACH Lab Data Dashboard.</p>
    <p>This request is pending and the account cannot be used until it is approved.</p>
    <p>Please review it here: <a href="${dashboardUrl}">${dashboardUrl}</a></p>
    <p>Either approver can approve or decline the request.</p>
  `;
  const text = `${applicantName} (${applicantEmail}) requested a Stanford admin account. Review it at ${dashboardUrl}`;

  await sendEmail({ to: APPROVER_EMAILS.join(","), subject, html, text });
}

export async function sendStanfordApprovedEmail(to: string, name: string) {
  const subject = "Your Stanford admin request has been approved";
  const html = `
    <p>Hi ${name},</p>
    <p>Your request for a <strong>Stanford admin</strong> account has been <strong>approved</strong>.</p>
    <p>You can now log in to the REACH Lab Data Dashboard.</p>
    <p>Thank you for being part of REACH Lab!</p>
  `;
  const text = `Hi ${name}, your Stanford admin request was approved. You can now log in.`;
  await sendEmail({ to, subject, html, text });
}

export async function sendStanfordDeclinedEmail(to: string, name: string) {
  const subject = "Your Stanford admin request was declined";
  const html = `
    <p>Hi ${name},</p>
    <p>We’re sorry, but your request for a <strong>Stanford admin</strong> account was declined.</p>
    <p>If you have questions, please reach out to support.</p>
  `;
  const text = `Hi ${name}, your Stanford admin request was declined.`;
  await sendEmail({ to, subject, html, text });
}
