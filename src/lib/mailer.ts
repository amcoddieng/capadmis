import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface MailOptions {
  to: string;
  subject: string;
  message?: string;
  html?: string;
}

export async function sendMail({ to, subject, message, html }: MailOptions): Promise<void> {
  await transporter.sendMail({
    from: `"CapAdmis" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: message ?? '',
    html: html ?? (message ? `<p>${message.replace(/\n/g, '<br/>')}</p>` : ''),
  });
}
