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
  message: string;
}

export async function sendMail({ to, subject, message }: MailOptions): Promise<void> {
  await transporter.sendMail({
    from: `"CapAdmis" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: message,
    html: `<p>${message.replace(/\n/g, '<br/>')}</p>`,
  });
}
