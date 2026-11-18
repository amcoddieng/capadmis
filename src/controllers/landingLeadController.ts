import { Request, Response } from 'express';
import { appendLeadToSheet } from '../lib/googleSheets.js';

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

const FORM_VERSION = 'landing-campus-france-v1';
const PRIVACY_VERSION = 'politique-confidentialite-v1';

const AVANCEMENTS = ['procedure_non_commencee', 'compte_cree', 'dossier_en_preparation', 'dossier_soumis'] as const;
const PROJETS = ['oui', 'en_reflexion'] as const;
const DISPONIBILITES = ['immediatement', 'dans_quelques_heures', 'demain'] as const;
const OUI_NON_JSNS = ['oui', 'non', 'je_ne_sais_pas'] as const;
const OUI_NON = ['oui', 'non'] as const;

const AVANCEMENT_LABELS: Record<string, string> = {
  procedure_non_commencee: 'Procédure non commencée',
  compte_cree: 'Compte créé',
  dossier_en_preparation: 'Dossier en préparation',
  dossier_soumis: 'Dossier soumis',
};
const PROJET_LABELS: Record<string, string> = { oui: 'Oui', en_reflexion: 'En réflexion' };
const DISPONIBILITE_LABELS: Record<string, string> = {
  immediatement: 'Immédiatement',
  dans_quelques_heures: 'Dans quelques heures',
  demain: 'Demain',
};
const OUI_NON_JSNS_LABELS: Record<string, string> = { oui: 'Oui', non: 'Non', je_ne_sais_pas: 'Je ne sais pas' };

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function str(value: unknown, max = 300): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function boolOuiNon(value: unknown): string {
  return value === true || value === 'true' || value === 'oui' ? 'Oui' : 'Non';
}

export const soumettreLandingLead = async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'inconnu';
    if (isRateLimited(ip)) {
      return res.status(429).json({ message: 'Trop de tentatives. Réessayez dans quelques minutes.' });
    }

    const body = req.body as Record<string, unknown>;

    // Honeypot anti-spam : succès simulé sans écriture dans le Sheet.
    if (str(body.site_web)) {
      return res.status(201).json({ message: 'Demande reçue' });
    }

    const nom_complet = str(body.nom_complet, 150);
    const whatsapp = str(body.whatsapp, 40);
    const email = str(body.email, 150).toLowerCase();

    if (!nom_complet || !whatsapp || !email) {
      return res.status(400).json({ message: 'Nom complet, numéro WhatsApp et adresse e-mail sont requis.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    }
    if (!/^[+\d][\d\s().-]{5,}$/.test(whatsapp)) {
      return res.status(400).json({ message: 'Numéro WhatsApp invalide (indicatif international requis, ex. +221…).' });
    }

    const avancement = str(body.avancement_campus_france);
    if (avancement && !AVANCEMENTS.includes(avancement as typeof AVANCEMENTS[number])) {
      return res.status(400).json({ message: 'Niveau d’avancement Campus France invalide.' });
    }
    const projet = str(body.projet_confirme);
    if (projet && !PROJETS.includes(projet as typeof PROJETS[number])) {
      return res.status(400).json({ message: 'Confirmation du projet invalide.' });
    }
    const disponibilite = str(body.disponibilite);
    if (disponibilite && !DISPONIBILITES.includes(disponibilite as typeof DISPONIBILITES[number])) {
      return res.status(400).json({ message: 'Disponibilité invalide.' });
    }
    const prive = str(body.etablissement_prive);
    if (prive && !OUI_NON.includes(prive as typeof OUI_NON[number])) {
      return res.status(400).json({ message: 'Valeur « établissement privé » invalide.' });
    }
    const anaq = str(body.anaq_sup);
    if (anaq && !OUI_NON_JSNS.includes(anaq as typeof OUI_NON_JSNS[number])) {
      return res.status(400).json({ message: 'Valeur « accréditation ANAQ-Sup » invalide.' });
    }

    const now = new Date();
    const dateSoumission = now.toLocaleDateString('sv-SE', { timeZone: 'Africa/Dakar' });
    const heureSoumission = now.toLocaleTimeString('sv-SE', { timeZone: 'Africa/Dakar' });
    const idSoumission = `SUB-${now.getTime().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const lead: Record<string, string> = {
      id_soumission: idSoumission,
      date_soumission: dateSoumission,
      heure_soumission: heureSoumission,
      nom_complet,
      whatsapp,
      email,
      niveau_etudes: str(body.niveau_etudes, 100),
      diplome: str(body.diplome, 150),
      annee_obtention: str(body.annee_obtention, 10),
      tentatives_bac: str(body.tentatives_bac, 10),
      etablissement: str(body.etablissement, 200),
      etablissement_prive: prive ? (prive === 'oui' ? 'Oui' : 'Non') : '',
      anaq_sup: anaq ? OUI_NON_JSNS_LABELS[anaq] : '',
      avancement_campus_france: avancement ? AVANCEMENT_LABELS[avancement] : '',
      projet_confirme: projet ? PROJET_LABELS[projet] : '',
      disponibilite: disponibilite ? DISPONIBILITE_LABELS[disponibilite] : '',
      source: str(body.source, 150),
      medium: str(body.medium, 150),
      campagne: str(body.campagne, 200),
      utm_source: str(body.utm_source, 200),
      utm_medium: str(body.utm_medium, 200),
      utm_campaign: str(body.utm_campaign, 200),
      utm_content: str(body.utm_content, 200),
      utm_term: str(body.utm_term, 200),
      consent_donnees: 'Oui',
      consent_email: boolOuiNon(body.consent_email),
      consent_sms: boolOuiNon(body.consent_sms),
      consent_whatsapp: boolOuiNon(body.consent_whatsapp),
      privacy_version: str(body.privacy_version, 50) || PRIVACY_VERSION,
      form_version: str(body.form_version, 50) || FORM_VERSION,
    };

    await appendLeadToSheet(lead);

    return res.status(201).json({ message: 'Demande enregistrée avec succès' });
  } catch (error) {
    console.error('[LandingLead] Échec de transmission vers Google Sheets :', error);
    return res.status(502).json({
      message: 'Votre demande n’a pas pu être enregistrée. Veuillez réessayer dans quelques instants ou nous contacter sur WhatsApp.',
    });
  }
};
