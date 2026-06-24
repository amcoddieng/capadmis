import { Request, Response } from 'express';
import { sendWhatsApp } from '../lib/whatsapp.js';

export const envoyerWhatsApp = async (req: Request, res: Response) => {
  try {
    const { telephone, message } = req.body as { telephone: string; message: string };

    if (!telephone || !message) {
      return res.status(400).json({ message: 'Les champs telephone et message sont requis' });
    }

    await sendWhatsApp(telephone, message);

    return res.status(200).json({ message: 'Message WhatsApp envoyé avec succès' });
  } catch (error) {
    console.error('Erreur envoi WhatsApp :', error);
    return res.status(500).json({ message: 'Échec de l\'envoi du message WhatsApp' });
  }
};
