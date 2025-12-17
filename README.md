# GrooveBox
## GrooveBox — Séquenceur web + API

Application React/Tone.js pour créer des grooves, avec gestion des pistes (solo/mute, volumes, presets, swing, humanize, sidechain), variations par pas (accent/ghost/proba), longueurs polymétriques et sauvegarde locale ou distante via une API Express/MySQL. Interface de contrôle BPM/arpégiateur/gammes, presets batterie/bass/pad/keys/sampler, tap tempo, presets de patterns, vu-mètres, aide intégrée.

### Fonctionnalités principales
- 11 pistes : kick/808, snare/909, hat, clap, bass, FM bass, pad, keys, sampler (one-shot).
- Steps : clic = on/off, clic droit = accent/ghost, Alt+clic = probabilité 100/70/40%, longueur piste 8/12/16/32 pas, scroll horizontal.
- Mix/FX : volumes + vu-mètre, solo/mute, reverb, delay fb, tone hat, cutoff bass/pad, transpose keys/pad, swing, humanize, sidechain kick→pad/keys/sampler.
- Presets instruments (kick, 808, snares, hats, clap, bass, FM bass, pad, keys, sampler) et presets de patterns (random/house/hiphop/techno).
- Sauvegarde/chargement : localStorage ou côté serveur (auth JWT, liste des créations).
- Aide : page `/help` (raccourcis clavier, commandes, conseils).

### Prérequis
- Node 20+ pour le front (Vite).
- Docker + Docker Compose **ou** MySQL 8 et Node 20 pour l’API.

### Installation rapide (Docker, hot reload)
1. Copier `server/.env.example` en `server/.env` et ajuster :
   ```
   PORT=4000
   DB_HOST=mysql
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=root          # identique à DB_ROOT_PASSWORD si changé
   DB_NAME=groovebox
   JWT_SECRET=change-moi
   ```
2. Lancer :
   ```bash
   docker compose up --build
   ```
   - Front : http://localhost:5173  
   - API : http://localhost:4000/api  
   - MySQL exposé sur le host : 127.0.0.1:3307 (port modifiable dans `docker-compose.yml`).
3. Hot reload : Vite recharge le front, nodemon redémarre l’API.

### Installation locale (sans Docker)
1. MySQL : créer la base
   ```sql
   CREATE DATABASE groovebox;
   ```
2. Backend :
   ```bash
   cd server
   cp .env.example .env   # mettre DB_HOST=127.0.0.1, DB_USER/DB_PASSWORD, DB_NAME=groovebox, JWT_SECRET=...
   npm install
   npm run dev            # ou npm run dev:watch
   ```
   L’API écoute sur `PORT` (4000 par défaut).
3. Front :
   ```bash
   cd ..
   cp .env.local.example .env.local  # si besoin, sinon définir VITE_API_URL=http://localhost:4000/api
   npm install
   npm run dev -- --host --port 5173
   ```
   Front sur http://localhost:5173.

### Variables d’environnement principales
- Front (`.env.local`) : `VITE_API_URL=http://localhost:4000/api`
- API (`server/.env`) : `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`

### Authentification & API
- Inscription : `POST /api/auth/register` `{ email, password }`
- Connexion : `POST /api/auth/login` → `{ token, email }`
- Patterns (auth Bearer) :
  - `GET /api/patterns` : liste perso
  - `GET /api/patterns/:id` : détail (data JSON)
  - `POST /api/patterns` : `{ name, data }`
  - `PUT /api/patterns/:id` : `{ name, data }`
`data` contient pattern, mutes, solos, volumes, controls, longueurs, vélocités/probas.

### Raccourcis & contrôles
- Clavier : `q w e r t y u i o p [` togglent le pas courant (Kick, 808, Snare, 909, Hat, Clap, Bass, FM Bass, Pad, Keys, Sampler).
- Steps : clic = on/off, clic droit = accent/ghost, Alt+clic = probabilité.
- Longueur piste : select 8/12/16/32.
- Transport : Start/Stop, BPM + Tap tempo, Swing, Humanize.
- Arp/Gammes : sélection de gamme (majeur, mineur, pentatonique, dorien, mixolydien), transpose, arp on/off.
- Sidechain : checkbox (kick/808 duck pad/keys/sampler).
- Sauvegarde : bouton Save (serveur si connecté, sinon local). Chargement : liste déroulante serveur + bouton chargement local.

### Commandes utiles
- Lancer front seul : `npm run dev -- --host --port 5173`
- Lancer API seule : `cd server && npm run dev:watch`
- Lancer tout via Docker : `docker compose up --build`
- Arrêter Docker : `docker compose down`

### Structure rapide
- `src/` front React (Tone.js, Jotai, Vite)
- `server/` API Express (auth JWT, MySQL)
- `docker-compose.yml` pour MySQL + API + front en dev

