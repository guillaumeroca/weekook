# Guide de déploiement WEEKOOK chez Infomaniak

## 🏗️ Architecture recommandée

### Frontend (React)
- **Solution** : Hébergement Web Infomaniak
- **Fichiers** : Build statique (HTML, CSS, JS)
- **URL** : https://weekook.ch (ou votre domaine)

### Backend (Node.js API)
- **Solution** : Cloud Server ou VPS Infomaniak
- **Port** : 3001
- **Base** : Ubuntu/Debian avec Node.js

### Base de données
- **Solution** : MySQL Infomaniak (compatible MariaDB)
- **Accès** : Via tunnel SSH ou IP autorisées

## 📦 Étapes de déploiement

### 1. Préparer le frontend pour la production

```bash
# Build de production
npm run build

# Fichiers générés dans /dist
```

### 2. Configurer les variables d'environnement

```bash
# Production
NODE_ENV=production
DATABASE_URL="mysql://username:password@mysql.infomaniak.com:3306/weekook_prod"
API_BASE_URL="https://api.weekook.ch"
```

### 3. Adapter les URLs dans le code

```javascript
// Remplacer localhost par votre domaine
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.weekook.ch/api'
  : 'http://localhost:3001/api';
```

### 4. Déployer sur Infomaniak

#### A. Hébergement Web (Frontend)
1. Uploader les fichiers `/dist` via FTP
2. Configurer les redirections (SPA)
3. Activer HTTPS

#### B. Cloud Server (Backend)
1. Installer Node.js et npm
2. Uploader le code serveur
3. Configurer PM2 pour la production
4. Ouvrir le port 3001

#### C. Base de données MySQL
1. Créer la base `weekook_prod`
2. Importer le schéma Prisma
3. Configurer les accès

## 🔧 Scripts de déploiement

### Frontend
```bash
#!/bin/bash
npm run build
rsync -avz dist/ user@ftp.infomaniak.com:/web/
```

### Backend
```bash
#!/bin/bash
tar -czf backend.tar.gz server/
scp backend.tar.gz user@cloud.infomaniak.com:/app/
ssh user@cloud.infomaniak.com 'cd /app && tar -xzf backend.tar.gz && npm install --production && pm2 restart weekook-api'
```

## 📝 Checklist déploiement

- [ ] Compte Infomaniak configuré
- [ ] Domaine configuré
- [ ] SSL activé
- [ ] Base de données créée
- [ ] Variables d'environnement définies
- [ ] Build frontend testé
- [ ] API backend déployée
- [ ] Tests de fonctionnement