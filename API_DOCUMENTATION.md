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

### `PUT /api/personnel/me`
Le personnel connecté modifie son propre profil (nom, prénom, mot de passe).

**Auth :** Token personnel — tout rôle

> Pour changer le mot de passe, `mdp_actuel` est **obligatoire**.

**Body :** *(tous optionnels, au moins un requis)*
```json
{
  "prenom": "Nouveau prénom",
  "nom": "Nouveau nom",
  "mdp_actuel": "ancienmdp",
  "mdp": "nouveaumotdepasse"
}```

**Réponse `200` :**
```json
{
  "message": "Profil mis à jour",
  "personnel": { ... }
}```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | `mdp` fourni sans `mdp_actuel`, nouveau mdp < 6 caractères, ou aucun champ fourni |
| `401` | `mdp_actuel` incorrect |
| `403` | Compte bloqué |

---

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
> Pour changer le mot de passe, `mdp_actuel` est **obligatoire**.

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
  "mdp_actuel": "ancienmdp",
  "mdp": "nouveaumotdepasse"
}
```

**Erreurs spécifiques au changement de mot de passe :**
| Code | Cause |
|---|---|
| `400` | `mdp` fourni sans `mdp_actuel`, ou nouveau mdp < 6 caractères |
| `401` | `mdp_actuel` incorrect |

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

### `GET /api/dossiers/mes-dossiers`
Lister les dossiers assignés au conseiller connecté (en tant que conseiller admission **ou** visa).

**Auth :** Token personnel (tout rôle — filtré automatiquement par `personnel.id`)

**Réponse `200` :**
```json
{
  "dossiers": [
    {
      "id": 1,
      "code_dossier": "12345678",
      "etudiant": { "id": 2, "nom": "DIALLO", "prenom": "Fatou", "email": "fatou@example.com", "ville": "Dakar", "payes": "Sénégal", "lieu_de_naissance": "Dakar", "date_de_naissance": "2000-05-15T00:00:00.000Z" },
      "conseiller_admission": { "id": 3, "nom": "CONSEILLER", "prenom": "Jean", "code": "ADM001" },
      "conseiller_visa": null,
      "status": "EN_COURS_D_ETUDE",
      "status_admission": "ADMISSION_EN_COURS",
      "status_visa": "NON_DEMARRER",
      "createdAt": "2026-01-10T08:00:00.000Z",
      "updatedAt": "2026-01-12T10:30:00.000Z"
    }
  ]
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

## 🎓 Dossiers Université

Suivi des dépôts de dossiers dans des universités étrangères. Chaque entrée est liée à un dossier étudiant via `code_dossier`.

### Permissions

| Action | Conseiller admission assigné | Conseiller visa assigné | Admin / Superadmin |
|---|---|---|---|
| Créer | ✅ | ❌ | ✅ |
| Lister | ✅ *(ses dossiers)* | ✅ *(ses dossiers)* | ✅ *(tous)* |
| Voir détail | ✅ | ✅ | ✅ |
| Modifier | ✅ | ❌ | ✅ |
| Supprimer | ✅ | ❌ | ✅ |

---

### `POST /api/dossiers-universite/`
Créer un dossier université pour un étudiant.

**Auth :** Token personnel

**Body :**
```json
{
  "code_dossier": "87654321",
  "filiere": "Génie Logiciel",
  "universite": "Université Paris-Saclay",
  "pays": "France",
  "ville": "Orsay",
  "region": "Île-de-France",
  "statut": "en_attente",
  "message_universite": null
}
```

> `statut` et `message_universite` sont optionnels. `statut` défaut : `en_attente`.

**Réponse `201` :**
```json
{
  "message": "Dossier université créé avec succès",
  "dossierUniversite": {
    "id": 1,
    "code_dossier": "87654321",
    "filiere": "Génie Logiciel",
    "universite": "Université Paris-Saclay",
    "pays": "France",
    "ville": "Orsay",
    "region": "Île-de-France",
    "statut": "en_attente",
    "message_universite": null,
    "date_depot": "2026-06-17T10:00:00.000Z",
    "createdAt": "2026-06-17T10:00:00.000Z",
    "updatedAt": "2026-06-17T10:00:00.000Z",
    "dossier": {
      "id": 1,
      "code_dossier": "87654321",
      "conseiller_admission_id": 3,
      "conseiller_visa_id": null,
      "etudiant": { "id": 1, "nom": "Diallo", "prenom": "Moussa", "email": "moussa@example.com" }
    }
  }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | Champs requis manquants |
| `403` | Non autorisé (doit être le conseiller admission assigné, admin ou superadmin) |
| `404` | Dossier introuvable |

---

### `GET /api/dossiers-universite/`
Lister les dossiers université accessibles au personnel connecté.

**Auth :** Token personnel

**Réponse `200` :**
```json
{
  "dossiersUniversite": [ { ... }, { ... } ]
}
```

> Admin/superadmin : voit tout. Conseillers : voient uniquement ceux des dossiers qui leur sont assignés.

---

### `GET /api/dossiers-universite/dossier/:code_dossier`
Lister les dossiers université d'un étudiant spécifique.

**Auth :** Token étudiant **ou** token personnel

**Params :** `code_dossier` — ex: `87654321`

**Permissions :**
| Utilisateur | Condition |
|---|---|
| **Étudiant** | Doit être le propriétaire du dossier |
| **Conseiller** | Doit être assigné au dossier (admission ou visa) |
| **Admin / Superadmin** | Toujours autorisé |

**Réponse `200` :**
```json
{
  "dossiersUniversite": [
    {
      "id": 1,
      "code_dossier": "87654321",
      "filiere": "Génie Logiciel",
      "universite": "Université Paris-Saclay",
      "pays": "France",
      "ville": "Orsay",
      "region": "Île-de-France",
      "statut": "en_attente",
      "message_universite": null,
      "date_depot": "2026-06-17T10:00:00.000Z",
      "createdAt": "2026-06-17T10:00:00.000Z",
      "updatedAt": "2026-06-17T10:00:00.000Z",
      "dossier": { ... }
    }
  ]
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `403` | Accès refusé (étudiant ne possède pas ce dossier, ou conseiller non assigné) |
| `404` | Dossier introuvable |

---

### `GET /api/dossiers-universite/:id`
Détail d'un dossier université.

**Auth :** Token personnel

**Params :** `id`

**Réponse `200` :**
```json
{ "dossierUniversite": { ... } }
```

**Erreurs :**
| Code | Cause |
|---|---|
| `403` | Accès refusé (dossier non assigné) |
| `404` | Introuvable |

---

### `PATCH /api/dossiers-universite/:id`
Modifier un dossier université.

**Auth :** Token personnel

**Params :** `id`

**Body :** *(tous optionnels)*
```json
{
  "filiere": "Intelligence Artificielle",
  "universite": "Université de Montréal",
  "pays": "Canada",
  "ville": "Montréal",
  "region": "Québec",
  "statut": "accepte",
  "message_universite": "Admis avec bourse"
}
```

**Valeurs `statut` :** `accepte`, `refuse`, `en_attente`

**Réponse `200` :**
```json
{ "message": "Dossier université mis à jour", "dossierUniversite": { ... } }
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | Aucun champ fourni |
| `403` | Non autorisé (conseiller visa ou non assigné) |

---

### `DELETE /api/dossiers-universite/:id`
Supprimer un dossier université.

**Auth :** Token personnel

**Params :** `id`

**Réponse `200` :**
```json
{ "message": "Dossier université supprimé avec succès" }
```

**Erreurs :**
| Code | Cause |
|---|---|
| `403` | Non autorisé (conseiller visa ou non assigné) |
| `404` | Introuvable |

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

**Body :** *(tous optionnels sauf `code_validation` pour les étudiants)*
```json
{
  "niveau_etude": "Master 1",
  "pays_souhaite": "Canada",
  "filieres": ["Intelligence Artificielle"],
  "nombre_fois_bac": 2,
  "status": "VALIDE",
  "code_validation": "482931"
}
```

> ⚠️ Si l'appelant est un **étudiant** :
> - `code_validation` est **obligatoire** — générez-le d'abord via `POST /api/codes-temporaires/generer` avec `type: "modification_infos"`
> - Le `status` est automatiquement forcé à `EN_ATTENTE` quel que soit ce qui est envoyé
> - Le code est **consommé** après utilisation (non réutilisable)

**Flux étudiant :**
```
1. POST /api/codes-temporaires/generer  →  { email, type: "modification_infos" }
2. Récupérer le code reçu par email
3. PUT /api/infos-dossier/:code_dossier →  { ...modifications, code_validation: "482931" }
```

**Valeurs `status` (personnel uniquement) :** `EN_ATTENTE`, `VALIDE`, `INVALIDE`

**Réponse `200` :**
```json
{
  "message": "Infos dossier mises à jour",
  "infos": { ... }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | `code_validation` absent (étudiant), code invalide ou expiré |

---

## 📎 Pièces Jointes

Stockage sur **Cloudflare R2** (`capadmis-files`). Formats acceptés : **images** (JPEG, PNG, GIF, WEBP) et **PDF**, taille max **10 Mo**.

### Nommage des fichiers (généré automatiquement)
```
{codeDossier}_{type}_{etudiantId}_{timestamp}.{ext}
ex : 87654321_PASSEPORT_42_1718530012345.pdf
```

### Permissions

| Action | Étudiant | Conseiller assigné | Admin / Superadmin |
|---|---|---|---|
| Ajouter | ✅ son dossier | ❌ | ✅ tout |
| Lister | ✅ son dossier | ✅ dossiers assignés | ✅ tout |
| Consulter (URL signée 1h) | ✅ son dossier | ✅ dossiers assignés | ✅ tout |
| Remplacer fichier | ✅ son dossier | ❌ | ✅ tout |
| Modifier status | ❌ | ✅ dossiers assignés | ✅ tout |
| Supprimer | ✅ son dossier | ❌ | ✅ tout |

---

### `POST /api/pieces-jointes/`
Ajouter une pièce jointe à un dossier.

**Auth :** Token étudiant ou admin/superadmin — **Content-Type :** `multipart/form-data`

| Champ | Description |
|---|---|
| `fichier` | Fichier image ou PDF (max 10 Mo) |
| `codeDossier` | Code du dossier cible |
| `type` | Valeur `TypePieceJointe` |

**Réponse `201` :**
```json
{
  "message": "Pièce jointe ajoutée",
  "piece": {
    "id": 1,
    "nom": "87654321_PASSEPORT_42_1718530012345.pdf",
    "codeDossier": "87654321",
    "type": "PASSEPORT",
    "status": "EN_COURS_DE_VERIFICATION",
    "date_creation": "...",
    "updatedAt": "..."
  }
}
```

---

### `GET /api/pieces-jointes/dossier/:code_dossier`
Lister toutes les pièces jointes d'un dossier.

**Auth :** Token étudiant (son dossier) ou personnel (assigné ou admin/superadmin)

**Réponse `200` :**
```json
{ "pieces": [ { "id": 1, "nom": "...", "type": "PASSEPORT", "status": "EN_COURS_DE_VERIFICATION", ... } ] }
```

---

### `GET /api/pieces-jointes/:id`
Obtenir une URL de téléchargement signée valable **1 heure**.

**Auth :** Token étudiant (son dossier) ou personnel (assigné ou admin/superadmin)

**Réponse `200` :**
```json
{
  "piece": { ... },
  "url": "https://...r2.cloudflarestorage.com/...?X-Amz-Signature=...&X-Amz-Expires=3600"
}
```

---

### `PUT /api/pieces-jointes/:id`
Remplacer le fichier d'une pièce jointe. L'ancien fichier est supprimé de R2 avant upload du nouveau.

**Auth :** Token étudiant (son dossier) ou admin/superadmin — **Content-Type :** `multipart/form-data`

| Champ | Description |
|---|---|
| `fichier` | Nouveau fichier (image ou PDF) |
| `type` | *(admin uniquement)* changer le type |
| `status` | *(admin uniquement)* changer le statut |

**Réponse `200` :**
```json
{ "message": "Pièce jointe mise à jour", "piece": { ... } }
```

---

### `PATCH /api/pieces-jointes/:id/status`
Modifier le statut d'une pièce jointe.

**Auth :** Token personnel — conseiller assigné, admin ou superadmin

**Body :**
```json
{ "status": "VALIDE" }
```

**Valeurs `status` :** `EN_COURS_DE_VERIFICATION`, `A_CHANGER`, `VALIDE`

**Réponse `200` :**
```json
{ "message": "Statut mis à jour", "piece": { ..., "status": "VALIDE" } }
```

---

### `DELETE /api/pieces-jointes/:id`
Supprimer une pièce jointe (fichier R2 + enregistrement DB).

**Auth :** Token étudiant (son dossier) ou admin/superadmin

**Réponse `200` :**
```json
{ "message": "Pièce jointe supprimée" }
```

---

## 🔑 Codes Temporaires

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

### `TypePieceJointe`
| Valeur | Description |
|---|---|
| `PHOTO_PROFIL` | Photo d'identité / profil |
| `PASSEPORT` | Passeport |
| `CARTE_IDENTITE` | Carte d'identité nationale |
| `DIPLOME_BAC` | Diplôme du baccalauréat |
| `DIPLOME_LICENCE` | Diplôme de licence |
| `DIPLOME_MASTER` | Diplôme de master |
| `DIPLOME_DOCTORAT` | Diplôme de doctorat |
| `ATTESTATION` | Attestation diverse |
| `RELEVE_NOTES_BAC` | Relevé de notes — baccalauréat |
| `BULLETIN_NOTES_SECONDE` | Bulletin — Seconde |
| `BULLETIN_NOTES_PREMIERE` | Bulletin — Première |
| `BULLETIN_NOTES_TERMINALE` | Bulletin — Terminale |
| `BULLETIN_NOTES_LICENCE_1` | Bulletin — Licence 1 |
| `BULLETIN_NOTES_LICENCE_2` | Bulletin — Licence 2 |
| `BULLETIN_NOTES_LICENCE_3` | Bulletin — Licence 3 |
| `BULLETIN_NOTES_MASTER_1` | Bulletin — Master 1 |
| `BULLETIN_NOTES_MASTER_2` | Bulletin — Master 2 |
| `BULLETIN_NOTES_DOCTORAT` | Bulletin — Doctorat |
| `LETTRE_MOTIVATION` | Lettre de motivation |
| `CV` | Curriculum vitae |
| `AUTRE` | Autre document |

### `StatusPieceJointe`
| Valeur | Signification |
|---|---|
| `EN_COURS_DE_VERIFICATION` | En cours de vérification *(défaut)* |
| `A_CHANGER` | Document à modifier / remplacer — notifie l'étudiant |
| `VALIDE` | Document validé |

### `StatutDossierUniversite`
| Valeur | Signification |
|---|---|
| `accepte` | Dossier accepté par l'université |
| `refuse` | Dossier refusé |
| `en_attente` | En attente de réponse *(défaut)* |

### `TypeNotification`
| Valeur | Destinataire | Déclencheur |
|---|---|---|
| `assignation_conseiller_admission` | Étudiant | Assignation d'un conseiller admission |
| `assignation_conseiller_visa` | Étudiant | Assignation d'un conseiller visa |
| `validation_dossier` | Étudiant | Dossier passé au statut `VALIDE` |
| `change_status` | Étudiant | Tout autre changement de statut du dossier |
| `demande_document` | Étudiant | Document requis *(usage futur)* |
| `demande_changement_document` | Étudiant | Pièce jointe passée au statut `A_CHANGER` |
| `message_recu` | Tout utilisateur | Email envoyé via `POST /api/mail` |
| `assignation_dossier` | Conseiller | Dossier assigné au conseiller |

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
| Ajouter / supprimer une pièce jointe | ✅ *(son dossier)* | ❌ | ✅ | ✅ |
| Modifier statut pièce jointe | ❌ | ✅ *(si assigné)* | ✅ | ✅ |
| Consulter ses notifications | ✅ | ✅ | ✅ | ✅ |
| Recevoir notifications WebSocket | ✅ | ✅ | ✅ | ✅ |
| Envoyer / recevoir des messages | ✅ | ✅ | ✅ | ✅ |
| Créer / modifier / supprimer un dossier université | ❌ | ✅ *(si conseiller admission assigné)* | ✅ | ✅ |
| Voir les dossiers université | ❌ | ✅ *(si assigné)* | ✅ | ✅ |

---

## � Messagerie

Système de messagerie interne entre **étudiants et personnel** (et personnel ↔ personnel). Les messages sont délivrés en **temps réel via WebSocket** et persistés en base.

### `POST /api/messages`
Envoyer un message.

**Auth :** Token étudiant **ou** token personnel

**Body :**
```json
{
  "destinataire": "conseiller@capadmis.com",
  "contenu": "Bonjour, j'ai une question concernant mon dossier."
}
```

> Le destinataire doit exister en tant qu'étudiant ou personnel.  
> Le champ `contenu` peut être `null` (message sans texte).

**Réponse `201` :**
```json
{
  "message": "Message envoyé",
  "data": {
    "id": 1,
    "expediteur": "moussa@example.com",
    "destinataire": "conseiller@capadmis.com",
    "contenu": "Bonjour, j'ai une question concernant mon dossier.",
    "vu": false,
    "date_creation": "2026-06-16T15:30:00.000Z"
  }
}
```

**Erreurs :**
| Code | Cause |
|---|---|
| `400` | `destinataire` manquant |
| `404` | Destinataire introuvable |

---

### `GET /api/messages`
Lister mes conversations (une entrée par interlocuteur, triée par dernier message).

**Auth :** Token étudiant **ou** token personnel

**Réponse `200` :**
```json
{
  "conversations": [
    {
      "interlocuteur": "conseiller@capadmis.com",
      "dernier_message": "Bonjour, j'ai une question...",
      "date": "2026-06-16T15:30:00.000Z",
      "non_lus": 2
    }
  ]
}
```

---

### `GET /api/messages/non-lus`
Compter le total de messages non lus.

**Auth :** Token étudiant **ou** token personnel

**Réponse `200` :**
```json
{ "non_lus": 3 }
```

---

### `GET /api/messages/:interlocuteur`
Obtenir l'historique complet d'une conversation. Les messages reçus non lus sont **automatiquement marqués comme vus**.

**Auth :** Token étudiant **ou** token personnel

**Params :** `interlocuteur` — email de l'interlocuteur (encodé URL si nécessaire)

**Réponse `200` :**
```json
{
  "messages": [
    {
      "id": 1,
      "expediteur": "moussa@example.com",
      "destinataire": "conseiller@capadmis.com",
      "contenu": "Bonjour...",
      "vu": true,
      "date_creation": "2026-06-16T15:30:00.000Z"
    }
  ]
}
```

---

### `PATCH /api/messages/:id/vu`
Marquer manuellement un message comme vu.

**Auth :** Token étudiant **ou** token personnel

**Params :** `id`

**Réponse `200` :**
```json
{ "message": "Message marqué comme vu", "data": { ..., "vu": true } }
```

**Erreurs :**
| Code | Cause |
|---|---|
| `403` | Le message ne vous est pas destiné |
| `404` | Message introuvable |

---

## � Notifications

Les notifications sont **stockées en base de données** et délivrées simultanément :
- En **temps réel via WebSocket** si l'utilisateur est connecté
- Par **email HTML** personnalisé à chaque déclenchement

### Déclencheurs automatiques

| Événement API | Destinataire | Type notification |
|---|---|---|
| `PATCH /dossiers/:id/conseiller` (admission) | Étudiant | `assignation_conseiller_admission` |
| `PATCH /dossiers/:id/conseiller` (visa) | Étudiant | `assignation_conseiller_visa` |
| `PATCH /dossiers/:id/conseiller` | Conseiller | `assignation_dossier` |
| `PATCH /dossiers/:id/status` → `VALIDE` | Étudiant | `validation_dossier` |
| `PATCH /dossiers/:id/status` (autre) | Étudiant | `change_status` |
| `PATCH /pieces-jointes/:id/status` → `A_CHANGER` | Étudiant | `demande_changement_document` |
| `POST /mail` | Destinataire | `message_recu` |

---

### `GET /api/notifications`
Lister toutes mes notifications (plus récentes en premier).

**Auth :** Token étudiant **ou** token personnel (tout rôle)

**Réponse `200` :**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "assignation_conseiller_admission",
      "message": "Votre dossier a été assigné à un conseiller d'admission",
      "destination": "moussa@example.com",
      "lu": false,
      "date_creation": "2026-06-16T13:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/notifications/non-lues`
Obtenir le compteur de notifications non lues.

**Auth :** Token étudiant **ou** token personnel

**Réponse `200` :**
```json
{ "non_lues": 3 }
```

---

### `PATCH /api/notifications/:id/lu`
Marquer une notification comme lue.

**Auth :** Token étudiant **ou** token personnel

**Params :** `id`

**Réponse `200` :**
```json
{ "message": "Notification marquée comme lue", "notification": { ..., "lu": true } }
```

**Erreurs :**
| Code | Cause |
|---|---|
| `403` | La notification n'appartient pas à l'utilisateur connecté |
| `404` | Notification introuvable |

---

### `PATCH /api/notifications/tout-lire`
Marquer toutes mes notifications comme lues.

**Auth :** Token étudiant **ou** token personnel

**Réponse `200` :**
```json
{ "message": "Toutes les notifications marquées comme lues" }
```

---

## 🔌 WebSocket — Notifications Temps Réel

Le serveur expose **Socket.IO** sur le même port que l'API REST (`http://localhost:3000`).

### Connexion

Passer le token JWT dans `auth.token` lors du handshake :

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'votre_jwt_token' }
});

