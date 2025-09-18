# WEEKOOK - Déploiement Environnement VAL

## 📦 Contenu du package de déploiement

- `dist/` - Frontend buildé pour la production
- `server/` - Backend API avec dépendances installées
- `prisma/` - Schéma de base de données
- `.env` - Variables d'environnement pour VAL
- `deploy-infomaniak.sh` - Script de déploiement avec instructions

## 🚀 Instructions de déploiement

### 1. Frontend (Hébergement Web Infomaniak)
```bash
# Contenu à uploader dans public_html/
cp dist/* /path/to/public_html/
```

### 2. Backend (Cloud Server Infomaniak)
```bash
# Sur votre serveur Infomaniak
scp -r server/ user@serveur:/var/www/weekook-api/
scp -r prisma/ user@serveur:/var/www/weekook-api/
scp .env user@serveur:/var/www/weekook-api/
```

### 3. Installation sur le serveur
```bash
ssh user@serveur
cd /var/www/weekook-api
npm install --production
npx prisma generate
pm2 start app.js --name weekook-api-val
```

## 🌐 Configuration des domaines

- **Frontend**: `val.weekook.com` → Hébergement Web
- **Backend**: `val-api.weekook.com` → Cloud Server:3001

## 🔐 Base de données

- **Host**: `6501ew.myd.infomaniak.com`
- **Database**: `6501ew_WeeKooK_VAL`
- **User**: `6501ew_WeekookVA`
- **Password**: `Weekookmania1-1`

## ✅ Tests post-déploiement

- [ ] https://val.weekook.com (frontend)
- [ ] https://val-api.weekook.com/api/health (backend)
- [ ] Connexion à la base de données
- [ ] Upload de photos de profil
- [ ] Recherche de Kookers
- [ ] Profils Kookers fonctionnels

## 🔧 Commandes utiles

```bash
# Voir les logs du backend
pm2 logs weekook-api-val

# Redémarrer le backend
pm2 restart weekook-api-val

# Vérifier le statut
pm2 status

# Tester la connexion DB
mysql -u 6501ew_WeekookVA -p -h 6501ew.myd.infomaniak.com 6501ew_WeeKooK_VAL
```

## 📁 Structure finale sur le serveur

```
/var/www/weekook-api/
├── .env
├── app.js
├── package.json
├── node_modules/
├── prisma/
│   └── schema.prisma
└── ...
```

---

**🎯 Environnement**: VAL (Validation)  
**📅 Date**: $(date '+%Y-%m-%d %H:%M:%S')  
**🏗️ Build**: Production optimisé