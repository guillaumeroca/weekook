# Configuration Base de Données MariaDB Infomaniak

## Problème de connexion actuel
L'adresse `6501ew.myd.infomaniak.com` ne semble pas accessible. Voici les étapes pour résoudre le problème :

## Solutions possibles

### 1. Vérifier les informations de connexion
Connectez-vous à votre panel Infomaniak et vérifiez :
- L'adresse exacte du serveur MySQL
- Le nom d'utilisateur et mot de passe
- Le nom de la base de données
- Le port (généralement 3306)

### 2. Adresses communes Infomaniak
Les serveurs MySQL Infomaniak utilisent généralement :
- `mysql.infomaniak.com` (essayé, sans succès)
- `mysql[X].infomaniak.com` où X est un numéro
- `[compte].myd.infomaniak.com` (format actuel, non accessible)

### 3. Configuration SSL
Infomaniak peut nécessiter SSL. Essayez :
```env
DATABASE_URL="mysql://username:password@host:3306/database?ssl=true"
```

### 4. Accès depuis l'extérieur
Vérifiez que :
- L'accès externe est autorisé sur votre base de données
- Votre IP est dans la liste blanche si nécessaire

### 5. Alternative : Base de données locale
Pour le développement, vous pouvez utiliser :
```bash
# Installer MariaDB localement
brew install mariadb
brew services start mariadb

# Créer une base de données locale
mysql -u root -p -e "CREATE DATABASE weekook_dev;"
```

Puis modifier le `.env` :
```env
DATABASE_URL="mysql://root:password@localhost:3306/weekook_dev"
```

## Prochaines étapes recommandées
1. Vérifiez les informations dans votre panel Infomaniak
2. Testez la connexion manuellement avec un client MySQL
3. Contactez le support Infomaniak si nécessaire
4. Ou utilisez une base locale pour le développement