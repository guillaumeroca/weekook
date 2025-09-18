#!/usr/bin/env node

/**
 * Script de déploiement pour WEEKOOK
 * Usage: node scripts/deploy.js [development|validation|production]
 */

const fs = require('fs');
const path = require('path');
const { loadConfig, displayConfig } = require('../config/config.cjs');

// Fonction pour générer le fichier .env
function generateEnvFile(config, environment) {
  const envContent = `# Configuration automatique pour l'environnement: ${environment}
# Généré automatiquement le ${new Date().toISOString()}

# Configuration de l'environnement
NODE_ENV="${config.environment.name}"
PORT=${config.ports.backend}

# URLs de l'application
BASE_URL="${config.urls.frontend}"
API_BASE_URL="${config.urls.backend}"

# Base de données
DATABASE_URL="${config.database.url}"
DATABASE_HOST="${config.database.host}"
DATABASE_PORT=${config.database.port}
DATABASE_NAME="${config.database.name}"
DATABASE_USER="${config.database.user}"
DATABASE_PASSWORD="${config.database.password}"

# Sécurité
JWT_SECRET="${config.security.jwtSecret}"
JWT_EXPIRES_IN="${config.security.jwtExpiresIn}"
CORS_ORIGIN="${config.security.corsOrigin}"
TRUST_PROXY=${config.security.trustProxy}

# Email
SMTP_HOST="${config.email.host}"
SMTP_PORT=${config.email.port}
SMTP_USER="${config.email.user}"
SMTP_PASS="${config.email.password}"

# Upload de fichiers
UPLOAD_MAX_SIZE=${config.upload.maxSize}
UPLOAD_ALLOWED_TYPES="${config.upload.allowedTypes.join(',')}"

# Ports pour Vite (frontend)
VITE_BACKEND_PORT=${config.ports.backend}
VITE_FRONTEND_PORT=${config.ports.frontend}
VITE_API_BASE_URL="${config.urls.backend}"
VITE_BASE_URL="${config.urls.frontend}"
`;

  return envContent;
}

// Fonction pour générer le fichier vite.config.ts
function generateViteConfig(config) {
  const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration générée automatiquement
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: ${config.ports.frontend},
  },
  optimizeDeps: {
    exclude: ['lucide-react', '@prisma/client'],
  },
  build: {
    rollupOptions: {
      external: ['@prisma/client', 'bcryptjs'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          auth: ['./src/contexts/AuthContext', './src/lib/auth', './src/api/auth'],
          ui: ['lucide-react', 'sonner', 'framer-motion'],
          forms: ['react-hook-form', 'react-day-picker', '@internationalized/date'],
          utils: ['date-fns']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
});
`;

  return viteConfigContent;
}

// Fonction principale de déploiement
function deploy(environment = 'development') {
  console.log(`🚀 Déploiement pour l'environnement: ${environment}`);
  
  try {
    // Charge la configuration
    const config = loadConfig(environment);
    
    // Affiche la configuration
    displayConfig(config);
    
    // Génère le fichier .env principal
    const envContent = generateEnvFile(config, environment);
    fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
    console.log('✅ Fichier .env généré');
    
    // Génère le fichier .env pour le serveur
    fs.writeFileSync(path.join(__dirname, '..', 'server', '.env'), envContent);
    console.log('✅ Fichier server/.env généré');
    
    // Génère le fichier vite.config.ts
    const viteConfigContent = generateViteConfig(config);
    fs.writeFileSync(path.join(__dirname, '..', 'vite.config.ts'), viteConfigContent);
    console.log('✅ Fichier vite.config.ts généré');
    
    // Génère le fichier de configuration pour le frontend
    const frontendConfig = `export const config = {
  api: {
    baseUrl: '${config.urls.api}',
    timeout: 30000,
  },
  app: {
    name: 'WEEKOOK',
    version: '1.0.0',
    environment: '${environment}',
  },
  urls: {
    backend: '${config.urls.backend}',
    frontend: '${config.urls.frontend}',
    api: '${config.urls.api}',
  },
};`;
    
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'config', 'generated.ts'), frontendConfig);
    console.log('✅ Configuration frontend générée');
    
    console.log('\n🎉 Déploiement terminé avec succès!');
    console.log(`📍 Environnement: ${environment}`);
    console.log(`🔙 Backend: ${config.urls.backend}:${config.ports.backend}`);
    console.log(`🖥️  Frontend: ${config.urls.frontend}:${config.ports.frontend}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error.message);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  deploy(environment);
}

module.exports = { deploy };