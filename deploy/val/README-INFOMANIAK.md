# 🚀 WEEKOOK - Déploiement sur Serveur Node.js Infomaniak

## 📋 Guide complet de déploiement - Environnement VAL

### 🎯 **Choix du serveur**
⭐ **RECOMMANDÉ : Serveur Node.js Infomaniak**

✅ **Avantages :**
- Frontend + Backend sur le même serveur
- Technologie native pour votre application
- Performance optimisée pour JavaScript
- Simplicité de gestion

❌ **Serveur PHP non recommandé :**
- Incompatible avec Node.js
- Nécessiterait une réécriture complète du backend

---

## 🏗️ **Architecture sur serveur Node.js**

```
Serveur Node.js Infomaniak
├── Frontend (Nginx)
│   ├── val.weekook.com → /var/www/frontend/
│   └── Fichiers statiques (dist/)
├── Backend (Node.js)
│   ├── val-api.weekook.com:3001
│   └── API WEEKOOK complète
└── Base de données
    └── 6501ew_WeeKooK_VAL (MySQL Infomaniak)
```

---

## 📦 **Fichiers à déployer**

Dans ce dossier, vous trouverez :

- 📁 `dist/` - Frontend buildé (fichiers statiques)
- 📁 `server/` - Backend Node.js avec dépendances
- 📁 `prisma/` - Schéma de base de données
- 📄 `.env` - Variables d'environnement VAL
- 🔧 `nginx-val.conf` - Configuration Nginx
- ⚙️ `ecosystem.config.js` - Configuration PM2

---

## 🚀 **Étapes de déploiement**

### **1. Connexion au serveur**
```bash
ssh votre-utilisateur@votre-serveur-infomaniak.com
```

### **2. Préparation des dossiers**
```bash
# Créer les dossiers
sudo mkdir -p /var/www/weekook-frontend
sudo mkdir -p /var/www/weekook-api
sudo mkdir -p /var/log/weekook

# Permissions
sudo chown -R $USER:$USER /var/www/weekook-frontend
sudo chown -R $USER:$USER /var/www/weekook-api
sudo chown -R $USER:$USER /var/log/weekook
```

### **3. Upload des fichiers**
```bash
# Depuis votre machine locale
scp -r dist/* votre-utilisateur@serveur:/var/www/weekook-frontend/
scp -r server/* votre-utilisateur@serveur:/var/www/weekook-api/
scp -r prisma votre-utilisateur@serveur:/var/www/weekook-api/
scp .env votre-utilisateur@serveur:/var/www/weekook-api/
scp ecosystem.config.js votre-utilisateur@serveur:/var/www/weekook-api/
```

### **4. Installation des dépendances**
```bash
# Sur le serveur
cd /var/www/weekook-api
npm install --production
npx prisma generate
```

### **5. Configuration Nginx**
```bash
# Copier la configuration
sudo cp /chemin/vers/nginx-val.conf /etc/nginx/sites-available/weekook-val
sudo ln -s /etc/nginx/sites-available/weekook-val /etc/nginx/sites-enabled/

# Modifier les chemins SSL dans le fichier
sudo nano /etc/nginx/sites-available/weekook-val

# Tester et relancer
sudo nginx -t
sudo systemctl reload nginx
```

### **6. Lancement avec PM2**
```bash
cd /var/www/weekook-api
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 **Configuration des domaines**

### **Dans votre panel Infomaniak :**

1. **val.weekook.com** → Pointez vers votre serveur Node.js
2. **val-api.weekook.com** → Pointez vers votre serveur Node.js

### **Certificats SSL :**
```bash
# Avec Let's Encrypt (gratuit)
sudo certbot --nginx -d val.weekook.com -d val-api.weekook.com
```

---

## 🔐 **Base de données**

### **Informations de connexion :**
- **Host** : `6501ew.myd.infomaniak.com`
- **Database** : `6501ew_WeeKooK_VAL`
- **User** : `6501ew_WeekookVA`
- **Password** : `Weekookmania1-1`

### **Test de connexion :**
```bash
# Depuis le serveur (accès interne uniquement)
mysql -u 6501ew_WeekookVA -p -h 6501ew.myd.infomaniak.com 6501ew_WeeKooK_VAL
```

---

## 🧪 **Tests post-déploiement**

### **Vérifications :**
- [ ] Frontend accessible : `https://val.weekook.com`
- [ ] Backend API : `https://val-api.weekook.com/api/health`
- [ ] Base de données connectée
- [ ] PM2 status OK : `pm2 status`
- [ ] Logs sans erreur : `pm2 logs weekook-api-val`

### **Tests fonctionnels :**
- [ ] Page d'accueil s'affiche
- [ ] Connexion utilisateur fonctionne
- [ ] Upload de photos de profil
- [ ] Recherche de Kookers
- [ ] Profils Kookers accessibles

---

## 🔧 **Commandes utiles**

```bash
# Gestion PM2
pm2 status                    # Voir le statut
pm2 logs weekook-api-val      # Voir les logs
pm2 restart weekook-api-val   # Redémarrer
pm2 stop weekook-api-val      # Arrêter
pm2 delete weekook-api-val    # Supprimer

# Gestion Nginx
sudo nginx -t                 # Tester la configuration
sudo systemctl reload nginx   # Recharger
sudo systemctl status nginx   # Voir le statut

# Logs système
tail -f /var/log/weekook/weekook-api-val.log
tail -f /var/log/nginx/weekook-val-error.log
```

---

## 🆘 **Dépannage**

### **Problèmes courants :**

1. **API inaccessible**
   ```bash
   # Vérifier que Node.js écoute sur le port 3001
   netstat -tlnp | grep 3001
   ```

2. **Erreur de base de données**
   ```bash
   # Vérifier la connexion depuis le serveur
   mysql -u 6501ew_WeekookVA -p -h 6501ew.myd.infomaniak.com 6501ew_WeeKooK_VAL
   ```

3. **Frontend ne charge pas**
   ```bash
   # Vérifier les fichiers statiques
   ls -la /var/www/weekook-frontend/
   ```

4. **Certificat SSL**
   ```bash
   # Renouveler avec certbot
   sudo certbot renew --dry-run
   ```

---

## 📞 **Support**

- **Documentation Infomaniak** : Panel client → Support
- **Logs de l'application** : `/var/log/weekook/`
- **Logs Nginx** : `/var/log/nginx/weekook-val-*.log`

---

## 🎯 **Résumé**

**Environnement** : VAL (Validation)  
**Serveur** : Node.js Infomaniak  
**Frontend** : https://val.weekook.com  
**Backend** : https://val-api.weekook.com  
**Base de données** : 6501ew_WeeKooK_VAL  

**🎉 Votre application WEEKOOK est prête pour la production !**







Serveur : 6501ew.myd.infomaniak.com
Base : 6501ew_WeeKooK_VAL
User : 6501ew_WeekookVA
PWD : Weekookmania1-1