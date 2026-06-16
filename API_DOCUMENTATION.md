# 📚 Documentation API — CapAdmis

Base URL : `http://localhost:3000/api`

---

## 🔐 Authentification

Les routes protégées nécessitent un token JWT dans le header HTTP :

```
Authorization: Bearer <token>
```

### Types de tokens

| Token | Obtenu via | Contenu |
|---|---|---|
| **Token étudiant** | `POST /auth/register` ou `POST /auth/login` | `{ id, email }` |
| **Token personnel** | `POST /personnel/login` | `{ id, email, role, code }` |

---

## 👤 Auth — Étudiants

### `POST /api/auth/register`
Inscription d'un étudiant. Crée automatiquement un dossier.

**Auth :** Aucune

**Body :**
```json
{
  "nom": "Diallo",
  "prenom": "Moussa",
  "email": "moussa@example.com",
  "mdp": "motdepasse123",
  "sexe": "M",
  "ville": "Dakar",
  "payes": "Sénégal",
  "date_de_naissance": "2000-05-15",
  "lieu_de_naissance": "Dakar"
}
```

**Réponse `201` :**
```json
{
  "message": "Étudiant créé avec succès",
  "token": "<jwt>",
  "etudiant": { "id": 1, "nom": "Diallo", "prenom": "Moussa", "email": "moussa@example.com" },
  "dossier": { "id": 1, "code_dossier": "87654321" }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | Email déjà utilisé |
| `500` | Erreur serveur |

---

### `POST /api/auth/login`
Connexion d'un étudiant.

**Auth :** Aucune

**Body :**
```json
{
  "email": "moussa@example.com",
  "mdp": "motdepasse123"
}
```

**Réponse `200` :**
```json
{
  "message": "Connexion réussie",
  "token": "<jwt>",
  "etudiant": { "id": 1, "nom": "Diallo", "prenom": "Moussa", "email": "moussa@example.com" }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | Email ou mot de passe incorrect |
| `403` | Compte bloqué |

---

## 🏢 Personnel

### `POST /api/personnel/login`
Connexion d'un membre du personnel (superadmin, admin, conseiller).

**Auth :** Aucune

**Body :**
```json
{
  "email": "admin@capadmis.com",
  "mdp": "motdepasse123"
}
```

**Réponse `200` :**
```json
{
  "message": "Connexion réussie",
  "token": "<jwt>",
  "personnel": { "id": 1, "prenom": "Admin", "nom": "Principal", "code": "AB12CD", "email": "admin@capadmis.com", "role": "admin", "bloque": false }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `401` | Email ou mot de passe incorrect |
| `403` | Compte bloqué |

---

### `POST /api/personnel/create`
Créer un membre du personnel.

**Auth :** Token personnel — `admin` ou `superadmin`

> ⚠️ Un **admin** ne peut créer que des conseillers. Un **superadmin** peut aussi créer des admins.

**Body :**
```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean@capadmis.com",
  "mdp": "motdepasse123",
  "role": "conseiller_admission"
}
```

Valeurs `role` autorisées : `admin` *(superadmin uniquement)*, `conseiller_visa`, `conseiller_admission`

**Réponse `201` :**
```json
{
  "message": "Personnel créé avec succès",
  "personnel": { "id": 2, "prenom": "Jean", "nom": "Dupont", "code": "XY89ZA", "email": "jean@capadmis.com", "role": "conseiller_admission", "bloque": false }
}
```

---

### `GET /api/personnel/liste`
Liste tout le personnel sauf les superadmins.

**Auth :** Token personnel — `superadmin` uniquement

**Réponse `200` :**
```json
{
  "personnel": [
    { "id": 2, "prenom": "Jean", "nom": "Dupont", "code": "XY89ZA", "email": "jean@capadmis.com", "role": "conseiller_admission", "bloque": false }
  ]
}
```

---

### `GET /api/personnel/conseillers`
Liste uniquement les conseillers (visa et admission).

**Auth :** Token personnel — `admin` ou `superadmin`

**Réponse `200` :**
```json
{
  "conseillers": [
    { "id": 2, "prenom": "Jean", "nom": "Dupont", "code": "XY89ZA", "role": "conseiller_admission", "bloque": false }
  ]
}
```

---

### `PUT /api/personnel/:id`
Modifier un membre du personnel.

**Auth :** Token personnel — `admin` (conseillers seulement) ou `superadmin` (admins + conseillers)

**Params :** `id` — ID du personnel à modifier

**Body :** *(tous optionnels)*
```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "nouveau@capadmis.com",
  "mdp": "nouveaumotdepasse"
}
```

**Réponse `200` :**
```json
{
  "message": "Personnel mis à jour",
  "personnel": { ... }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `403` | Tentative de modifier un superadmin, ou admin sans être superadmin |
| `404` | Personnel introuvable |

---

### `DELETE /api/personnel/:id`
Supprimer un membre du personnel.

**Auth :** Token personnel — `admin` (conseillers) ou `superadmin` (admins + conseillers)

**Params :** `id`

**Réponse `200` :**
```json
{ "message": "Personnel supprimé avec succès" }
```

---

### `PATCH /api/personnel/:id/bloquer`
Bloquer ou débloquer un membre du personnel (toggle).

**Auth :** Token personnel — `admin` (conseillers) ou `superadmin` (admins + conseillers)

**Params :** `id`

**Réponse `200` :**
```json
{
  "message": "Personnel bloqué",
  "personnel": { ..., "bloque": true }
}
```

---

## 🎓 Étudiants

### `GET /api/etudiants/`
Lister tous les étudiants.

**Auth :** Token personnel — `admin` ou `superadmin`

**Réponse `200` :**
```json
{
  "etudiants": [
    { "id": 1, "nom": "Diallo", "prenom": "Moussa", "email": "moussa@example.com", "bloque": false, ... }
  ]
}
```

---

### `PUT /api/etudiants/me`
L'étudiant connecté modifie son propre profil.

**Auth :** Token étudiant

> ⚠️ Ne peut pas modifier son email via cette route. Compte bloqué → `403`.

**Body :** *(tous optionnels)*
```json
{
  "nom": "Nouveau nom",
  "prenom": "Nouveau prénom",
  "sexe": "F",
  "ville": "Thiès",
  "payes": "Sénégal",
  "date_de_naissance": "2000-01-01",
  "lieu_de_naissance": "Thiès",
  "mdp": "nouveaumotdepasse"
}
```

**Réponse `200` :**
```json
{
  "message": "Profil mis à jour",
  "etudiant": { ... }
}
```

---

### `POST /api/etudiants/`
Créer un étudiant (par admin/superadmin). Crée automatiquement un dossier.

**Auth :** Token personnel — `admin` ou `superadmin`

**Body :**
```json
{
  "nom": "Sow",
  "prenom": "Fatou",
  "email": "fatou@example.com",
  "mdp": "motdepasse123",
  "sexe": "F",
  "ville": "Ziguinchor",
  "payes": "Sénégal",
  "date_de_naissance": "1999-08-20",
  "lieu_de_naissance": "Ziguinchor"
}
```

**Réponse `201` :**
```json
{
  "message": "Étudiant créé avec succès",
  "etudiant": { ... },
  "dossier": { "id": 2, "code_dossier": "12345678" }
}
```

---

### `PUT /api/etudiants/:id`
Modifier un étudiant.

**Auth :** Token personnel — `admin` ou `superadmin`

**Params :** `id`

**Body :** *(tous optionnels — mêmes champs que la création)*

**Réponse `200` :**
```json
{
  "message": "Étudiant mis à jour",
  "etudiant": { ... }
}
```

---

### `DELETE /api/etudiants/:id`
Supprimer un étudiant (supprime aussi son dossier en cascade).

**Auth :** Token personnel — `admin` ou `superadmin`

**Params :** `id`

**Réponse `200` :**
```json
{ "message": "Étudiant supprimé avec succès" }
```

---

### `PATCH /api/etudiants/:id/bloquer`
Bloquer ou débloquer un étudiant (toggle).

**Auth :** Token personnel — `admin` ou `superadmin`

**Params :** `id`

**Réponse `200` :**
```json
{
  "message": "Étudiant bloqué",
  "etudiant": { ..., "bloque": true }
}
```

---

## 📁 Dossiers

### `GET /api/dossiers/moi`
L'étudiant connecté consulte son propre dossier.

**Auth :** Token étudiant

**Réponse `200` :**
```json
{
  "dossier": {
    "id": 1,
    "code_dossier": "87654321",
    "etudiant": { "id": 1, "nom": "Diallo", "prenom": "Moussa", "email": "moussa@example.com" },
    "conseiller_admission": null,
    "conseiller_visa": null,
    "status": "EN_COURS_D_ETUDE",
    "status_admission": null,
    "status_visa": null,
    "createdAt": "2026-06-15T12:00:00.000Z",
    "updatedAt": "2026-06-15T12:00:00.000Z"
  }
}
```

---

### `GET /api/dossiers/`
Lister tous les dossiers.

**Auth :** Token personnel — `admin` ou `superadmin`

**Réponse `200` :**
```json
{
  "dossiers": [ { ... }, { ... } ]
}
```

---

### `GET /api/dossiers/:id`
Détail d'un dossier par ID.

**Auth :** Token personnel — `admin` ou `superadmin`

**Params :** `id`

**Réponse `200` :**
```json
{
  "dossier": { ... }
}
```

---

### `POST /api/dossiers/`
Créer manuellement un dossier pour un étudiant qui n'en a pas encore.

**Auth :** Token personnel — `admin` ou `superadmin`

**Body :**
```json
{
  "etudiant_id": 5
}
```

**Réponse `201` :**
```json
{
  "message": "Dossier créé avec succès",
  "dossier": { "id": 5, "code_dossier": "11223344", ... }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `404` | Étudiant introuvable |
| `409` | Étudiant a déjà un dossier |

---

### `PATCH /api/dossiers/:id/conseiller`
Assigner un conseiller à un dossier.

**Auth :** Token personnel — `admin` ou `superadmin`

**Params :** `id`

**Body :**
```json
{
  "type": "admission",
  "conseiller_id": 3
}
```

`type` : `"admission"` ou `"visa"`

> ⚠️ Le conseiller doit avoir le rôle correspondant au type (`conseiller_admission` ou `conseiller_visa`).

**Réponse `200` :**
```json
{
  "message": "Conseiller assigné avec succès",
  "dossier": { ... }
}
```

---

### `PATCH /api/dossiers/:id/status`
Modifier le status d'un dossier.

**Auth :** Token personnel — tout rôle personnel

**Params :** `id`

**Body :** *(au moins un champ requis)*
```json
{
  "status": "VALIDE",
  "status_admission": "ADMISSION_VALIDE",
  "status_visa": "DEMANDE_VISA_EN_COURS"
}
```

**Règles d'accès :**
| Rôle | Champs autorisés | Condition |
|---|---|---|
| `superadmin` / `admin` | `status`, `status_admission`, `status_visa` | Toujours |
| `conseiller_admission` | `status_admission` uniquement | Doit être assigné au dossier |
| `conseiller_visa` | `status_visa` uniquement | Doit être assigné au dossier |

**Valeurs autorisées :**

| Champ | Valeurs |
|---|---|
| `status` | `EN_COURS_D_ETUDE`, `VALIDE`, `CHANGEMENT_A_APPORTER` |
| `status_admission` | `ADMISSION_EN_COURS`, `ADMISSION_VALIDE`, `ADMISSION_INVALIDE` |
| `status_visa` | `DEMANDE_VISA_EN_COURS`, `DEMANDE_VISA_VALIDE`, `DEMANDE_VISA_INVALIDE` |

**Réponse `200` :**
```json
{
  "message": "Status mis à jour",
  "dossier": { ... }
}
```

---

## 📋 Infos Dossier

### `POST /api/infos-dossier/`
Créer les informations académiques d'un dossier.

**Auth :** Token étudiant **ou** token personnel (`admin`, `superadmin`, conseiller assigné)

**Body :**
```json
{
  "code_dossier": "87654321",
  "niveau_etude": "Licence 3",
  "pays_souhaite": "France",
  "filieres": ["Informatique", "Génie logiciel"],
  "nombre_fois_bac": 1,
  "status": "EN_ATTENTE"
}
```

> ⚠️ Si l'appelant est un **étudiant**, le `status` est forcé à `EN_ATTENTE` quel que soit ce qui est envoyé.
> Le champ `status` est ignoré pour les étudiants.

**Réponse `201` :**
```json
{
  "message": "Infos dossier créées avec succès",
  "infos": {
    "id": 1,
    "code_dossier": "87654321",
    "niveau_etude": "Licence 3",
    "pays_souhaite": "France",
    "filieres": ["Informatique", "Génie logiciel"],
    "nombre_fois_bac": 1,
    "status": "EN_ATTENTE",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | Champs requis manquants |
| `403` | Accès refusé (dossier ne vous appartient pas, ou conseiller non assigné) |
| `409` | Infos déjà créées pour ce dossier |

---

### `GET /api/infos-dossier/:code_dossier`
Lire les informations d'un dossier.

**Auth :** Token étudiant (son propre dossier) **ou** token personnel (dossier assigné ou tout dossier pour admin/superadmin)

**Params :** `code_dossier` — ex: `87654321`

**Réponse `200` :**
```json
{
  "infos": { ... }
}
```

---

### `PUT /api/infos-dossier/:code_dossier`
Modifier les informations d'un dossier.

**Auth :** Token étudiant (son propre dossier) **ou** token personnel (dossier assigné ou tout dossier pour admin/superadmin)

**Params :** `code_dossier`

**Body :** *(tous optionnels)*
```json
{
  "niveau_etude": "Master 1",
  "pays_souhaite": "Canada",
  "filieres": ["Intelligence Artificielle"],
  "nombre_fois_bac": 2,
  "status": "VALIDE"
}
```

> ⚠️ Si l'appelant est un **étudiant**, le `status` est automatiquement mis à `EN_ATTENTE`.

**Valeurs `status` :** `EN_ATTENTE`, `VALIDE`, `INVALIDE`

**Réponse `200` :**
```json
{
  "message": "Infos dossier mises à jour",
  "infos": { ... }
}
```

---

## � Codes Temporaires

Mécanisme unique de sécurisation des opérations sensibles pour **étudiants et personnel** (admin, superadmin, conseillers).

> **Aucun token JWT requis** sur ces routes — le code temporaire reçu par email sert d'authentification.

### Flux de fonctionnement

```
1. L'utilisateur demande un code  →  POST /api/codes-temporaires/generer
2. Le système génère un code 6 chiffres valable 15 min et l'envoie par email
3. L'utilisateur reçoit le code par email
4. L'utilisateur valide ou utilise directement le code
5. Après utilisation, le code est marqué comme utilisé (ne peut pas être réutilisé)
```

---

### `POST /api/codes-temporaires/generer`
Génère et envoie un code temporaire par email.

**Auth :** Aucune

**Body :**
```json
{
  "email": "moussa@example.com",
  "type": "modification_mot_de_passe"
}
```

`type` : `"modification_mot_de_passe"` ou `"modification_infos"`

> Fonctionne pour les étudiants **et** le personnel (admin, superadmin, conseillers).

**Réponse `200` :**
```json
{ "message": "Code envoyé à moussa@example.com. Valable 15 minutes." }
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | Champs manquants ou type invalide |
| `404` | Aucun compte associé à cet email |

---

### `POST /api/codes-temporaires/valider`
Vérifie qu'un code est valide et non expiré (sans l'utiliser).

**Auth :** Aucune

**Body :**
```json
{
  "email": "moussa@example.com",
  "code": "482931",
  "type": "modification_mot_de_passe"
}
```

**Réponse `200` :**
```json
{ "message": "Code valide" }
```

**Réponse `400` :**
```json
{ "message": "Code invalide ou expiré" }
```

---

### `POST /api/codes-temporaires/modifier-mot-de-passe`
Modifie le mot de passe après validation du code temporaire.

**Auth :** Aucune (le code valide l'identité)

**Body :**
```json
{
  "email": "moussa@example.com",
  "code": "482931",
  "nouveau_mdp": "nouveaumotdepasse"
}
```

> Le `nouveau_mdp` doit contenir au moins 6 caractères.

**Réponse `200` :**
```json
{ "message": "Mot de passe modifié avec succès" }
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | Champs manquants, mot de passe trop court, code invalide/expiré/déjà utilisé |

---

### `POST /api/codes-temporaires/modifier-infos`
Modifie les informations personnelles après validation du code temporaire.

**Auth :** Aucune (le code valide l'identité)

**Body :**
```json
{
  "email": "moussa@example.com",
  "code": "482931",
  "nom": "Nouveau nom",
  "prenom": "Nouveau prénom",
  "ville": "Thiès",
  "payes": "Sénégal",
  "sexe": "M",
  "date_de_naissance": "2000-05-15",
  "lieu_de_naissance": "Thiès"
}
```

> Tous les champs de modification sont **optionnels**, au moins un est requis.
> Pour le **personnel**, seuls `nom` et `prenom` sont modifiables via cette route.

**Réponse `200` :**
```json
{ "message": "Informations mises à jour avec succès" }
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | Code invalide/expiré/déjà utilisé, aucun champ fourni |
| `404` | Utilisateur introuvable |

---

## � Énumérations

### `Role` (personnel)
| Valeur | Description |
|---|---|
| `superadmin` | Accès total, unique dans le système |
| `admin` | Gère étudiants et conseillers |
| `conseiller_admission` | Traite les admissions |
| `conseiller_visa` | Traite les visas |

### `StatusDossier`
| Valeur | Signification |
|---|---|
| `EN_COURS_D_ETUDE` | Dossier en cours de traitement *(défaut)* |
| `VALIDE` | Dossier validé |
| `CHANGEMENT_A_APPORTER` | Des modifications sont requises |

### `StatusAdmission`
| Valeur | Signification |
|---|---|
| `ADMISSION_EN_COURS` | Demande d'admission en traitement |
| `ADMISSION_VALIDE` | Admission acceptée |
| `ADMISSION_INVALIDE` | Admission refusée |

### `StatusVisa`
| Valeur | Signification |
|---|---|
| `DEMANDE_VISA_EN_COURS` | Demande de visa en traitement |
| `DEMANDE_VISA_VALIDE` | Visa accordé |
| `DEMANDE_VISA_INVALIDE` | Visa refusé |

### `StatusInfosDossier`
| Valeur | Signification |
|---|---|
| `EN_ATTENTE` | En attente de validation *(défaut)* |
| `VALIDE` | Infos validées |
| `INVALIDE` | Infos invalides / à corriger |

### `TypeCodeTemporaire`
| Valeur | Signification |
|---|---|
| `modification_mot_de_passe` | Code pour réinitialiser le mot de passe |
| `modification_infos` | Code pour modifier les informations personnelles |

### `TypeUtilisateur` (interne)
| Valeur | Signification |
|---|---|
| `etudiant` | L'utilisateur est un étudiant |
| `personnel` | L'utilisateur est un membre du personnel |

---

## 🔒 Matrice des permissions

| Action | Étudiant | Conseiller | Admin | Superadmin |
|---|---|---|---|---|
| S'inscrire / Se connecter | ✅ | — | — | — |
| Modifier son propre profil | ✅ | — | — | — |
| Consulter son dossier | ✅ | — | — | — |
| Créer/modifier ses infos dossier | ✅ *(status forcé EN_ATTENTE)* | ✅ *(si assigné)* | ✅ | ✅ |
| Gérer les étudiants (CRUD, bloquer) | ❌ | ❌ | ✅ | ✅ |
| Gérer les conseillers (CRUD, bloquer) | ❌ | ❌ | ✅ | ✅ |
| Gérer les admins (CRUD, bloquer) | ❌ | ❌ | ❌ | ✅ |
| Assigner un conseiller à un dossier | ❌ | ❌ | ✅ | ✅ |
| Modifier status dossier | ❌ | ✅ *(son champ uniquement, si assigné)* | ✅ | ✅ |
| Lister tout le personnel | ❌ | ❌ | ❌ | ✅ |
| Lister les conseillers | ❌ | ❌ | ✅ | ✅ |
| Demander un code temporaire | ✅ | ✅ | ✅ | ✅ |
| Modifier mdp via code temporaire | ✅ | ✅ | ✅ | ✅ |
| Modifier infos via code temporaire | ✅ | ✅ *(nom, prenom)* | ✅ *(nom, prenom)* | ✅ *(nom, prenom)* |

---

## ⚠️ Codes d'erreur communs

| Code HTTP | Signification |
|---|---|
| `400` | Données invalides ou manquantes |
| `401` | Token absent |
| `403` | Token invalide/expiré, compte bloqué, ou accès non autorisé |
| `404` | Ressource introuvable |
| `409` | Conflit (email déjà utilisé, dossier déjà existant…) |
| `500` | Erreur interne du serveur |
