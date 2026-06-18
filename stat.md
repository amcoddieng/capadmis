# 📊 Documentation API — Tableau de Bord (Dashboard)

Base URL : `http://localhost:3000/api`

---

## 🔐 Authentification

Toutes les routes du dashboard nécessitent un **Access Token** personnel dans le header :

```
Authorization: Bearer <accessToken>
```

---

## 📈 Admin Dashboard

### `GET /api/dashboard/admin`

Retourne les statistiques globales de la plateforme.

**Auth :** Token personnel — rôle `admin` ou `superadmin`

**Réponse `200` :**

```json
{
  "totalEtudiants": 150,
  "totalDossiers": 148,
  "totalPersonnel": 12,
  "personnelParRole": [
    { "role": "admin", "count": 2 },
    { "role": "conseiller_admission", "count": 5 },
    { "role": "conseiller_visa", "count": 5 }
  ],
  "dossiersParStatus": [
    { "status": "non_demarre", "count": 30 },
    { "status": "EN_COURS_D_ETUDE", "count": 80 },
    { "status": "VALIDE", "count": 28 },
    { "status": "CHANGEMENT_A_APPORTER", "count": 10 }
  ],
  "dossiersParStatusAdmission": [
    { "status": "ADMISSION_EN_COURS", "count": 50 },
    { "status": "ADMISSION_VALIDE", "count": 20 },
    { "status": "ADMISSION_INVALIDE", "count": 5 }
  ],
  "dossiersParStatusVisa": [
    { "status": "NON_DEMARRER", "count": 40 },
    { "status": "DEMANDE_VISA_EN_COURS", "count": 25 },
    { "status": "DEMANDE_VISA_VALIDE", "count": 15 },
    { "status": "DEMANDE_VISA_INVALIDE", "count": 3 }
  ],
  "totalDossiersUniversite": 200,
  "dossiersUniversiteParStatut": [
    { "statut": "en_attente", "count": 120 },
    { "statut": "accepte", "count": 60 },
    { "statut": "refuse", "count": 20 }
  ],
  "totalMessagesNonLus": 45,
  "totalNotificationsNonLues": 12
}
```

**Description des champs :**

| Champ | Description |
|---|---|
| `totalEtudiants` | Nombre total d'étudiants inscrits |
| `totalDossiers` | Nombre total de dossiers créés |
| `totalPersonnel` | Nombre de membres du personnel (hors superadmin) |
| `personnelParRole` | Répartition du personnel par rôle |
| `dossiersParStatus` | Répartition des dossiers par statut général |
| `dossiersParStatusAdmission` | Répartition des dossiers par statut d'admission |
| `dossiersParStatusVisa` | Répartition des dossiers par statut de visa |
| `totalDossiersUniversite` | Nombre total de dossiers universitaires déposés |
| `dossiersUniversiteParStatut` | Répartition des dossiers universitaires par statut |
| `totalMessagesNonLus` | Nombre total de messages non lus sur la plateforme |
| `totalNotificationsNonLues` | Nombre total de notifications non lues |

**Erreurs :**

| Code | Cause |
|---|---|
| `401` | Token manquant ou invalide |
| `403` | Rôle insuffisant (réservé aux admins et superadmins) |
| `500` | Erreur serveur |

---

## 👤 Conseiller Dashboard

### `GET /api/dashboard/conseiller`

Retourne les statistiques des dossiers assignés au conseiller connecté.

**Auth :** Token personnel — rôle `conseiller_admission` ou `conseiller_visa`

**Réponse `200` :**

```json
{
  "totalDossiersAssignes": 25,
  "dossiersParStatus": [
    { "status": "non_demarre", "count": 5 },
    { "status": "EN_COURS_D_ETUDE", "count": 15 },
    { "status": "VALIDE", "count": 4 },
    { "status": "CHANGEMENT_A_APPORTER", "count": 1 }
  ],
  "dossiersParStatusAdmission": [
    { "status": "ADMISSION_EN_COURS", "count": 10 },
    { "status": "ADMISSION_VALIDE", "count": 5 },
    { "status": "ADMISSION_INVALIDE", "count": 1 }
  ],
  "dossiersParStatusVisa": [
    { "status": "NON_DEMARRER", "count": 8 },
    { "status": "DEMANDE_VISA_EN_COURS", "count": 10 },
    { "status": "DEMANDE_VISA_VALIDE", "count": 5 },
    { "status": "DEMANDE_VISA_INVALIDE", "count": 2 }
  ],
  "totalDossiersUniversite": 35,
  "dossiersUniversiteParStatut": [
    { "statut": "en_attente", "count": 20 },
    { "statut": "accepte", "count": 10 },
    { "statut": "refuse", "count": 5 }
  ],
  "messagesNonLus": 8,
  "notificationsNonLues": 3
}
```

**Description des champs :**

| Champ | Description |
|---|---|
| `totalDossiersAssignes` | Nombre de dossiers où le conseiller est assigné (admission ou visa) |
| `dossiersParStatus` | Répartition des dossiers assignés par statut général |
| `dossiersParStatusAdmission` | Répartition des dossiers assignés par statut d'admission |
| `dossiersParStatusVisa` | Répartition des dossiers assignés par statut de visa |
| `totalDossiersUniversite` | Nombre de dossiers universitaires des étudiants assignés |
| `dossiersUniversiteParStatut` | Répartition des dossiers universitaires par statut |
| `messagesNonLus` | Messages non lus adressés au conseiller |
| `notificationsNonLues` | Notifications non lues adressées au conseiller |

**Erreurs :**

| Code | Cause |
|---|---|
| `401` | Token manquant ou invalide |
| `403` | Rôle insuffisant (réservé aux conseillers admission/visa) |
| `500` | Erreur serveur |

---

## 📋 Récapitulatif des Endpoints

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin / Superadmin | Statistiques globales de la plateforme |
| `GET` | `/api/dashboard/conseiller` | Conseiller | Statistiques des dossiers assignés |

---

## 💡 Suggestions d'affichage Frontend

### Admin Dashboard (React exemple)

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/dashboard/admin').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Tableau de bord Admin</h2>
      <div className="cards">
        <div>👨‍🎓 Étudiants : {stats.totalEtudiants}</div>
        <div>📁 Dossiers : {stats.totalDossiers}</div>
        <div>👥 Personnel : {stats.totalPersonnel}</div>
        <div>🎓 Dossiers universitaires : {stats.totalDossiersUniversite}</div>
        <div>💬 Messages non lus : {stats.totalMessagesNonLus}</div>
        <div>🔔 Notifications : {stats.totalNotificationsNonLues}</div>
      </div>

      <h3>Répartition des dossiers par statut</h3>
      <ul>
        {stats.dossiersParStatus.map((s) => (
          <li key={s.status}>{s.status} : {s.count}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Conseiller Dashboard (React exemple)

```jsx
function ConseillerDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/dashboard/conseiller').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Mon tableau de bord</h2>
      <div className="cards">
        <div>📁 Mes dossiers : {stats.totalDossiersAssignes}</div>
        <div>🎓 Dossiers universitaires : {stats.totalDossiersUniversite}</div>
        <div>💬 Messages non lus : {stats.messagesNonLus}</div>
        <div>🔔 Notifications : {stats.notificationsNonLues}</div>
      </div>
    </div>
  );
}
```
