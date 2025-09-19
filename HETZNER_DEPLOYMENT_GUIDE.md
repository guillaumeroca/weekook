# Guide de Déploiement Weekook VAL sur Hetzner

## Prérequis

- Serveur Ubuntu 22.04 LTS (Hetzner)
- Accès SSH au serveur
- Base de données MySQL/MariaDB déjà configurée
- Node.js 18+ installé
- Git installé

## Informations de la Base VAL

- **Database**: weekook_VAL
- **User**: weekook_val_user
- **Password**: ValPassword123!
- **Host**: localhost (même serveur que DEV)

## Étapes de Déploiement

### 1. Connexion au serveur

```bash
ssh ubuntu@your-hetzner-server-ip
```

### 2. Installation des prérequis (si nécessaire)

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 pour la gestion des processus
sudo npm install -g pm2

# Nginx (optionnel, pour reverse proxy)
sudo apt install nginx -y

# Git
sudo apt install git -y
```

### 3. Déploiement initial

```bash
# Se positionner dans le home de l'utilisateur weekook
cd /home/weekook

# Cloner le repository sur la branche VAL
git clone -b deploy/val-v0.1 https://github.com/guillaumeroca/weekook.git weekook-val

# Entrer dans le répertoire
cd weekook-val

# Copier le fichier de configuration VAL
cp .env.val .env

# IMPORTANT: Éditer le fichier .env pour mettre l'IP réelle du serveur
nano .env
# Remplacer "your-hetzner-server-ip" par l'IP réelle

# Rendre le script de déploiement exécutable
chmod +x deploy-hetzner-val.sh

# Lancer le déploiement
./deploy-hetzner-val.sh
```

### 4. Configuration Nginx (Recommandé)

Créer le fichier de configuration Nginx :

```bash
sudo nano /etc/nginx/sites-available/weekook-val
```

Contenu :
```nginx
server {
    listen 80;
    server_name _;  # Ou votre domaine si vous en avez un

    # Frontend
    location / {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activer la configuration :
```bash
sudo ln -s /etc/nginx/sites-available/weekook-val /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configuration du Firewall

```bash
# Ouvrir les ports nécessaires
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (pour plus tard)
sudo ufw allow 5173/tcp  # Backend (si accès direct nécessaire)
sudo ufw allow 5174/tcp  # Frontend (si accès direct nécessaire)

# Activer le firewall
sudo ufw enable
```

## Gestion de l'Application

### Commandes PM2

```bash
# Voir le statut des applications
pm2 status

# Voir les logs
pm2 logs
pm2 logs weekook-val-backend
pm2 logs weekook-val-frontend

# Redémarrer les services
pm2 restart all
pm2 restart weekook-val-backend
pm2 restart weekook-val-frontend

# Arrêter les services
pm2 stop all

# Monitoring en temps réel
pm2 monit

# Sauvegarder la configuration PM2
pm2 save
```

### Mise à jour de l'application

Pour déployer une nouvelle version :

```bash
cd /home/weekook/weekook-val

# Récupérer les dernières modifications
git pull origin deploy/val-v0.1

# Relancer le script de déploiement
./deploy-hetzner-val.sh
```

### Base de données

```bash
# Se connecter à MySQL
mysql -u weekook_val_user -pValPassword123! weekook_VAL

# Vérifier les tables
SHOW TABLES;

# Compter les utilisateurs
SELECT COUNT(*) FROM users;

# Sortir
EXIT;
```

### Sauvegarde

Créer un script de sauvegarde automatique :

```bash
# Créer le script
nano /home/weekook/backup-weekook-val.sh
```

Contenu :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/weekook/backups"
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u weekook_val_user -pValPassword123! weekook_VAL > $BACKUP_DIR/weekook_val_$DATE.sql
gzip $BACKUP_DIR/weekook_val_$DATE.sql

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "weekook_val_*.sql.gz" -mtime +7 -delete

echo "Sauvegarde terminée: $BACKUP_DIR/weekook_val_$DATE.sql.gz"
```

Rendre exécutable et ajouter au crontab :
```bash
chmod +x /home/weekook/backup-weekook-val.sh

# Ajouter au crontab (sauvegarde quotidienne à 3h du matin)
crontab -e
# Ajouter la ligne :
0 3 * * * /home/weekook/backup-weekook-val.sh
```

## Troubleshooting

### Problème de connexion à la base de données

```bash
# Vérifier que MySQL est actif
sudo systemctl status mysql

# Tester la connexion
mysql -u weekook_val_user -pValPassword123! -e "SELECT 1;"
```

### Ports utilisés par d'autres processus

```bash
# Voir ce qui utilise un port
sudo lsof -i :5173
sudo lsof -i :5174

# Tuer un processus par PID
kill -9 <PID>
```

### Problèmes de permissions

```bash
# Donner les bonnes permissions
sudo chown -R ubuntu:ubuntu /home/weekook/weekook-val
```

### Logs d'erreur

```bash
# Logs PM2
pm2 logs --err

# Logs système
sudo journalctl -xe

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
```

## Sécurité

### Recommandations importantes

1. **Changer les mots de passe par défaut** dans le fichier `.env`
2. **Configurer HTTPS** avec Let's Encrypt :
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

3. **Limiter l'accès SSH** :
   - Utiliser des clés SSH au lieu de mots de passe
   - Changer le port SSH par défaut
   - Configurer fail2ban

4. **Sauvegardes régulières** : Vérifier que les sauvegardes automatiques fonctionnent

5. **Monitoring** : Configurer des alertes (PM2 peut envoyer des alertes par email)

## Support et Maintenance

### Monitoring des ressources

```bash
# CPU et RAM
htop

# Espace disque
df -h

# Processus PM2
pm2 status
pm2 monit
```

### Mise à jour du système

```bash
# Mise à jour des paquets
sudo apt update && sudo apt upgrade -y

# Mise à jour de Node.js (si nécessaire)
sudo npm install -g n
sudo n latest
```

## URLs d'accès

Une fois le déploiement terminé :

- **Frontend**: http://[SERVER-IP]:5174
- **Backend API**: http://[SERVER-IP]:5173/api/health
- **PM2 Web**: `pm2 web` (port 9615 par défaut)

Avec Nginx configuré :
- **Application**: http://[SERVER-IP] ou http://[YOUR-DOMAIN]

## Contact

Pour toute question ou problème, référez-vous au repository GitHub :
https://github.com/guillaumeroca/weekook