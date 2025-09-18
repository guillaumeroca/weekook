# Configuration WEEKOOK

Ce répertoire contient la configuration centralisée pour l'application WEEKOOK, facilitant le déploiement sur différents environnements.

## Structure des fichiers

```
config/
├── README.md                    # Ce fichier
├── config.js                   # Gestionnaire de configuration principal
├── app.config.js               # Configuration globale (obsolète)
└── environments/
    ├── development.config.js   # Configuration pour le développement local
    ├── validation.config.js    # Configuration pour l'environnement VAL
    └── production.config.js    # Configuration pour la production
```

## Environnements disponibles

### 🔧 Development (Développement local)
- **Backend**: `http://localhost:5173`
- **Frontend**: `http://localhost:5174`
- **Base de données**: MariaDB locale (`weekook_dev`)
- **Debug**: Activé
- **Email**: Désactivé

### 🧪 Validation (VAL)
- **Backend**: `https://val-api.weekook.com`
- **Frontend**: `https://val.weekook.com`
- **Base de données**: Infomaniak (`6501ew_WeeKooK_VAL`)
- **Debug**: Activé
- **Email**: Activé

### 🚀 Production
- **Backend**: `https://api.weekook.com`
- **Frontend**: `https://weekook.com`
- **Base de données**: Infomaniak (`6501ew_WeeKooK_PROD`)
- **Debug**: Désactivé
- **Email**: Activé

## Utilisation

### Déploiement automatique

```bash
# Déploiement en développement
npm run deploy:dev

# Déploiement en validation
npm run deploy:val

# Déploiement en production
npm run deploy:prod
```

### Configuration manuelle

```javascript
// Dans votre code Node.js
const { loadConfig } = require('./config/config');

// Charge la configuration pour l'environnement actuel
const config = loadConfig();

// Ou charge une configuration spécifique
const devConfig = loadConfig('development');
```

### Affichage de la configuration

```bash
# Affiche la configuration actuelle
npm run config:show
```

## Personnalisation

### Ajouter un nouvel environnement

1. Créer un fichier `environments/mon-environnement.config.js`
2. Suivre la structure des fichiers existants
3. Ajouter un script dans `package.json` :
   ```json
   "deploy:mon-env": "node scripts/deploy.js mon-environnement"
   ```

### Modifier une configuration

1. Éditer le fichier de configuration correspondant dans `environments/`
2. Relancer le déploiement :
   ```bash
   npm run deploy:dev  # ou deploy:val, deploy:prod
   ```

## Variables d'environnement générées

Le script de déploiement génère automatiquement :

- `.env` (racine du projet)
- `server/.env` (configuration serveur)
- `vite.config.ts` (configuration Vite)
- `src/config/generated.ts` (configuration frontend)

## Sécurité

⚠️ **Important** : Les fichiers de configuration contiennent des informations sensibles.

- **Ne jamais** commiter les mots de passe en dur
- Utiliser des variables d'environnement pour les secrets
- Changer les clés JWT par défaut en production

## Validation

Le système valide automatiquement :
- Présence des champs requis
- Cohérence des ports
- Validité des URLs de base de données

## Logs

- **Development**: Logs détaillés + console
- **Validation**: Logs d'info + fichiers
- **Production**: Logs d'erreur uniquement + fichiers

## Support

En cas de problème avec la configuration :

1. Vérifier que le fichier d'environnement existe
2. Valider la syntaxe JavaScript
3. Tester avec `npm run config:show`
4. Consulter les logs de déploiement