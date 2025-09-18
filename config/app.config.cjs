/**
 * Configuration centralisée pour l'application WEEKOOK
 * Ce fichier centralise tous les paramètres de l'application pour faciliter le déploiement
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  // Configuration de l'environnement
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    isProduction,
    isDevelopment,
  },

  // Configuration des ports
  ports: {
    // Port du serveur backend API
    backend: parseInt(process.env.BACKEND_PORT || '5173'),
    // Port du serveur frontend (Vite en dev, serveur web en prod)
    frontend: parseInt(process.env.FRONTEND_PORT || '5174'),
    // Port de la base de données
    database: parseInt(process.env.DATABASE_PORT || '3306'),
  },

  // Configuration des URLs
  urls: {
    // URL complète du backend API
    backend: process.env.API_BASE_URL || `http://localhost:${parseInt(process.env.BACKEND_PORT || '5173')}`,
    // URL complète du frontend
    frontend: process.env.BASE_URL || `http://localhost:${parseInt(process.env.FRONTEND_PORT || '5174')}`,
    // URL de l'API avec le path
    api: process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api` : `http://localhost:${parseInt(process.env.BACKEND_PORT || '5173')}/api`,
  },

  // Configuration de la base de données
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    name: process.env.DATABASE_NAME || (isDevelopment ? 'weekook_dev' : 'weekook_prod'),
    user: process.env.DATABASE_USER || 'weekook_user',
    password: process.env.DATABASE_PASSWORD || 'weekook_password',
    // URL complète de la base de données
    url: process.env.DATABASE_URL || `mysql://${process.env.DATABASE_USER || 'weekook_user'}:${process.env.DATABASE_PASSWORD || 'weekook_password'}@${process.env.DATABASE_HOST || 'localhost'}:${parseInt(process.env.DATABASE_PORT || '3306')}/${process.env.DATABASE_NAME || (isDevelopment ? 'weekook_dev' : 'weekook_prod')}`,
  },

  // Configuration de sécurité
  security: {
    jwtSecret: process.env.JWT_SECRET || 'votre-cle-secrete-jwt-changez-moi-en-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN || (isDevelopment ? `http://localhost:${parseInt(process.env.FRONTEND_PORT || '5174')}` : 'https://weekook.com'),
  },

  // Configuration email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
  },

  // Configuration des uploads
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB par défaut
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Configuration des environnements prédéfinis
  environments: {
    development: {
      backend: {
        port: 5173,
        url: 'http://localhost:5173',
      },
      frontend: {
        port: 5174,
        url: 'http://localhost:5174',
      },
      database: {
        host: 'localhost',
        port: 3306,
        name: 'weekook_dev',
        user: 'weekook_user',
        password: 'weekook_password',
      },
    },
    production: {
      backend: {
        port: 3001,
        url: 'https://api.weekook.com',
      },
      frontend: {
        port: 80,
        url: 'https://weekook.com',
      },
      database: {
        host: '6501ew.myd.infomaniak.com',
        port: 3306,
        name: '6501ew_WeeKooK_VAL',
        user: '6501ew_WeekookVA',
        password: 'Weekookmania1-1',
      },
    },
  },
};

module.exports = config;