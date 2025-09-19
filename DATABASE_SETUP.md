# Configuration Base de Données - Environnement VAL (Hetzner)

## Base de données VAL existante

La base de données de validation est déjà configurée sur le serveur avec les informations suivantes :
- **Database** : weekook_VAL
- **User** : weekook_val_user
- **Password** : ValPassword123!
- **Host** : localhost (même serveur que DEV)

## Configuration de l'application

### 1. Fichier .env pour VAL
Créer ou modifier le fichier `.env.val` :
```env
# Database VAL
DATABASE_URL="mysql://weekook_val_user:ValPassword123!@localhost:3306/weekook_VAL"

# Environment
NODE_ENV=validation
PORT=5173

# JWT Secret (à générer)
JWT_SECRET=your_jwt_secret_key_for_val

# App URL
APP_URL=http://your-hetzner-server-ip:5174
```

### 2. Initialiser la base de données avec Prisma
```bash
# Se positionner dans le répertoire du projet
cd /home/ubuntu/weekook-val

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations sur la base VAL
DATABASE_URL="mysql://weekook_val_user:ValPassword123!@localhost:3306/weekook_VAL" npx prisma migrate deploy

# (Optionnel) Seed la base de données avec des données de test
DATABASE_URL="mysql://weekook_val_user:ValPassword123!@localhost:3306/weekook_VAL" npx prisma db seed
```

## Déploiement sur Ubuntu (Hetzner)

### 1. Structure des répertoires
```bash
/home/ubuntu/
├── weekook-dev/     # Environnement DEV
├── weekook-val/     # Environnement VAL (notre déploiement)
└── backups/         # Sauvegardes
```

### 2. Installation des prérequis
```bash
# Node.js et npm (si pas déjà installés)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 pour la gestion des processus
sudo npm install -g pm2

# Nginx pour le reverse proxy
sudo apt install nginx -y
```

### 3. Configuration PM2 pour VAL
Créer le fichier `ecosystem.config.js` :
```javascript
module.exports = {
  apps: [
    {
      name: 'weekook-val-backend',
      script: './server/app.js',
      cwd: '/home/ubuntu/weekook-val',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'validation',
        PORT: 5173,
        DATABASE_URL: 'mysql://weekook_val_user:ValPassword123!@localhost:3306/weekook_VAL'
      }
    },
    {
      name: 'weekook-val-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/ubuntu/weekook-val',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'validation',
        PORT: 5174
      }
    }
  ]
};
```

### 4. Configuration Nginx
Créer `/etc/nginx/sites-available/weekook-val` :
```nginx
server {
    listen 80;
    server_name val.weekook.com;  # Remplacer par votre domaine ou IP

    # Frontend
    location / {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Script de déploiement

Créer `deploy-val.sh` :
```bash
#!/bin/bash

# Variables
REPO_URL="https://github.com/guillaumeroca/weekook.git"
BRANCH="deploy/val-v0.1"
DEPLOY_DIR="/home/ubuntu/weekook-val"

echo "🚀 Déploiement Weekook VAL..."

# Cloner ou mettre à jour le code
if [ -d "$DEPLOY_DIR" ]; then
    cd $DEPLOY_DIR
    git pull origin $BRANCH
else
    git clone -b $BRANCH $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install
cd server && npm install && cd ..

# Build du frontend
echo "🔨 Build du frontend..."
npm run build

# Migrations Prisma
echo "🗄️ Mise à jour de la base de données..."
npx prisma generate
DATABASE_URL="mysql://weekook_val_user:ValPassword123!@localhost:3306/weekook_VAL" npx prisma migrate deploy

# Redémarrer les services PM2
echo "♻️ Redémarrage des services..."
pm2 restart ecosystem.config.js

echo "✅ Déploiement terminé!"
```

## Commandes utiles

### Monitoring
```bash
# Voir les logs PM2
pm2 logs weekook-val-backend
pm2 logs weekook-val-frontend

# Statut des services
pm2 status

# Monitoring en temps réel
pm2 monit
```

### Base de données
```bash
# Connexion à la base VAL
mysql -u weekook_val_user -pValPassword123! weekook_VAL

# Vérifier les tables
mysql -u weekook_val_user -pValPassword123! weekook_VAL -e "SHOW TABLES;"

# Compter les enregistrements
mysql -u weekook_val_user -pValPassword123! weekook_VAL -e "SELECT COUNT(*) FROM users;"
```

### Sauvegarde
```bash
# Sauvegarde manuelle de la base VAL
mysqldump -u weekook_val_user -pValPassword123! weekook_VAL > backup_val_$(date +%Y%m%d).sql
```

## Sécurité

⚠️ **Important** :
- Ne jamais commiter les mots de passe dans Git
- Utiliser des variables d'environnement ou des fichiers .env
- Configurer le firewall pour limiter l'accès aux ports
- Utiliser HTTPS en production avec Let's Encrypt