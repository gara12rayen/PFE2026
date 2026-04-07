# TalentFlow ATS — Frontend (React + Tailwind CSS)

## Structure des fichiers

```
talentflow_frontend/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── index.html
└── src/
    ├── index.js                        ← Point d'entrée React
    ├── index.css                       ← Tailwind + classes custom
    ├── App.jsx                         ← Router principal (toutes les routes)
    ├── api/
    │   └── index.js                    ← Axios + tous les appels API
    ├── context/
    │   └── AuthContext.jsx             ← État global (user, token, login/logout)
    ├── utils/
    │   └── helpers.js                  ← Formatage dates, badges, initiales
    ├── components/
    │   ├── ui/index.jsx                ← Button, Input, Modal, Badge, Avatar…
    │   └── layout/
    │       ├── AppLayout.jsx           ← Topbar + Sidebar par rôle
    │       └── ProtectedRoute.jsx      ← Garde d'authentification
    └── pages/
        ├── auth/AuthPage.jsx           ← Login + Inscription (split screen)
        ├── Dashboard.jsx               ← 3 dashboards selon le rôle
        ├── ProfilePage.jsx             ← Profil partagé tous rôles
        ├── candidate/
        │   ├── OffersPage.jsx          ← Liste offres + modal postuler
        │   ├── MyApplicationsPage.jsx  ← Mes candidatures + répondre entretien
        │   └── NotificationsPage.jsx   ← Notifications
        ├── rh/
        │   ├── ManageOffersPage.jsx    ← CRUD offres
        │   └── ApplicationsPage.jsx    ← Réviser candidatures + score
        └── admin/
            ├── AdminUsersPage.jsx      ← Gestion utilisateurs
            └── AdminOffersPage.jsx     ← Vue lecture toutes les offres
```

---

## Installation

### Prérequis
- Node.js 18+ installé
- Le backend FastAPI lancé sur http://localhost:8000

### 1. Installer les dépendances

```bash
cd talentflow_frontend
npm install
```

### 2. Lancer en mode développement

```bash
npm start
```

L'application s'ouvre automatiquement sur → **http://localhost:3000**

### 3. Build de production

```bash
npm run build
```

---

## Pages et accès par rôle

| Page                    | URL                   | Rôle(s)              |
|-------------------------|-----------------------|----------------------|
| Connexion / Inscription | /login                | Public               |
| Tableau de bord         | /dashboard            | Tous                 |
| Offres d'emploi         | /offers               | Candidat             |
| Mes candidatures        | /my-applications      | Candidat             |
| Notifications           | /notifications        | Candidat             |
| Gestion des offres      | /manage-offers        | RH, Admin            |
| Candidatures            | /applications         | RH, Admin            |
| Utilisateurs            | /admin/users          | Admin                |
| Toutes les offres       | /admin/offers         | Admin                |
| Mon profil              | /profile              | Tous                 |

---

## Comptes de démonstration

| Rôle       | Email                 | Mot de passe |
|------------|-----------------------|--------------|
| Candidat   | candidate@demo.com    | demo123      |
| RH Manager | rh@demo.com           | demo123      |
| Admin      | admin@demo.com        | demo123      |

---

## Technologies utilisées

- **React 18** avec hooks (useState, useEffect, useCallback, useContext)
- **React Router v6** pour la navigation et les routes protégées
- **Tailwind CSS v3** pour le style
- **Axios** pour les appels API avec intercepteurs JWT
- **Context API** pour l'état global (authentification)
- **react-hot-toast** pour les notifications visuelles
- **lucide-react** pour les icônes
