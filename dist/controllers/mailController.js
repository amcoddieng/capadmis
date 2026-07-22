import { sendMail } from '../lib/mailer.js';
import { envoyerNotification } from '../lib/notificationService.js';
export const envoyerMail = async (req, res) => {
    try {
        const { email, sujet, message } = req.body;
        if (!email || !message) {
            return res.status(400).json({ message: 'Les champs email et message sont requis' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Adresse email invalide' });
        }
        await sendMail({
            to: email,
            subject: sujet ?? 'Message de CapAdmis',
            message,
        });
        envoyerNotification('message_recu', email).catch(console.error);
        return res.status(200).json({ message: 'Email envoyé avec succès' });
    }
    catch (error) {
        const err = error;
        console.error('[MailController] Erreur envoi email :', err.message);
        if (err.message.includes('Configuration SMTP manquante')) {
            return res.status(500).json({
                message: 'Configuration email incomplète',
                detail: 'Les variables IONOS_USER et/ou IONOS_PASSWORD ne sont pas définies dans le fichier .env',
            });
        }
        if (err.message.includes('Missing credentials') || err.message.includes('EAUTH') || err.message.includes('Authentication')) {
            return res.status(500).json({
                message: 'Échec d\'authentification SMTP',
                detail: err.message,
            });
        }
        return res.status(500).json({
            message: 'Échec de l\'envoi de l\'email',
            detail: err.message,
        });
    }
};
//# sourceMappingURL=mailController.js.map