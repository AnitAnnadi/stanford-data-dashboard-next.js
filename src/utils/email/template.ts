import 'server-only';
import nodemailer from 'nodemailer';


export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL!,
    pass: process.env.EMAIL_PASSWORD!,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, text, from }: EmailOptions) {
  const mailFrom = from ?? process.env.MAIL_FROM ?? `REACH Lab <${process.env.EMAIL}>`;
  await transporter.sendMail({ from: mailFrom, to, subject, html, text });
}

