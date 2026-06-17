import prisma from './prisma.js';
import { sendMail } from './mailer.js';
import { emitToUser } from './socketServer.js';
const MESSAGES = {
    assignation_conseiller_admission: "Votre dossier a été assigné à un conseiller d'admission",
    assignation_conseiller_visa: 'Votre dossier a été assigné à un conseiller de visa',
    validation_dossier: 'Votre dossier a été validé',
    change_status: 'Le statut de votre dossier a été modifié',
    message_recu: 'Vous avez reçu un message, veuillez consulter votre boîte de réception dans votre espace personnel',
    demande_document: 'Un document est requis pour votre dossier, veuillez consulter votre espace personnel',
    demande_changement_document: 'Un document doit être modifié, veuillez consulter votre espace personnel',
    assignation_dossier: 'Un dossier vous a été assigné',
};
const SUBJECTS = {
    assignation_conseiller_admission: "Votre conseiller d'admission a été assigné – CAPADMIS",
    assignation_conseiller_visa: 'Votre conseiller de visa a été assigné – CAPADMIS',
    validation_dossier: 'Votre dossier a été validé – CAPADMIS',
    change_status: 'Mise à jour du statut de votre dossier – CAPADMIS',
    message_recu: 'Nouveau message reçu – CAPADMIS',
    demande_document: 'Document requis pour votre dossier – CAPADMIS',
    demande_changement_document: 'Modification de document requise – CAPADMIS',
    assignation_dossier: 'Nouveau dossier assigné – CAPADMIS',
};
const BADGES = {
    assignation_conseiller_admission: "Assignation Conseiller Admission",
    assignation_conseiller_visa: 'Assignation Conseiller Visa',
    validation_dossier: 'Dossier Validé',
    change_status: 'Mise à jour Statut',
    message_recu: 'Nouveau Message',
    demande_document: 'Document Requis',
    demande_changement_document: 'Document à Modifier',
    assignation_dossier: 'Nouveau Dossier Assigné',
};
function infoBlock(label, value, accentColor, bgColor) {
    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">
      <tr>
        <td style="background-color: ${bgColor}; border-left: 4px solid ${accentColor}; padding: 14px 18px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 4px; color: ${accentColor}; font-size: 11px; font-family: Arial,sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${label}</p>
          <p style="margin: 0; color: #1f2937; font-size: 16px; font-family: Arial,sans-serif; font-weight: 700;">${value}</p>
        </td>
      </tr>
    </table>`;
}
function buildDetails(type, extras) {
    const { codeDossier, nouveauStatut, prenomConseiller, nomConseiller } = extras;
    switch (type) {
        case 'assignation_conseiller_admission':
        case 'assignation_conseiller_visa': {
            const role = type === 'assignation_conseiller_admission' ? "Conseiller d'Admission" : 'Conseiller de Visa';
            let html = '';
            if (prenomConseiller)
                html += infoBlock(role, `${prenomConseiller} ${nomConseiller ?? ''}`, '#1d4ed8', '#eff6ff');
            if (codeDossier)
                html += infoBlock('Numéro de Dossier', codeDossier, '#1d4ed8', '#eff6ff');
            html += `<p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;">Votre conseiller prendra contact avec vous prochainement. Vous pouvez suivre l'avancement de votre dossier dans votre espace personnel.</p>`;
            return html;
        }
        case 'validation_dossier': {
            let html = infoBlock('Numéro de Dossier', codeDossier ?? '-', '#16a34a', '#f0fdf4');
            html += `<p style="color:#15803d;font-size:15px;font-family:Arial,sans-serif;font-weight:600;line-height:1.7;">Félicitations ! Votre dossier a été examiné et validé par notre équipe. La prochaine étape de votre candidature vous sera communiquée très prochainement.</p>`;
            return html;
        }
        case 'change_status': {
            let html = '';
            if (nouveauStatut)
                html += infoBlock('Nouveau Statut', nouveauStatut.replace(/_/g, ' '), '#d97706', '#fffbeb');
            if (codeDossier)
                html += infoBlock('Numéro de Dossier', codeDossier, '#1d4ed8', '#eff6ff');
            html += `<p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;">Connectez-vous à votre espace personnel pour consulter les détails de cette mise à jour.</p>`;
            return html;
        }
        case 'assignation_dossier': {
            let html = '';
            if (codeDossier)
                html += infoBlock('Numéro de Dossier', codeDossier, '#1d4ed8', '#eff6ff');
            html += `<p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;">Rendez-vous dans votre espace de travail pour consulter et traiter ce dossier.</p>`;
            return html;
        }
        case 'message_recu':
        case 'demande_document':
        case 'demande_changement_document':
            return `<p style="color:#4b5563;font-size:14px;font-family:Arial,sans-serif;line-height:1.7;">Connectez-vous à votre espace personnel pour prendre en charge cette demande.</p>`;
        default:
            return '';
    }
}
function buildEmailHtml(type, extras) {
    const prenom = extras.prenomDestinataire ?? '';
    const nom = extras.nomDestinataire ?? '';
    const salutation = prenom ? `Bonjour ${prenom} ${nom},` : 'Bonjour,';
    const year = new Date().getFullYear();
    const badge = BADGES[type];
    const message = MESSAGES[type];
    const details = buildDetails(type, extras);
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${SUBJECTS[type]}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#1d4ed8;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#93c5fd;font-size:11px;font-family:Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">Plateforme d'Admission</p>
              <h1 style="margin:0;color:#ffffff;font-size:30px;font-family:Arial,sans-serif;font-weight:800;letter-spacing:-1px;">CAPADMIS</h1>
            </td>
          </tr>

          <!-- BADGE -->
          <tr>
            <td style="background-color:#eff6ff;border-bottom:1px solid #dbeafe;padding:14px 40px;text-align:center;">
              <span style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:5px 18px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">${badge}</span>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 18px;color:#1f2937;font-size:16px;font-family:Arial,sans-serif;font-weight:600;">${salutation}</p>
              <p style="margin:0 0 8px;color:#374151;font-size:15px;font-family:Arial,sans-serif;line-height:1.7;">${message}</p>
              ${details}
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

          <!-- FOOTER -->
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
export async function envoyerNotification(type, destination, extras = {}) {
    const message = MESSAGES[type];
    const notif = await prisma.notification.create({ data: { type, message, destination } });
    emitToUser(destination, 'notification', {
        id: notif.id,
        type: notif.type,
        message: notif.message,
        lu: notif.lu,
        date_creation: notif.date_creation,
    });
    await sendMail({
        to: destination,
        subject: SUBJECTS[type],
        html: buildEmailHtml(type, extras),
    });
}
//# sourceMappingURL=notificationService.js.map