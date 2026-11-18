# Landing page « Campus France » — connexion Google Sheets

## Méthode de connexion

Le formulaire de la landing page (`/campus-france`) envoie chaque soumission au backend
`POST /api/landing-leads`, qui écrit **une nouvelle ligne** dans l'onglet
`HISTORIQUE FORMULAIRES` du Google Sheets CRM via l'API Google Sheets REST
(`spreadsheets.values.append`, `insertDataOption=INSERT_ROWS`).

Aucune autre feuille n'est lue ou modifiée. Aucune déduplication n'est effectuée :
chaque soumission crée une ligne, les lignes existantes ne sont jamais écrasées.

## Autorisations nécessaires

1. Créer un **compte de service** dans Google Cloud (projet CapAdmis).
2. Activer l'API **Google Sheets** sur ce projet.
3. Générer une **clé JSON** du compte de service.
4. **Partager le Google Sheet en modification** avec l'adresse e-mail du compte de
   service (`client_email` de la clé).
5. Renseigner les variables d'environnement backend :

   ```
   GOOGLE_SHEETS_CLIENT_EMAIL=...@....iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEETS_SPREADSHEET_ID=1j_CjsSYtF_gsky_XGxAlbSfEhFZCdrAKaA1qVD5my0Q
   GOOGLE_SHEETS_TAB=HISTORIQUE FORMULAIRES
   ```

Le jeton OAuth est signé côté serveur (JWT RS256 via `jsonwebtoken`) et mis en cache
1 h ; aucune bibliothèque Google supplémentaire n'est requise.

## Correspondance champs ↔ colonnes

Au moment de l'écriture, le backend lit d'abord la **ligne d'en-têtes** (ligne 1) de
`HISTORIQUE FORMULAIRES`, normalise chaque intitulé (minuscules, sans accents ni
ponctuation) et ne remplit que les colonnes reconnues — voir `HEADER_ALIASES` dans
`src/lib/googleSheets.ts`. Les colonnes non reconnues restent vides ; les champs sans
colonne correspondante ne sont pas écrits.

**Mapping vérifié en production le 18/11/2026** contre les en-têtes réels de l'onglet
(27 colonnes remplies, `ID Prospect` laissé vide — réservé à la phase 2 CRM) :
`ID Soumission` ← `SUB-XXXXXXXX-XXXXX` généré, `Date de soumission` ← `YYYY-MM-DD` (Dakar),
`Heure de soumission` ← `HH:MM:SS`, `Consentement au traitement des données` ← `Oui`,
`Medium` écrit aussi dans `Support / Medium d'acquisition`.

| Champ formulaire / payload | Colonne(s) visée(s) |
| --- | --- |
| `date_soumission` | Date et heure de soumission (format `AAAA-MM-JJ HH:MM:SS`, fuseau Dakar) |
| `nom_complet` | Nom complet |
| `whatsapp` | Numéro WhatsApp / Téléphone (écrit en RAW pour préserver l'indicatif `+221`) |
| `email` | Adresse e-mail |
| `niveau_etudes` | Niveau d'études actuel |
| `diplome` | Diplôme obtenu ou préparé |
| `annee_obtention` | Année d'obtention du diplôme |
| `tentatives_bac` | Nombre de tentatives au BAC |
| `etablissement` | Établissement fréquenté |
| `etablissement_prive` | Établissement privé (`Oui`/`Non`) |
| `anaq_sup` | Accréditation ANAQ-Sup (`Oui`/`Non`/`Je ne sais pas`) |
| `avancement_campus_france` | Niveau d'avancement de la procédure Campus France |
| `projet_confirme` | Confirmation du projet d'études en France |
| `disponibilite` | Disponibilité pour être contacté |
| `source`, `medium`, `campagne` | Source / Support-Medium / Nom de la campagne |
| `utm_*` | UTM Source / Medium / Campaign / Content / Term |
| `consent_email`, `consent_sms`, `consent_whatsapp` | Consentements (`Oui`/`Non`, cases décochées par défaut) |
| `privacy_version` | Version de la politique de confidentialité (`politique-confidentialite-v1`) |
| `form_version` | Version du formulaire (`landing-campus-france-v1`) |

Pour ajouter un intitulé de colonne différent, compléter `HEADER_ALIASES`.

## Traitement des erreurs

- Échec d'authentification Google ou d'écriture Sheets → `502`, message demandant de
  réessayer ; **aucun message de succès n'est affiché** au candidat.
- Champs invalides → `400` ; plus de 10 soumissions / 10 min / IP → `429`.
- Champ honeypot `site_web` rempli → accusé de réception simulé, **aucune écriture**.
- Après succès, le candidat est redirigé vers `/merci` (page de remerciement dédiée).

## Tests à réaliser avant mise en production

- Soumissions avec les 3 consentements acceptés, tous refusés, puis mixtes.
- Vérifier que chaque soumission crée une **nouvelle** ligne dans `HISTORIQUE FORMULAIRES`.
- Vérifier les numéros `+221…` préservés, les dates/heures et les colonnes de consentement.
- Vérifier la récupération des paramètres `utm_*`, `source`, `medium`, `campagne` depuis l'URL.
- Vérifier le lien vers `/confidentialite`, le rendu mobile/desktop, et le comportement
  en cas d'indisponibilité de l'API Google Sheets (message d'erreur, pas de faux succès).
- Ne pas utiliser de vraies données personnelles pour les tests.
