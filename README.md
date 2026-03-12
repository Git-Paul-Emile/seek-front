# Seek - Frontend Application

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=flat&logo=tailwind-css)

Application frontend de la plateforme de location immobilière Seek. Développée avec React, TypeScript et Vite.

## 📋 Description

Le frontend Seek est une application web moderne permettant aux utilisateurs de :
- Rechercher et consulter des biens immobiliers au Sénégal
- Gérer leur profil et leurs annonces
- Consulter et signer des contrats de location
- Suivre leurs paiements et notifications
- Visualiser des biens sur une carte interactive

## 🛠 Technologies

- **Framework** : React 18
- **Build Tool** : Vite 5
- **Language** : TypeScript 5.8+
- **Styling** : Tailwind CSS 3
- **UI Components** : shadcn/ui (Radix UI)
- **State Management** : TanStack React Query
- **Routing** : React Router DOM 6
- **Forms** : React Hook Form + Zod
- **Maps** : Leaflet + React Leaflet
- **Charts** : Recharts
- **HTTP Client** : Axios
- **Date Handling** : date-fns

## 📁 Structure du Projet

```
front/
├── public/                  # Assets statiques
├── src/
│   ├── api/                # Configurations API et requêtes
│   ├── assets/            # Images et ressources
│   ├── components/        # Composants React réutilisables
│   │   ├── ui/           # Composants shadcn/ui
│   │   └── ...           # Composants métier
│   ├── config/           # Configuration de l'application
│   ├── context/          # Contextes React (Auth, Theme)
│   ├── data/             # Données statiques
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires et configurations
│   ├── pages/            # Pages de l'application
│   ├── types/            # Types TypeScript
│   ├── App.tsx           # Composant principal
│   └── main.tsx          # Point d'entrée
├── .env.local            # Variables d'environnement locales
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Installation

### Prérequis
- Node.js 20+
- npm ou bun

### Étapes

1. **Installer les dépendances**
```bash
npm install
```
Ou avec bun :
```bash
bun install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

3. **Éditer .env.local**
```env
VITE_API_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=votre-cloud
```

## ▶️ Démarrage

### Mode développement
```bash
npm run dev
```
L'application démarre sur `http://localhost:5173`

### Mode production
```bash
npm run build
npm run preview
```

### Tests
```bash
npm run test        # Exécuter les tests une fois
npm run test:watch # Mode watch
```

## 🎨 Design System

L'application utilise **shadcn/ui** comme base pour les composants UI. Les composants sont personnalisés avec Tailwind CSS.

### Composants principaux
- Bouttons, Inputs, Formulaires
- Dialogs et Modales
- Dropdowns et Menus
- Cartes et Tableaux
- Navigation (Tabs, NavigationMenu)
- Feedback (Toasts, Alerts)
- Avatar, Badge, Skeleton
- Calendar, DatePicker

### Thème
L'application supporte le mode sombre via `next-themes`.

## 📡 Intégration API

Le frontend communique avec l'API backend via Axios. Voir [`src/api/`](src/api/) pour les configurations.

### Configuration principale
```typescript
// src/api/axios.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
```

## 🗺️ Cartes et Géographie

L'application utilise Leaflet pour l'affichage des cartes et la localisation des biens. Les données géographiques incluent les villes et quartiers du Sénégal.

## 📱 Pages Principales

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Page d'accueil avec recherche |
| Biens | `/biens` | Liste des annonces |
| Détail Bien | `/biens/:id` | Fiche détail d'un bien |
| Connexion | `/login` | Authentification |
| Inscription | `/register` | Création de compte |
| Dashboard | `/dashboard` | Tableau de bord utilisateur |
| Mes Biens | `/dashboard/biens` | Gestion des annonces |
| Contrats | `/dashboard/contrats` | Liste des contrats |
| Profil | `/dashboard/profile` | Édition du profil |

## 🔧 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrage en mode développement |
| `npm run build` | Build production |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Analyse du code |
| `npm run test` | Exécution des tests |

## 🔐 Authentification

L'authentification utilise des cookies JWT. Le contexte d'authentification gère :
- Connexion / Déconnexion
- Vérification du token
- Gestion des rôles utilisateur
- Redirections selon le statut

## 📦 Libraries Principales

| Package | Version | Usage |
|---------|---------|-------|
| react | ^18.3.1 | Framework UI |
| react-router-dom | ^6.30.1 | Routage |
| @tanstack/react-query | ^5.83.0 | Gestion state serveur |
| axios | ^1.13.5 | HTTP client |
| zod | ^3.25.76 | Validation |
| react-hook-form | ^7.61.1 | Gestion formulaires |
| tailwindcss | ^3.4.17 | Styling |
| leaflet | ^1.9.4 | Cartes |
| recharts | ^2.15.4 | Graphiques |
| framer-motion | ^12.33.0 | Animations |
| lucide-react | ^0.462.0 | Icônes |

## 🌐 Configuration Production

Pour le déploiement, configurez les variables d'environnement dans `.env.production` :
```env
VITE_API_URL=https://api.seek.sn
VITE_CLOUDINARY_CLOUD_NAME=votre-cloud
```

## 📄 Licence

Tous droits réservés - Seek Senegal
