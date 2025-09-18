# Guide d'installation OpenSSL

## 🐧 **Linux (Ubuntu/Debian)**

```bash
# Mettre à jour les paquets
sudo apt update

# Installer OpenSSL
sudo apt install openssl libssl-dev

# Vérifier l'installation
openssl version
```

## 🍎 **macOS**

### Avec Homebrew (recommandé) :
```bash
# Installer Homebrew si pas déjà fait
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer OpenSSL
brew install openssl

# Lier OpenSSL (si nécessaire)
brew link openssl --force

# Vérifier l'installation
openssl version
```

### Avec MacPorts :
```bash
sudo port install openssl
```

## 🪟 **Windows**

### Option 1 - Avec Chocolatey :
```powershell
# Installer Chocolatey si pas déjà fait
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Installer OpenSSL
choco install openssl
```

### Option 2 - Téléchargement direct :
1. Aller sur https://slproweb.com/products/Win32OpenSSL.html
2. Télécharger "Win64 OpenSSL v3.x.x" (version complète, pas Light)
3. Exécuter l'installateur
4. Ajouter `C:\Program Files\OpenSSL-Win64\bin` au PATH

## 🔧 **Après installation**

### Redémarrer le terminal et vérifier :
```bash
openssl version
```

### Réinstaller Prisma :
```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller les dépendances
npm install

# Régénérer le client Prisma
npx prisma generate
```

### Tester la connexion :
```bash
npm run db:push
```

## 🐳 **Si vous utilisez Docker**

Ajoutez ceci à votre Dockerfile :
```dockerfile
RUN apt-get update && apt-get install -y openssl libssl-dev
```

## ⚠️ **Notes importantes**

- **Redémarrez votre terminal** après l'installation
- **Vérifiez les variables d'environnement** PATH
- **Sur Windows**, vous devrez peut-être redémarrer complètement
- **Si le problème persiste**, essayez de réinstaller Node.js

## 🔍 **Diagnostic**

Si OpenSSL est installé mais Prisma ne le détecte pas :

```bash
# Vérifier où OpenSSL est installé
which openssl

# Vérifier les bibliothèques
ldd $(which openssl) | grep ssl

# Variables d'environnement (Linux/macOS)
export OPENSSL_ROOT_DIR=/usr/local/opt/openssl
export OPENSSL_LIB_DIR=/usr/local/opt/openssl/lib
export OPENSSL_INCLUDE_DIR=/usr/local/opt/openssl/include
```