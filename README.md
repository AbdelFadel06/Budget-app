# Budget App

Application mobile de gestion de budget mensuel — suivi des revenus, des dépenses (planifiées/réalisées) et des catégories, avec un solde disponible calculé automatiquement.

Construite avec [Expo](https://expo.dev) (SDK 54) / React Native, [Supabase](https://supabase.com) (auth + base de données Postgres avec Row Level Security) et [React Query](https://tanstack.com/query).

## Fonctionnalités

- **Authentification** : connexion / création de compte par email + mot de passe (Supabase Auth).
- **Dashboard** : solde disponible, solde réel, revenus, dépenses réalisées, liste des dernières dépenses, répartition par catégorie (camembert).
- **Transactions** : liste des dépenses et revenus du mois, marquer une dépense planifiée comme payée, suppression.
- **Catégories** : création avec type (Utile / Plaisir), budget mensuel optionnel, icône au choix, et suivi de la progression (anneau de couleur) du budget consommé.
- Sélecteur de mois, calendrier natif pour les dates, icônes réelles (Ionicons) partout, gestion des zones sûres (encoche/barre de statut).

## Stack technique

- Expo SDK 54 / React Native 0.81 / React 19
- TypeScript
- Supabase (`@supabase/supabase-js`) — auth + Postgres + RLS
- TanStack Query (React Query) pour le cache et la synchronisation des données
- Zustand pour l'état local (mois sélectionné)
- React Navigation (bottom tabs)
- `@expo/vector-icons`, `@react-native-community/datetimepicker`, `react-native-svg`

## Prérequis

- Node.js et npm
- Un compte [Supabase](https://supabase.com) (gratuit)
- Pour tester sur téléphone : l'app [Expo Go](https://expo.dev/go), ou un build installable (voir plus bas)

## Installation

```bash
npm install
```

### Configuration Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Dans l'éditeur SQL du projet, exécute le contenu de [`supabase/schema.sql`](./supabase/schema.sql) — il crée les tables, active le Row Level Security (chaque utilisateur ne voit que ses propres données) et met en place la vue `monthly_summary` utilisée par le Dashboard.
3. Dans **Authentication > Providers > Email**, désactive "Confirm email" si tu veux que l'inscription connecte l'utilisateur immédiatement sans email de confirmation (recommandé pour une appli perso/petit groupe — sinon le lien de confirmation redirige vers `localhost`, inaccessible depuis un téléphone, sauf à configurer un deep link personnalisé).
4. Récupère l'URL du projet et la clé publique (**Project Settings > API**).

### Variables d'environnement

Crée un fichier `.env` à la racine du projet :

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

## Lancer en développement

```bash
npm start
```

Scanne le QR code avec l'app **Expo Go** (Android/iOS), ou lance directement sur un simulateur :

```bash
npm run android   # ou npm run ios
```

## Build installable (APK / App Bundle)

Le projet est configuré avec [EAS Build](https://docs.expo.dev/build/introduction/) (voir `eas.json`).

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview   # génère un .apk installable directement
```

⚠️ Les variables `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` doivent aussi être déclarées côté EAS (le fichier `.env` local n'est pas envoyé au build cloud) :

```bash
npx eas-cli env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --environment preview --visibility plaintext
npx eas-cli env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --environment preview --visibility plaintext
```

Pour un build destiné au Play Store (`.aab`) :

```bash
npx eas-cli build --platform android --profile production
```

Avant tout nouveau build, il vaut mieux vérifier que les dépendances natives sont cohérentes :

```bash
npx expo-doctor
```

## Structure du projet

```
src/
  components/   Composants réutilisables (formulaires, sélecteurs, icônes...)
  hooks/        Hooks React Query (lecture/écriture Supabase)
  navigation/   Configuration de la navigation (bottom tabs)
  screens/      Écrans (Dashboard, Transactions, Catégories, Auth)
  store/        État global léger (Zustand)
  types/        Types partagés (alignés sur le schéma SQL)
  utils/        Fonctions utilitaires (icônes de catégorie, mois, erreurs d'auth...)
supabase/
  schema.sql    Schéma SQL complet à exécuter sur un nouveau projet Supabase
```
