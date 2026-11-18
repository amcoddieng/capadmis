import jwt from 'jsonwebtoken';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1j_CjsSYtF_gsky_XGxAlbSfEhFZCdrAKaA1qVD5my0Q';
export const SHEET_TAB = process.env.GOOGLE_SHEETS_TAB || 'HISTORIQUE FORMULAIRES';

let cachedToken: { token: string; expiresAt: number } | null = null;

function getCredentials(): { clientEmail: string; privateKey: string } {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('Configuration Google Sheets manquante (GOOGLE_SHEETS_CLIENT_EMAIL / GOOGLE_SHEETS_PRIVATE_KEY)');
  }
  return { clientEmail, privateKey };
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const { clientEmail, privateKey } = getCredentials();
  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    { iss: clientEmail, scope: SHEETS_SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 },
    privateKey,
    { algorithm: 'RS256' }
  );

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = await res.json() as { access_token?: string; expires_in?: number; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(`Authentification Google impossible : ${data.error_description || res.status}`);
  }

  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  return data.access_token;
}

function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/* Correspondance en-têtes normalisés → clés du payload.
   Plusieurs variantes d'intitulés sont acceptées pour s'adapter
   aux colonnes existantes de HISTORIQUE FORMULAIRES. */
const HEADER_ALIASES: Record<string, string> = {
  idsoumission: 'id_soumission',
  idprospect: 'id_prospect',
  nomcomplet: 'nom_complet',
  nom: 'nom_complet',
  whatsapp: 'whatsapp',
  numerowhatsapp: 'whatsapp',
  telephone: 'whatsapp',
  numerodetelephone: 'whatsapp',
  tel: 'whatsapp',
  email: 'email',
  mail: 'email',
  adressemail: 'email',
  adresseemail: 'email',
  courriel: 'email',
  niveaudetudes: 'niveau_etudes',
  niveaudetudesactuel: 'niveau_etudes',
  niveauactuel: 'niveau_etudes',
  niveau: 'niveau_etudes',
  diplome: 'diplome',
  diplomeobtenuouprepare: 'diplome',
  diplomeobtenu: 'diplome',
  diplomeprepare: 'diplome',
  anneedobtention: 'annee_obtention',
  anneedobtentiondudiplome: 'annee_obtention',
  anneeobtention: 'annee_obtention',
  anneediplome: 'annee_obtention',
  tentativesaubac: 'tentatives_bac',
  nombredetentativesaubac: 'tentatives_bac',
  nombredefoisaubac: 'tentatives_bac',
  etablissement: 'etablissement',
  etablissementfrequente: 'etablissement',
  ecole: 'etablissement',
  etablissementprive: 'etablissement_prive',
  prive: 'etablissement_prive',
  anaqsup: 'anaq_sup',
  accreditationanaqsup: 'anaq_sup',
  accreditationanaqsupverifiee: 'anaq_sup',
  accreditation: 'anaq_sup',
  avancementcampusfrance: 'avancement_campus_france',
  niveaudavancementcampusfrance: 'avancement_campus_france',
  niveaudavancementdelaprocedurecampusfrance: 'avancement_campus_france',
  niveaudavancement: 'avancement_campus_france',
  procedurecampusfrance: 'avancement_campus_france',
  etapeprocedure: 'avancement_campus_france',
  projetconfirme: 'projet_confirme',
  projetdetudesenfranceconfirme: 'projet_confirme',
  confirmationduprojetdetudesenfrance: 'projet_confirme',
  confirmationprojet: 'projet_confirme',
  projetetudesenfrance: 'projet_confirme',
  projetdefinitif: 'projet_confirme',
  disponibilite: 'disponibilite',
  disponibilitepourêtrecontacte: 'disponibilite',
  disponibilitepouretrecontacte: 'disponibilite',
  disponibilitepourcontact: 'disponibilite',
  source: 'source',
  sourcedacquisition: 'source',
  medium: 'medium',
  support: 'medium',
  supportmedium: 'medium',
  supportmediumdacquisition: 'medium',
  supportdacquisition: 'medium',
  campagne: 'campagne',
  nomdelacampagne: 'campagne',
  campaign: 'campagne',
  utmsource: 'utm_source',
  utmmedium: 'utm_medium',
  utmcampaign: 'utm_campaign',
  utmcampagne: 'utm_campaign',
  utmcontent: 'utm_content',
  utmcontenu: 'utm_content',
  contenupublicitaireutmcontent: 'utm_content',
  utmterm: 'utm_term',
  motcleutmterm: 'utm_term',
  consentementautraitementdesdonnees: 'consent_donnees',
  consentementtraitementdonnees: 'consent_donnees',
  consentementemail: 'consent_email',
  consentemail: 'consent_email',
  emailconsent: 'consent_email',
  consentementsms: 'consent_sms',
  consentsms: 'consent_sms',
  smsconsent: 'consent_sms',
  consentementwhatsapp: 'consent_whatsapp',
  consentwhatsapp: 'consent_whatsapp',
  whatsappconsent: 'consent_whatsapp',
  politiqueconfidentialite: 'privacy_version',
  versionpolitique: 'privacy_version',
  versionpolitiqueconfidentialite: 'privacy_version',
  versionpolitiquedeconfidentialite: 'privacy_version',
  versionformulaire: 'form_version',
  versionduformulaire: 'form_version',
  formversion: 'form_version',
  datedesoumission: 'date_soumission',
  heuredesoumission: 'heure_soumission',
  datesoumission: 'date_soumission',
  dateetheuredesoumission: 'date_soumission',
  dateheuresoumission: 'date_soumission',
  timestamp: 'date_soumission',
  datesoumissionheure: 'date_soumission',
};

async function getSheetHeaders(accessToken: string): Promise<string[]> {
  const range = encodeURIComponent(`'${SHEET_TAB}'!1:1`);
  const res = await fetch(`${API_BASE}/${SPREADSHEET_ID}/values/${range}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json() as { values?: string[][]; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(`Lecture des en-têtes impossible : ${data.error?.message || res.status}`);
  }
  return data.values?.[0] || [];
}

/* Ordre de secours utilisé si la ligne d'en-têtes est vide. */
const FALLBACK_COLUMN_ORDER = [
  'date_soumission', 'nom_complet', 'whatsapp', 'email', 'niveau_etudes', 'diplome',
  'annee_obtention', 'tentatives_bac', 'etablissement', 'etablissement_prive', 'anaq_sup',
  'avancement_campus_france', 'projet_confirme', 'disponibilite',
  'source', 'medium', 'campagne', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_content', 'utm_term', 'consent_email', 'consent_sms', 'consent_whatsapp',
  'privacy_version', 'form_version',
];

export async function appendLeadToSheet(lead: Record<string, string>): Promise<void> {
  const accessToken = await getAccessToken();
  const headers = await getSheetHeaders(accessToken);

  let row: string[];
  if (headers.length > 0) {
    row = headers.map(header => {
      const key = HEADER_ALIASES[normalizeHeader(header)];
      return key ? (lead[key] ?? '') : '';
    });
  } else {
    row = FALLBACK_COLUMN_ORDER.map(key => lead[key] ?? '');
  }

  const appendRange = encodeURIComponent(`'${SHEET_TAB}'!A1`);
  const res = await fetch(
    `${API_BASE}/${SPREADSHEET_ID}/values/${appendRange}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ values: [row] }),
    }
  );
  const data = await res.json() as { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(`Écriture dans Google Sheets impossible : ${data.error?.message || res.status}`);
  }
}
