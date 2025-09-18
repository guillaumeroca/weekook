/**
 * Configuration pour l'environnement de VALIDATION (VAL)
 * WEEKOOK - Environnement de tests et validation
 */

module.exports = {
  // Informations sur l'environnement
  environment: {
    name: 'validation',
    description: 'Environnement de validation et tests',
    debug: true,
  },

  // Configuration des ports
  ports: {
    backend: 3001,
    frontend: 3000,
    database: 3306,
  },

  // Configuration des URLs
  urls: {
    backend: 'https://val-api.weekook.com',
    frontend: 'https://val.weekook.com',
    api: 'https://val-api.weekook.com/api',
  },

  // Configuration de la base de données Infomaniak (VAL)
  database: {
    type: 'mysql',
    host: '6501ew.myd.infomaniak.com',
    port: 3306,
    name: '6501ew_WeeKooK_VAL',
    user: '6501ew_WeekookVA',
    password: 'Weekookmania1-1',
    url: 'mysql://6501ew_WeekookVA:Weekookmania1-1@6501ew.myd.infomaniak.com/6501ew_WeeKooK_VAL',
  },

  // Configuration de sécurité (validation)
  security: {
    jwtSecret: 'VAL-JWT-SECRET-WEEKOOK-2024-CHANGE-ME',
    jwtExpiresIn: '7d',
    corsOrigin: 'https://val.weekook.com',
    trustProxy: true,
  },

  // Configuration email (validation - envoi réel)
  email: {
    host: 'mail.infomaniak.com',
    port: 587,
    user: 'noreply@weekook.com',
    password: 'VOTRE_PASSWORD_EMAIL_VAL',
    from: 'noreply@weekook.com',
    enabled: true,
  },

  // Configuration des uploads
  upload: {
    maxSize: 10485760, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    path: './uploads/val/',
  },

  // Configuration des logs
  logging: {
    level: 'info',
    console: true,
    file: true,
    path: './logs/val/',
  },

  // Variables d'environnement spécifiques
  env: {
    NODE_ENV: 'validation',
    PORT: 3001,
    BASE_URL: 'https://val.weekook.com',
    API_BASE_URL: 'https://val-api.weekook.com',
    DATABASE_URL: 'mysql://6501ew_WeekookVA:Weekookmania1-1@6501ew.myd.infomaniak.com/6501ew_WeeKooK_VAL',
  },
};