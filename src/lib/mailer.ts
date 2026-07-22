import nodemailer from 'nodemailer';

const IONOS_USER = process.env.IONOS_USER;
const IONOS_PASSWORD = process.env.IONOS_PASSWORD;

const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.fr',
  port: 587,
  secure: false,
  auth: {
    user: IONOS_USER,
    pass: IONOS_PASSWORD,
  },
});

export interface MailOptions {
  to: string;
  subject: string;
  message?: string;
  html?: string;
}

function buildGenericEmailHtml(subject: string, message: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#1d4ed8;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 10px;color:#93c5fd;font-size:11px;font-family:Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">Plateforme d'Admission</p>
              <img src="https://pub-1252626b56fd48ee8109ad478d776b8e.r2.dev/imageProfile/logo-horizontal-3x.png" alt="CAPADMIS" width="200" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>
          <tr>
            <td style="background-color:#eff6ff;border-bottom:1px solid #dbeafe;padding:14px 40px;text-align:center;">
              <span style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:5px 18px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">${subject}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 18px;color:#1f2937;font-size:16px;font-family:Arial,sans-serif;font-weight:600;">Bonjour,</p>
              <p style="margin:0 0 8px;color:#374151;font-size:15px;font-family:Arial,sans-serif;line-height:1.7;">${message.replace(/\n/g, '<br/>')}</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;border-top:1px solid #f3f4f6;">
                <tr>
                  <td style="padding-top:24px;">
                    <p style="margin:0;color:#6b7280;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;">
                      Cordialement,<br>
                      <strong style="color:#1f2937;">L'équipe CAPADMIS</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;font-family:Arial,sans-serif;line-height:1.8;">
                © ${year} CAPADMIS &nbsp;·&nbsp; Tous droits réservés<br>
                Ce message est envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendMail({ to, subject, message, html }: MailOptions): Promise<void> {
  if (!IONOS_USER || !IONOS_PASSWORD) {
    throw new Error('Configuration SMTP manquante : IONOS_USER et/ou IONOS_PASSWORD non définis dans le fichier .env');
  }

  try {
    const info = await transporter.sendMail({
      from: `"CapAdmis" <${IONOS_USER}>`,
      to,
      subject,
      text: message ?? '',
      html: html ?? (message ? buildGenericEmailHtml(subject, message) : ''),
    });
    console.log('[Email] Envoyé avec succès à', to, '- MessageId:', info.messageId);
  } catch (err: unknown) {
    const smtpError = err as { code?: string; response?: string; command?: string; message?: string };
    console.error('[Email] Échec SMTP:', {
      to,
      subject,
      code: smtpError.code,
      response: smtpError.response,
      command: smtpError.command,
      message: smtpError.message,
    });
    throw new Error(`Échec SMTP (${smtpError.code ?? 'unknown'}): ${smtpError.response ?? smtpError.message ?? 'Erreur inconnue'}`);
  }
}
