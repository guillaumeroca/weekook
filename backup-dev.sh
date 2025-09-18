#!/bin/bash

# Script de sauvegarde WEEKOOK - Version de développement
# Sauvegarde complète : code, base de données, configuration

set -e  # Arrêt en cas d'erreur

# Configuration
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
DB_BACKUP_FILE="weekook_dev_backup_$(date +%Y%m%d-%H%M%S).sql"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "💾 Sauvegarde WEEKOOK - Version de développement"
echo "==============================================="

# Créer le dossier de sauvegarde
log_info "Création du dossier de sauvegarde..."
mkdir -p "$BACKUP_DIR"

# 1. Sauvegarde de la base de données
log_info "Sauvegarde de la base de données weekook_dev..."
if mysqldump -u weekook_user -pweekook_password weekook_dev > "$BACKUP_DIR/$DB_BACKUP_FILE" 2>/dev/null; then
    log_success "Base de données sauvegardée: $DB_BACKUP_FILE"
else
    log_warning "Impossible de sauvegarder la base de données (sera ignoré)"
fi

# 2. Sauvegarde du code source
log_info "Sauvegarde du code source..."
cp -r src/ "$BACKUP_DIR/" 2>/dev/null || log_warning "Dossier src/ non trouvé"
cp -r server/ "$BACKUP_DIR/" 2>/dev/null || log_warning "Dossier server/ non trouvé"
cp -r prisma/ "$BACKUP_DIR/" 2>/dev/null || log_warning "Dossier prisma/ non trouvé"
cp -r config/ "$BACKUP_DIR/" 2>/dev/null || log_warning "Dossier config/ non trouvé"
cp -r scripts/ "$BACKUP_DIR/" 2>/dev/null || log_warning "Dossier scripts/ non trouvé"

# 3. Sauvegarde des fichiers de configuration
log_info "Sauvegarde des fichiers de configuration..."
cp package.json "$BACKUP_DIR/" 2>/dev/null || log_warning "package.json non trouvé"
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || log_warning "package-lock.json non trouvé"
cp .env "$BACKUP_DIR/" 2>/dev/null || log_warning ".env non trouvé"
cp server/.env "$BACKUP_DIR/server-dot-env" 2>/dev/null || log_warning "server/.env non trouvé"
cp vite.config.ts "$BACKUP_DIR/" 2>/dev/null || log_warning "vite.config.ts non trouvé"
cp tailwind.config.js "$BACKUP_DIR/" 2>/dev/null || log_warning "tailwind.config.js non trouvé"
cp tsconfig.json "$BACKUP_DIR/" 2>/dev/null || log_warning "tsconfig.json non trouvé"
cp eslint.config.js "$BACKUP_DIR/" 2>/dev/null || log_warning "eslint.config.js non trouvé"

# 4. Sauvegarde des fichiers de build si ils existent
log_info "Sauvegarde du build (si existant)..."
if [ -d "dist" ]; then
    cp -r dist/ "$BACKUP_DIR/"
    log_success "Dossier dist/ sauvegardé"
fi

# 5. Sauvegarde des logs
log_info "Sauvegarde des logs..."
cp *.log "$BACKUP_DIR/" 2>/dev/null || log_warning "Aucun fichier log trouvé"
cp server/*.log "$BACKUP_DIR/" 2>/dev/null || log_warning "Aucun fichier log serveur trouvé"

# 6. Informations système
log_info "Sauvegarde des informations système..."
echo "# Sauvegarde WEEKOOK - $(date)" > "$BACKUP_DIR/backup-info.txt"
echo "# Version Node.js: $(node --version)" >> "$BACKUP_DIR/backup-info.txt"
echo "# Version npm: $(npm --version)" >> "$BACKUP_DIR/backup-info.txt"
echo "# Répertoire: $(pwd)" >> "$BACKUP_DIR/backup-info.txt"
echo "# Utilisateur: $(whoami)" >> "$BACKUP_DIR/backup-info.txt"
echo "# Système: $(uname -a)" >> "$BACKUP_DIR/backup-info.txt"
echo "" >> "$BACKUP_DIR/backup-info.txt"
echo "# Contenu du répertoire:" >> "$BACKUP_DIR/backup-info.txt"
ls -la >> "$BACKUP_DIR/backup-info.txt"

# 7. Créer une archive
log_info "Création de l'archive..."
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR/"
ARCHIVE_SIZE=$(du -h "$BACKUP_DIR.tar.gz" | cut -f1)

# 8. Nettoyage
rm -rf "$BACKUP_DIR"

echo ""
log_success "🎉 Sauvegarde terminée avec succès!"
echo ""
echo "📁 Archive créée: $BACKUP_DIR.tar.gz ($ARCHIVE_SIZE)"
echo "📍 Emplacement: $(pwd)/$BACKUP_DIR.tar.gz"
echo ""
echo "🔄 Pour restaurer cette sauvegarde:"
echo "   tar -xzf $BACKUP_DIR.tar.gz"
echo "   # Puis restaurer les fichiers et la base de données"
echo ""
log_info "Sauvegarde terminée à $(date)"