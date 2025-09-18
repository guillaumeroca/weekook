/**
 * Configuration pour l'environnement de PRODUCTION
 * WEEKOOK - Environnement de production
 */

module.exports = {
  // Informations sur l'environnement
  environment: {
    name: 'production',
    description: 'Environnement de production',
    debug: false,
  },

  // Configuration des ports
  ports: {
    backend: 3001,
    frontend: 80,
    database: 3306,
  },

  // Configuration des URLs
  urls: {
    backend: 'https://api.weekook.com',
    frontend: 'https://weekook.com',
    api: 'https://api.weekook.com/api',
  },

  // Configuration de la base de données Infomaniak (PRODUCTION)
  database: {
    type: 'mysql',
    host: '6501ew.myd.infomaniak.com',
    port: 3306,
    name: '6501ew_WeeKooK_PRD',
    user: '6501ew_WeekookPR',
    password: 'PRODUCTION_PASSWORD_CHANGE_ME',
    url: 'mysql://6501ew_WeekookPR:PRODUCTION_PASSWORD_CHANGE_ME@6501ew.myd.infomaniak.com/6501ew_WeeKooK_PRD',
  },

  // Configuration de sécurité (production)
  security: {
    jwtSecret: 'PRODUCTION-JWT-SECRET-WEEKOOK-2024-ULTRA-SECURE-CHANGE-ME',
    jwtExpiresIn: '7d',
    corsOrigin: 'https://weekook.com',
    trustProxy: true,
  },

  // Configuration email (production - envoi réel)
  email: {
    host: 'mail.infomaniak.com',
    port: 587,
    user: 'noreply@weekook.com',
    password: 'PRODUCTION_EMAIL_PASSWORD_CHANGE_ME',
    from: 'noreply@weekook.com',
    enabled: true,
  },

  // Configuration des uploads
  upload: {
    maxSize: 10485760, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    path: './uploads/prod/',
  },

  // Configuration des logs
  logging: {
    level: 'warn',
    console: false,
    file: true,
    path: './logs/prod/',
  },

  // Variables d'environnement spécifiques
  env: {
    NODE_ENV: 'production',
    PORT: 3001,
    BASE_URL: 'https://weekook.com',
    API_BASE_URL: 'https://api.weekook.com',
    DATABASE_URL: 'mysql://6501ew_WeekookPROD:PRODUCTION_PASSWORD_CHANGE_ME@6501ew.myd.infomaniak.com/6501ew_WeeKooK_PROD',
  },
};