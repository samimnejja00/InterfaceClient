# InterfaceClient (Portail Public) — Explication complète pour la soutenance PFE

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture globale](#2-architecture-globale)
3. [Stack technique et dépendances](#3-stack-technique-et-dépendances)
4. [Le Backend (Node.js / Express)](#4-le-backend-nodejs--express)
5. [Gestion de l'Authentification (JWT)](#5-gestion-de-lauthentification-jwt)
6. [Processus de soumission de dossier](#6-processus-de-soumission-de-dossier)
7. [Suivi des dossiers et Historique](#7-suivi-des-dossiers-et-historique)
8. [Système de Notifications et Emailing](#8-système-de-notifications-et-emailing)
9. [Interface Frontend (React / Vite)](#9-interface-frontend-react--vite)
10. [Base de Données et Sécurité](#10-base-de-données-et-sécurité)
11. [Points forts et innovations](#11-points-forts-et-innovations)
12. [Conclusion](#12-conclusion)

---

## 1. Vue d'ensemble

Le projet **InterfaceClient** est le portail web public dédié aux clients de COMAR Assurances. Contrairement au portail interne (PrestaTrack) utilisé par les collaborateurs, cette plateforme permet aux clients externes de :
- Créer un compte sécurisé.
- Soumettre de nouveaux dossiers de prestations avec des pièces justificatives.
- Suivre l'état d'avancement de leurs dossiers en temps réel.
- Recevoir des notifications par email à chaque étape clé du traitement.
- Gérer leur profil et réinitialiser leur mot de passe.

---

## 2. Architecture globale

Contrairement au portail interne qui communique directement avec Supabase, l'InterfaceClient adopte une architecture **Client-Serveur** classique par mesure de sécurité (les clients externes ne doivent pas interagir directement avec la base de données).

```
┌─────────────────────────────────────────────────────────┐
│                 Frontend (React / Vite)                  │
│       (Pages Publiques & Protégées, LocalStorage)        │
└──────────────────────┬──────────────────────────────────┘
                       │ Requêtes HTTP (avec JWT Bearer)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (Node.js / Express)              │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Middlewares │  │ Routes API   │  │ Services      │  │
│  │ (Auth JWT)  │  │ (Clients,    │  │ (Email,       │  │
│  │             │  │ Dossiers...) │  │ Supabase)     │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                  │          │
└─────────┼────────────────┼──────────────────┼──────────┘
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                 Supabase (PostgreSQL, Storage)           │
│           (Communication via Service Role Key)           │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Stack technique et dépendances

### Frontend
- **React 18 & Vite** : Construction de la SPA (Single Page Application).
- **Tailwind CSS** : Stylisation rapide et responsive.
- **LocalStorage** : Stockage du token JWT (`client_token`) et des données de session (`client_data`).

### Backend
- **Node.js & Express** : Serveur API.
- **Bcrypt.js** : Hachage sécurisé des mots de passe.
- **JsonWebToken (JWT)** : Création et validation des jetons d'authentification.
- **Nodemailer** : Envoi d'emails via SMTP.
- **Supabase Client** : Accès à la base de données via la clé d'administration (`SERVICE_ROLE_KEY`).

---

## 4. Le Backend (Node.js / Express)

Le backend (`server/index.js`) expose plusieurs routes API pour le frontend :

- **`/api/clients`** : Inscription, connexion, récupération de profil, et flux complet de réinitialisation de mot de passe (envoi d'email, vérification de token, confirmation).
- **`/api/dossiers`** : Création de dossiers (multipart/form-data), liste des agences, liste des dossiers du client, et détails d'un dossier.
- **`/api/notifications`** : Extraction de l'historique des actions et points de test pour le système d'emailing.

Le backend utilise la **Service Role Key** de Supabase (`server/config/supabase.js`) pour contourner les politiques RLS, agissant comme un tiers de confiance entre le client externe et la base de données.

---

## 5. Gestion de l'Authentification (JWT)

La sécurité repose entièrement sur des jetons JWT et le hachage des mots de passe. Le système n'utilise pas Supabase Auth pour les clients, mais un système sur-mesure sur la table `clients`.

### Inscription (`/register`)
- Le mot de passe est haché via **Bcrypt**.
- Le numéro de police d'assurance est stocké dans le champ `cin` pour compatibilité.
- Un JWT valide 7 jours est retourné.

### Connexion (`/login`)
- Vérification du mot de passe (Bcrypt compare).
- Vérification que le compte est actif (`is_active`).

### Protection des routes (Middleware `authenticateClient`)
- Chaque requête vers une route protégée (ex: `/api/dossiers`) passe par le middleware `server/middleware/authenticateClient.js`.
- Le middleware vérifie la présence de l'en-tête `Authorization: Bearer <jwt>`.
- Si le JWT est valide, l'ID et les données du client sont injectés dans `req.client` pour être utilisés par les contrôleurs.

---

## 6. Processus de soumission de dossier

La page `SoumettreDossier` (`/soumettre-dossier`) permet au client de créer une demande.

### Flux de création :
1. **Frontend** : Le client choisit l'agence, saisit sa demande, et attache jusqu'à 5 fichiers (max 5 Mo chacun).
2. **Backend (`POST /api/dossiers`)** : 
   - Vérifie le token JWT pour identifier le client.
   - **Upload** : Sauvegarde les fichiers dans le bucket Supabase Storage `pieces_justificatives`.
   - **Insertion BD** : Crée une entrée dans la table `dossiers` (état `EN_COURS`, niveau `RELATION_CLIENT`) et dans `dossier_details_rc`.
   - **Traçabilité** : Insère automatiquement une ligne dans `historique_actions` ("Dossier soumis par le client").

---

## 7. Suivi des dossiers et Historique

### Liste des demandes (`/my-requests`)
- Le backend (`GET /api/dossiers`) joint les tables `dossiers`, `agences`, `dossier_details_rc`, et `dossier_details_prestation` (pour afficher le montant).
- Le frontend filtre et affiche l'état exact du dossier.

### Détail et Timeline (`/request-details/:requestId`)
- Lors de l'ouverture d'un dossier, le backend renvoie également tout l'`historique_actions` lié.
- Le frontend utilise cet historique pour construire une **Timeline visuelle** (Validation, Gestion, Traitement, Clôture), traduisant le jargon interne (Prestation, Finance) en étapes claires pour le client.

---

## 8. Système de Notifications et Emailing

L'une des fonctionnalités phares de l'InterfaceClient est la notification automatique par email, gérée par le daemon **`emailNotifier.js`**.

### Fonctionnement du Polling :
1. Au démarrage du serveur, le service d'emailing est lancé en arrière-plan.
2. Toutes les 30 secondes, il interroge la table `historique_actions` pour repérer les nouveaux événements (changements de statut, transferts entre départements).
3. S'il détecte une avancée significative sur un dossier, il récupère l'adresse email du client associé.
4. Il génère et envoie un **email HTML personnalisé** (via SMTP / Nodemailer) informant le client de la progression.
5. Il sauvegarde son état (le dernier ID d'historique traité) dans un fichier cache local (`server/.cache/email-notifier-state.json`) pour ne jamais envoyer de doublons, même après un redémarrage du serveur.

### Notifications in-app (`/notifications`)
Le frontend récupère la liste des événements via `/api/notifications`. L'état de lecture n'est pas géré en base de données, mais via le **LocalStorage** (`client_notifications_last_seen_<clientId>`), allégeant considérablement les requêtes vers la BD.

---

## 9. Interface Frontend (React / Vite)

Le frontend est divisé en deux sections gérées par React Router :

### Routes Publiques
- **`/` (WelcomePage)** : Landing page avec Call-To-Actions (CTA) dynamiques selon l'état de connexion.
- **`/login`, `/register`** : Formulaires d'authentification.
- **`/forgot-password`, `/reset-password`** : Flux complet de récupération de compte.

### Routes Protégées
Nécessitent la présence d'un `client_token` valide dans le LocalStorage.
- **`/home` (Dashboard)** : Vue d'ensemble avec statistiques et les 5 dossiers les plus récents.
- **`/mon-compte` (MyAccount)** : Affichage du profil (Nom, Email, Police/CIN).

---

## 10. Base de Données et Sécurité

Le backend agit comme un bouclier de sécurité.

- **Isolation des Clients** : La table `clients` est totalement séparée de la table `users` (employés COMAR de PrestaTrack).
- **Protection par Backend** : Le frontend web public n'a **aucune clé Supabase**. Un pirate ne peut pas inspecter le code source du navigateur pour interagir avec la base de données.
- **Upload sécurisé** : Seul le backend a le droit d'uploader des fichiers dans le Storage Supabase, après avoir vérifié le type MIME et la taille des fichiers.

---

## 11. Points forts et innovations

1. **Sécurité maximale (Tiered Architecture)** :
   Séparation physique entre le navigateur du client externe et la base de données via un backend Express dédié, évitant toute fuite de données (Data Leak) par manipulation de requêtes côté client.
2. **Système de Notification Asynchrone (Daemon)** :
   L'`emailNotifier.js` fonctionne en tâche de fond indépendante des requêtes HTTP, garantissant que les emails partent de manière fiable sans ralentir l'API.
3. **Authentification Autonome (JWT + Bcrypt)** :
   Système d'authentification complet, incluant un mécanisme sécurisé de réinitialisation de mot de passe par token SMTP, indépendant des limitations d'auth BaaS classiques.
4. **UX Orientée Client** :
   La conversion intelligente de l'historique brut de la base de données en une "Timeline" claire et rassurante dans l'UI (`RequestDetails`).

---

## 12. Conclusion

Le portail **InterfaceClient** est le pendant externe de PrestaTrack. C'est une application Full-Stack robuste (React + Node.js) qui permet à COMAR d'offrir à ses clients une **transparence totale** sur le traitement de leurs dossiers. 

Grâce à son architecture client-serveur sécurisée par JWT et son puissant moteur d'emailing en tâche de fond, l'application garantit une communication fluide tout en protégeant les données sensibles de la compagnie.
