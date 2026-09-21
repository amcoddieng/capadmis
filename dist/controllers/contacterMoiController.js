import prisma from '../lib/prisma.js';
import { sendMail } from '../lib/mailer.js';
const CONTACT_RECIPIENT = process.env.CONTACT_EMAIL || 'capadmis.france@gmail.com';
const STATUTS_APPEL = ['A_APPELER', 'APPELE', 'JOINT', 'NON_JOINT'];
function buildContactEmailHtml(nom, email, telephone, sujet, message) {
    const year = new Date().getFullYear();
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Nouveau message de contact — CapAdmis</title>
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
              <span style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:5px 18px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">Nouveau message de contact</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 18px;color:#1f2937;font-size:16px;font-family:Arial,sans-serif;font-weight:600;">Bonjour,</p>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;font-family:Arial,sans-serif;line-height:1.7;">Un nouveau message a été envoyé via le formulaire de contact du site CapAdmis.</p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:24px 0;">
                <tr>
                  <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;width:120px;color:#64748b;font-size:13px;font-family:Arial,sans-serif;font-weight:600;">Nom</td>
                  <td style="padding:12px 16px;border:1px solid #e5e7eb;color:#1f2937;font-size:14px;font-family:Arial,sans-serif;">${nom}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;color:#64748b;font-size:13px;font-family:Arial,sans-serif;font-weight:600;">Email</td>
                  <td style="padding:12px 16px;border:1px solid #e5e7eb;color:#1f2937;font-size:14px;font-family:Arial,sans-serif;"><a href="mailto:${email}" style="color:#1d4ed8;text-decoration:none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;color:#64748b;font-size:13px;font-family:Arial,sans-serif;font-weight:600;">Téléphone</td>
                  <td style="padding:12px 16px;border:1px solid #e5e7eb;color:#1f2937;font-size:14px;font-family:Arial,sans-serif;">${telephone || 'Non renseigné'}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;color:#64748b;font-size:13px;font-family:Arial,sans-serif;font-weight:600;">Sujet</td>
                  <td style="padding:12px 16px;border:1px solid #e5e7eb;color:#1f2937;font-size:14px;font-family:Arial,sans-serif;">${sujet}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;color:#64748b;font-size:13px;font-family:Arial,sans-serif;font-weight:600;vertical-align:top;">Message</td>
                  <td style="padding:12px 16px;border:1px solid #e5e7eb;color:#1f2937;font-size:14px;font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</td>
                </tr>
              </table>

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
export const creerContact = async (req, res) => {
    try {
        const { nom_complet, email, telephone, sujet, message } = req.body;
        if (!nom_complet?.trim() || !email?.trim() || !sujet?.trim() || !message?.trim()) {
            return res.status(400).json({
                message: 'nom_complet, email, sujet et message sont requis',
            });
        }
        const contact = await prisma.contacter_moi.create({
            data: {
                nom_complet: nom_complet.trim(),
                email: email.trim().toLowerCase(),
                telephone: telephone?.trim() || null,
                sujet: sujet.trim(),
                message: message.trim(),
            },
        });
        try {
            await sendMail({
                to: CONTACT_RECIPIENT,
                subject: `Nouveau message de contact — ${sujet.trim()}`,
                html: buildContactEmailHtml(nom_complet.trim(), email.trim(), telephone?.trim() || null, sujet.trim(), message.trim()),
            });
        }
        catch (mailErr) {
            console.error('[Contact] Échec envoi email:', mailErr);
        }
        return res.status(201).json({
            message: 'Message de contact envoyé avec succès',
            data: contact,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const listerContacts = async (_req, res) => {
    try {
        const contacts = await prisma.contacter_moi.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ data: contacts });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const getContactById = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const contact = await prisma.contacter_moi.findUnique({ where: { id } });
        if (!contact)
            return res.status(404).json({ message: 'Contact introuvable' });
        return res.status(200).json({ data: contact });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const modifierContact = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const contact = await prisma.contacter_moi.findUnique({ where: { id } });
        if (!contact)
            return res.status(404).json({ message: 'Contact introuvable' });
        const { nom_complet, email, telephone, sujet, message } = req.body;
        const data = {};
        if (nom_complet?.trim())
            data.nom_complet = nom_complet.trim();
        if (email?.trim())
            data.email = email.trim().toLowerCase();
        if (telephone !== undefined)
            data.telephone = telephone?.trim() || null;
        if (sujet?.trim())
            data.sujet = sujet.trim();
        if (message?.trim())
            data.message = message.trim();
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'Aucun champ à mettre à jour' });
        }
        const updated = await prisma.contacter_moi.update({ where: { id }, data });
        return res.status(200).json({
            message: 'Contact mis à jour',
            data: updated,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const supprimerContact = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const contact = await prisma.contacter_moi.findUnique({ where: { id } });
        if (!contact)
            return res.status(404).json({ message: 'Contact introuvable' });
        await prisma.contacter_moi.delete({ where: { id } });
        return res.status(200).json({ message: 'Contact supprimé avec succès' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
export const toggleAppele = async (req, res) => {
    try {
        const id = parseInt(req.params['id'], 10);
        if (isNaN(id))
            return res.status(400).json({ message: 'ID invalide' });
        const contact = await prisma.contacter_moi.findUnique({ where: { id } });
        if (!contact)
            return res.status(404).json({ message: 'Contact introuvable' });
        const { statut } = req.body;
        const prochainStatut = statut ?? (contact.appele ? 'A_APPELER' : 'APPELE');
        if (!STATUTS_APPEL.includes(prochainStatut)) {
            return res.status(400).json({ message: `Statut invalide. Valeurs : ${STATUTS_APPEL.join(', ')}` });
        }
        const updated = await prisma.contacter_moi.update({
            where: { id },
            data: { statutAppel: prochainStatut, appele: prochainStatut !== 'A_APPELER' },
        });
        return res.status(200).json({
            message: 'Statut d’appel mis à jour',
            data: updated,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
//# sourceMappingURL=contacterMoiController.js.map