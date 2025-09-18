# Guide de connexion MariaDB Infomaniak

## ❌ Problème identifié
L'adresse `6501ew.myd.infomaniak.com` n'existe pas dans le DNS. C'est probablement une erreur dans les informations fournies.

## 🔍 Vérifications à faire

### 1. Dans votre panel Infomaniak
1. Connectez-vous à votre espace client Infomaniak
2. Allez dans **Hébergement web** → **Bases de données**
3. Sélectionnez votre base `6501ew_WeeKooK_VAL`
4. Vérifiez l'adresse du serveur (probablement différente)

### 2. Formats d'adresse courants chez Infomaniak
- `mysql.infomaniak.com` (standard)
- `mysql-[numéro].infomaniak.com` (ex: mysql-1.infomaniak.com)
- `db-[numéro].infomaniak.com`
- `[compte].mysql.infomaniak.com`

### 3. Accès externe
Infomaniak peut bloquer l'accès externe par défaut. Vérifiez :
- **Autorisation d'accès externe** dans les paramètres de la base
- **Liste blanche d'IP** (ajoutez votre IP publique)
- **Paramètres SSL** requis

## 🛠️ Solutions

### Option 1 : Vérifier l'adresse exacte
```bash
# Testez ces adresses depuis votre panel Infomaniak
nslookup mysql.infomaniak.com
nslookup mysql-1.infomaniak.com
nslookup mysql-2.infomaniak.com
```

### Option 2 : Base de données locale pour développement
```bash
# Installer MariaDB localement
brew install mariadb
brew services start mariadb

# Créer la base locale
mysql -u root -p
CREATE DATABASE weekook_dev;
CREATE USER 'weekook_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON weekook_dev.* TO 'weekook_user'@'localhost';
FLUSH PRIVILEGES;
```

Puis dans `.env` :
```env
DATABASE_URL="mysql://weekook_user:password@localhost:3306/weekook_dev"
```

### Option 3 : Contacter le support
Si l'adresse est correcte, contactez le support Infomaniak pour :
- Activer l'accès externe
- Obtenir les paramètres SSL corrects
- Vérifier les restrictions IP

## 📋 Informations à vérifier
- [ ] Adresse exacte du serveur MySQL
- [ ] Accès externe autorisé
- [ ] IP publique dans la liste blanche
- [ ] Paramètres SSL requis
- [ ] Port correct (3306)

## 🚀 Prochaines étapes
1. Vérifiez l'adresse exacte dans votre panel Infomaniak
2. Activez l'accès externe si nécessaire
3. Testez avec : `npm run mysql:test`
4. Ou utilisez une base locale pour le développement