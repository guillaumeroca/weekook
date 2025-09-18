# WEEKOOK - Configuration MariaDB

## 🗄️ Configuration de la base de données MariaDB distante

### 1. Prérequis

- Serveur MariaDB accessible
- Utilisateur avec privilèges de création de base de données
- Node.js et npm installés

### 2. Configuration de la connexion

1. **Modifiez le fichier `.env`** avec vos informations de connexion :

```env
DATABASE_URL="mysql://utilisateur:motdepasse@host:port/nom_base"
```

**Exemples :**
```env
# Serveur local
DATABASE_URL="mysql://root:password@localhost:3306/weekook_db"

# Serveur distant
DATABASE_URL="mysql://weekook_user:secure_password@192.168.1.100:3306/weekook_production"

# Service cloud (ex: PlanetScale, AWS RDS)
DATABASE_URL="mysql://user:pass@db.example.com:3306/weekook_db?sslaccept=strict"
```

### 3. Installation et configuration

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Créer les tables dans la base de données
npm run db:push

# (Optionnel) Peupler avec des données de test
npm run db:seed
```

### 4. Scripts disponibles

```bash
# Développement
npm run dev                 # Démarrer l'application
npm run db:studio          # Interface graphique Prisma

# Base de données
npm run db:generate        # Générer le client Prisma
npm run db:push           # Synchroniser le schéma
npm run db:migrate        # Créer une migration
npm run db:seed           # Peupler avec des données de test

# Production
npm run build             # Construire l'application
npm run preview           # Prévisualiser la build
```

### 5. Structure de la base de données

#### Tables principales :
- **users** : Utilisateurs de base
- **kooker_profiles** : Profils des kookers
- **specialty_cards** : Fiches spécialités
- **bookings** : Réservations
- **reviews** : Avis clients

### 6. Sécurité

- ✅ Mots de passe hashés avec bcrypt
- ✅ Relations avec contraintes de clés étrangères
- ✅ Validation des données avec Prisma
- ✅ Soft delete pour les données importantes

### 7. Dépannage

#### Erreur de connexion :
```bash
# Vérifier la connexion
npm run db:studio
```

#### Réinitialiser la base :
```bash
# Attention : supprime toutes les données !
npm run db:push -- --force-reset
npm run db:seed
```

#### Problèmes de SSL :
Ajoutez `?sslaccept=strict` ou `?ssl={"rejectUnauthorized":false}` à votre DATABASE_URL

### 8. Données de test

Après le seeding, vous pouvez vous connecter avec :
- **Client** : `client@weekook.fr` / `password123`
- **Kooker** : `marie@weekook.fr` / `password123`

---

## 🚀 Déploiement

Pour déployer en production :

1. Configurez votre base MariaDB de production
2. Mettez à jour la `DATABASE_URL` de production
3. Exécutez les migrations : `npm run db:push`
4. Construisez l'application : `npm run build`

---

**Note** : MariaDB est compatible avec le driver MySQL de Prisma. Aucune configuration spéciale n'est requise.