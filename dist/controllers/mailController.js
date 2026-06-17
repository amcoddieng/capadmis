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
        console.error('Erreur envoi email :', error);
        return res.status(500).json({ message: 'Échec de l\'envoi de l\'email' });
    }
};
//# sourceMappingURL=mailController.js.map