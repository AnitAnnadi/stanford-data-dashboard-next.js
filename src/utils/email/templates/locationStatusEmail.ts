import { sendEmail } from "../template";

export async function sendLocationApprovedEmail(to: string, name: string, locationName: string) {
  const subject = `Your location "${locationName}" has been approved`;
  const html = `
    <p>Hi ${name},</p>
    <p>Your location request for <strong>${locationName}</strong> has been <strong>approved</strong>.</p>
    <p>You can now access your dashboard and manage your data.</p>
    <p>Thank you for being part of REACH Lab!</p>
  `;
  const text = `Hi ${name}, your location "${locationName}" was approved.`;
  await sendEmail({ to, subject, html, text });
}

export async function sendLocationDeclinedEmail(to: string, name: string, locationName: string) {
  const subject = `Your location "${locationName}" was declined`;
  const html = `
    <p>Hi ${name},</p>
    <p>We’re sorry, but your location request for <strong>${locationName}</strong> was declined.</p>
    <p>If you have questions, please reach out to support.</p>
  `;
  const text = `Hi ${name}, your location "${locationName}" was declined.`;
  await sendEmail({ to, subject, html, text });
}