socket.on('connect', () => console.log('Connecté'));
socket.on('connect_error', (err) => console.error('Erreur WS :', err.message));
```

### Événement reçu : `notification`

```javascript
socket.on('notification', (notif) => {
  // notif = { id, type, message, lu, date_creation }
  console.log('Notification :', notif.message);
});
```

**Payload :**
```json
{
  "id": 12,
  "type": "assignation_conseiller_admission",
  "message": "Votre dossier a été assigné à un conseiller d'admission",
  "lu": false,
  "date_creation": "2026-06-16T13:25:00.000Z"
}
```

### Événement reçu : `message`

Déclenché dès qu'un utilisateur vous envoie un message via `POST /api/messages`.

```javascript
socket.on('message', (msg) => {
  // msg = { id, expediteur, contenu, vu, date_creation }
  console.log('Nouveau message de', msg.expediteur, ':', msg.contenu);
});
```

**Payload :**
```json
{
  "id": 5,
  "expediteur": "conseiller@capadmis.com",
  "contenu": "Bonjour, votre dossier est en cours d'examen.",
  "vu": false,
  "date_creation": "2026-06-16T15:30:00.000Z"
}
```

### Comportement selon la disponibilité

| Situation | WebSocket | Email | Sauvegardé en DB |
|---|---|---|---|
| Utilisateur **connecté** | ✅ Temps réel | ✅ | ✅ |
| Utilisateur **non connecté** | ❌ | ✅ | ✅ |

> Les notifications non reçues en direct restent disponibles via `GET /api/notifications`.

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
