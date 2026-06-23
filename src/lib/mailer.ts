import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.fr',
  port: 587,
  secure: false,
  auth: {
    user: process.env.IONOS_USER,
    pass: process.env.IONOS_PASSWORD,
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
    from: `"CapAdmis" <${process.env.IONOS_USER}>`,
    to,
    subject,
    text: message ?? '',
    html: html ?? (message ? `<p>${message.replace(/\n/g, '<br/>')}</p>` : ''),
  });
}
