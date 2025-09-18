#!/bin/bash

# Script de déploiement WEEKOOK sur Infomaniak - Environnement VAL
# Date: $(date '+%Y-%m-%d %H:%M:%S')

echo "🚀 Déploiement WEEKOOK - Environnement VAL"
echo "=========================================="

# Configuration
FRONTEND_FILES="dist/*"
BACKEND_FILES="server/"
PRISMA_FILES="prisma/"
ENV_FILE=".env"

echo "📦 Fichiers à déployer :"
echo "  - Frontend: $FRONTEND_FILES"
echo "  - Backend: $BACKEND_FILES"
echo "  - Prisma: $PRISMA_FILES"
echo "  - Environment: $ENV_FILE"

# Vérifier que les fichiers existent
if [ ! -d "dist" ]; then
    echo "❌ Le dossier 'dist' n'existe pas. Exécutez d'abord 'npm run build'."
    exit 1
fi

if [ ! -d "server" ]; then
    echo "❌ Le dossier 'server' n'existe pas."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ Le fichier '.env' n'existe pas."
    exit 1
fi

echo ""
echo "📋 Prochaines étapes manuelles :"
echo "================================"
echo ""
echo "1. 📂 FRONTEND (Hébergement Web Infomaniak)"
echo "   - Connectez-vous à votre panel Infomaniak"
echo "   - Allez dans 'Hébergement Web' → 'Gestionnaire de fichiers'"
echo "   - Supprimez le contenu du dossier 'public_html' (ou 'www')"
echo "   - Uploadez tout le contenu du dossier 'dist/' dans 'public_html/'"
echo ""
echo "2. 🖥️  BACKEND (Cloud Server/VPS Infomaniak)"
echo "   - Connectez-vous à votre serveur via SSH"
echo "   - Transférez le dossier 'server/' vers '/var/www/weekook-api/'"
echo "   - Transférez le dossier 'prisma/' vers '/var/www/weekook-api/'"
echo "   - Transférez le fichier '.env' vers '/var/www/weekook-api/'"
echo ""
echo "3. 🔧 INSTALLATION SUR LE SERVEUR"
echo "   ssh votre-serveur@infomaniak.com"
echo "   cd /var/www/weekook-api"
echo "   npm install --production"
echo "   npx prisma generate"
echo "   pm2 start app.js --name weekook-api-val"
echo ""
echo "4. 🌐 CONFIGURATION DOMAINES"
echo "   - val.weekook.com → Hébergement Web (frontend)"
echo "   - val-api.weekook.com → Cloud Server port 3001 (backend)"
echo ""
echo "5. 🔐 SSL/HTTPS"
echo "   - Activez SSL sur val.weekook.com"
echo "   - Configurez SSL sur val-api.weekook.com"
echo ""
echo "6. 🧪 TESTS"
echo "   - https://val.weekook.com (frontend)"
echo "   - https://val-api.weekook.com/api/health (backend)"
echo ""
echo "✅ Environnement VAL prêt pour le déploiement !"
echo "📍 Tous les fichiers sont dans : $(pwd)"