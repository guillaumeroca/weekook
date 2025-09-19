#!/bin/bash

# Script de déploiement pour environnement VAL sur serveur Hetzner Ubuntu
# Usage: ./deploy-hetzner-val.sh

set -e  # Exit on error

# Configuration
REPO_URL="https://github.com/guillaumeroca/weekook.git"
BRANCH="deploy/val-v0.1"
DEPLOY_DIR="/home/weekook/weekook-val"
ENV_FILE=".env.val"
DB_NAME="weekook_VAL"
DB_USER="weekook_val_user"
DB_PASS="ValPassword123!"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}     Déploiement Weekook VAL sur Hetzner       ${NC}"
echo -e "${GREEN}================================================${NC}"

# Fonction pour afficher les erreurs
error_exit() {
    echo -e "${RED}❌ Erreur: $1${NC}" >&2
    exit 1
}

# Vérifier si on est sur Ubuntu
if [[ ! -f /etc/lsb-release ]]; then
    error_exit "Ce script est conçu pour Ubuntu"
fi

echo -e "\n${YELLOW}📍 Étape 1: Préparation du répertoire${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    echo "Le répertoire existe, mise à jour du code..."
    cd $DEPLOY_DIR
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH || error_exit "Impossible de mettre à jour le code"
else
    echo "Clonage du repository..."
    git clone -b $BRANCH $REPO_URL $DEPLOY_DIR || error_exit "Impossible de cloner le repository"
    cd $DEPLOY_DIR
fi

echo -e "\n${YELLOW}📦 Étape 2: Installation des dépendances${NC}"
echo "Installation des dépendances du projet principal..."
npm ci --production=false || npm install || error_exit "Erreur installation npm"

echo "Installation des dépendances du serveur..."
cd server
npm ci || npm install || error_exit "Erreur installation npm serveur"
cd ..

echo -e "\n${YELLOW}⚙️ Étape 3: Configuration de l'environnement${NC}"
if [ -f "$ENV_FILE" ]; then
    echo "Copie du fichier de configuration VAL..."
    cp $ENV_FILE .env
else
    echo -e "${RED}⚠️  Le fichier $ENV_FILE n'existe pas${NC}"
    echo "Création d'un fichier .env basique..."
    cat > .env << EOF
NODE_ENV=validation
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"
PORT=5173
FRONTEND_PORT=5174
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
APP_URL=http://$(hostname -I | awk '{print $1}'):5174
API_URL=http://$(hostname -I | awk '{print $1}'):5173
EOF
    echo "Fichier .env créé avec configuration par défaut"
fi

echo -e "\n${YELLOW}🗄️ Étape 4: Configuration de la base de données${NC}"
echo "Génération du client Prisma..."
npx prisma generate || error_exit "Erreur génération Prisma"

echo "Application des migrations..."
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}" npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Les migrations ont échoué, tentative de push du schéma...${NC}"
    DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}" npx prisma db push
}

echo -e "\n${YELLOW}🔨 Étape 5: Build du frontend${NC}"
npm run build || error_exit "Erreur lors du build"

echo -e "\n${YELLOW}🚀 Étape 6: Configuration PM2${NC}"
# Créer le fichier ecosystem pour PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'weekook-val-backend',
      script: './server/app.js',
      cwd: '/home/weekook/weekook-val',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_file: '.env',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true
    },
    {
      name: 'weekook-val-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/weekook/weekook-val',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env_file: '.env'
    }
  ]
};
EOF

# Créer le répertoire des logs
mkdir -p logs

echo -e "\n${YELLOW}♻️ Étape 7: Démarrage/Redémarrage des services${NC}"
# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "Installation de PM2..."
    sudo npm install -g pm2
fi

# Arrêter les anciennes instances si elles existent
pm2 delete weekook-val-backend 2>/dev/null || true
pm2 delete weekook-val-frontend 2>/dev/null || true

# Démarrer les nouvelles instances
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save
pm2 startup systemd -u weekook --hp /home/weekook 2>/dev/null || true

echo -e "\n${YELLOW}📊 Étape 8: Vérification du déploiement${NC}"
sleep 3
pm2 status

# Obtenir l'IP du serveur
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Déploiement terminé avec succès!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "\nAccès à l'application:"
echo -e "  Frontend: ${GREEN}http://${SERVER_IP}:5174${NC}"
echo -e "  Backend API: ${GREEN}http://${SERVER_IP}:5173/api/health${NC}"
echo -e "\nCommandes utiles:"
echo -e "  Logs: ${YELLOW}pm2 logs${NC}"
echo -e "  Status: ${YELLOW}pm2 status${NC}"
echo -e "  Monitoring: ${YELLOW}pm2 monit${NC}"
echo -e "  Redémarrer: ${YELLOW}pm2 restart all${NC}"