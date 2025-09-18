#!/bin/bash

# Script de déploiement WEEKOOK pour Infomaniak
# Environnement de validation

set -e  # Arrêt en cas d'erreur

echo "🚀 Déploiement WEEKOOK - Environnement de validation"
echo "=================================================="

# Configuration
REMOTE_USER="weekook"
REMOTE_HOST="ssh-weekook.alwaysdata.net"
REMOTE_PATH="/home/weekook/www"
LOCAL_DIST="./dist"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifications préalables
log_info "Vérification des prérequis..."

if [ ! -f "package.json" ]; then
    log_error "package.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

if [ ! -f ".env" ]; then
    log_warning "Fichier .env non trouvé. Configuration par défaut utilisée."
fi

# Configuration de l'environnement de validation
log_info "Configuration de l'environnement de validation..."
npm run config:val

# Tests et vérifications
log_info "Exécution des tests et vérifications..."
npm run deploy:check || {
    log_error "Les tests ont échoué. Déploiement annulé."
    exit 1
}

# Build de production
log_info "Build de l'application pour la validation..."
npm run build:val || {
    log_error "Le build a échoué."
    exit 1
}

log_success "Build terminé avec succès"

# Vérification que le dossier dist existe
if [ ! -d "$LOCAL_DIST" ]; then
    log_error "Le dossier dist/ n'existe pas après le build"
    exit 1
fi

# Backup de l'ancienne version
log_info "Backup de l'ancienne version sur le serveur..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && cp -r dist dist-backup-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || true"

# Upload des fichiers
log_info "Upload des fichiers vers Infomaniak..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude 'backup-*.sql' \
    $LOCAL_DIST/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/dist/

log_success "Upload terminé"

# Upload des fichiers de configuration
log_info "Upload des fichiers de configuration..."
scp ecosystem.config.js $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/
scp package-val.json $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/package.json

# Installation des dépendances sur le serveur
log_info "Installation des dépendances sur le serveur..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm install --production"

# Mise à jour de la base de données
log_info "Mise à jour de la base de données..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm run db:migrate" || {
    log_warning "Migrations échouées, mais continuons..."
}

# Redémarrage des services
log_info "Redémarrage des services..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm run pm2:restart" || {
    log_info "Démarrage initial des services..."
    ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm run pm2:start"
}

# Vérification de santé
log_info "Vérification de santé de l'application..."
sleep 10

# Test de l'API
if curl -f -s https://val-api.weekook.com/api/health > /dev/null; then
    log_success "API opérationnelle"
else
    log_warning "API non accessible, vérifiez les logs"
fi

# Test du frontend
if curl -f -s https://val.weekook.com > /dev/null; then
    log_success "Frontend opérationnel"
else
    log_warning "Frontend non accessible, vérifiez les logs"
fi

# Nettoyage local
log_info "Nettoyage des fichiers temporaires..."
# rm -rf $LOCAL_DIST

echo ""
log_success "🎉 Déploiement terminé avec succès!"
echo ""
echo "🌐 URLs de validation:"
echo "   Frontend: https://val.weekook.com"
echo "   API:      https://val-api.weekook.com"
echo ""
echo "📊 Monitoring:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST 'npm run pm2:monit'"
echo "   ssh $REMOTE_USER@$REMOTE_HOST 'npm run pm2:logs'"
echo ""
log_info "Déploiement terminé à $(date)"