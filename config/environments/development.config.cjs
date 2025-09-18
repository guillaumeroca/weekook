/**
 * Configuration pour l'environnement de DÉVELOPPEMENT LOCAL
 * WEEKOOK - Environnement de développement
 */

module.exports = {
  // Informations sur l'environnement
  environment: {
    name: 'development',
    description: 'Environnement de développement local',
    debug: true,
  },

  // Configuration des ports
  ports: {
    backend: 5173,
    frontend: 5174,
    database: 3306,
  },

  // Configuration des URLs
  urls: {
    backend: 'http://localhost:5173',
    frontend: 'http://localhost:5174',
    api: 'http://localhost:5173/api',
  },

  // Configuration de la base de données MariaDB locale
  database: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    name: 'weekook_dev',
    user: 'weekook_user',
    password: 'weekook_password',
    url: 'mysql://weekook_user:weekook_password@localhost:3306/weekook_dev',
  },

  // Configuration de sécurité (développement)
  security: {
    jwtSecret: 'dev-jwt-secret-weekook-2024',
    jwtExpiresIn: '7d',
    corsOrigin: 'http://localhost:5174',
    trustProxy: false,
  },

  // Configuration email (développement - pas d'envoi réel)
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    password: '',
    from: 'noreply@weekook.dev',
    enabled: false, // Pas d'envoi d'email en dev
  },

  // Configuration des uploads
  upload: {
    maxSize: 10485760, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    path: './uploads/dev/',
  },

  // Configuration des logs
  logging: {
    level: 'debug',
    console: true,
    file: false,
  },

  // Variables d'environnement spécifiques
  env: {
    NODE_ENV: 'development',
    PORT: 5173,
    BASE_URL: 'http://localhost:5174',
    API_BASE_URL: 'http://localhost:5173',
    DATABASE_URL: 'mysql://weekook_user:weekook_password@localhost:3306/weekook_dev',
  },
};