#!/usr/bin/env node

/**
 * Script de sécurisation automatique pour WEEKOOK
 * Applique les corrections de sécurité
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(level, message) {
  const levelColors = {
    'ERROR': colors.red,
    'WARN': colors.yellow,
    'INFO': colors.blue,
    'SUCCESS': colors.green
  };
  console.log(`${levelColors[level]}[${level}]${colors.reset} ${message}`);
}

class SecurityHardening {
  constructor() {
    this.fixes = [];
  }

  // 1. Génération de secrets sécurisés
  generateSecureSecrets() {
    log('INFO', 'Génération de secrets sécurisés...');
    
    const secrets = {
      JWT_SECRET: crypto.randomBytes(64).toString('hex'),
      SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
      ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
      API_KEY: crypto.randomUUID()
    };

    return secrets;
  }

  // 2. Sécurisation des fichiers .env
  secureEnvFiles() {
    log('INFO', 'Sécurisation des fichiers .env...');
    
    const envFiles = ['.env', 'server/.env'];
    const secrets = this.generateSecureSecrets();
    
    envFiles.forEach(envFile => {
      const filePath = path.join(__dirname, envFile);
      
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remplacer les secrets faibles
        const replacements = [
          { pattern: /JWT_SECRET="?[^"\n]*"?/g, replacement: `JWT_SECRET="${secrets.JWT_SECRET}"` },
          { pattern: /SESSION_SECRET="?[^"\n]*"?/g, replacement: `SESSION_SECRET="${secrets.SESSION_SECRET}"` },
          { pattern: /ENCRYPTION_KEY="?[^"\n]*"?/g, replacement: `ENCRYPTION_KEY="${secrets.ENCRYPTION_KEY}"` }
        ];

        let changed = false;
        replacements.forEach(({ pattern, replacement }) => {
          if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            changed = true;
          }
        });

        // Ajouter des secrets manquants
        if (!content.includes('JWT_SECRET')) {
          content += `\n# Secrets sécurisés générés automatiquement\nJWT_SECRET="${secrets.JWT_SECRET}"\n`;
          changed = true;
        }

        if (changed) {
          fs.writeFileSync(filePath, content);
          this.fixes.push(`Secrets mis à jour dans ${envFile}`);
          log('SUCCESS', `Secrets sécurisés générés pour ${envFile}`);
        }

        // Sécuriser les permissions
        try {
          fs.chmodSync(filePath, 0o600); // Lecture/écriture pour le propriétaire seulement
          log('SUCCESS', `Permissions sécurisées pour ${envFile}`);
        } catch (error) {
          log('WARN', `Impossible de changer les permissions de ${envFile}: ${error.message}`);
        }
      }
    });
  }

  // 3. Créer un .gitignore sécurisé
  secureGitignore() {
    log('INFO', 'Mise à jour du .gitignore...');
    
    const gitignorePath = path.join(__dirname, '.gitignore');
    const securePatterns = [
      '# Fichiers sensibles',
      '.env',
      '.env.local',
      '.env.production',
      '.env.development',
      'server/.env',
      '',
      '# Logs et debugging',
      '*.log',
      'logs/',
      'debug/',
      '',
      '# Sauvegardes',
      'backup-*.tar.gz',
      'backup-*/',
      '*.sql',
      '',
      '# Clés et certificats',
      '*.key',
      '*.pem',
      '*.crt',
      'ssl/',
      '',
      '# Rapports de sécurité',
      'security-report.json',
      'audit-report.json',
      '',
      '# Node modules',
      'node_modules/',
      'server/node_modules/',
      '',
      '# Build',
      'dist/',
      'build/',
      '',
      '# IDE',
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',
      '',
      '# OS',
      '.DS_Store',
      'Thumbs.db'
    ];

    let existingContent = '';
    if (fs.existsSync(gitignorePath)) {
      existingContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const newPatterns = securePatterns.filter(pattern => {
      return pattern === '' || pattern.startsWith('#') || !existingContent.includes(pattern);
    });

    if (newPatterns.length > 0) {
      const updatedContent = existingContent + '\n' + newPatterns.join('\n');
      fs.writeFileSync(gitignorePath, updatedContent);
      this.fixes.push('Patterns de sécurité ajoutés au .gitignore');
      log('SUCCESS', '.gitignore mis à jour avec les patterns de sécurité');
    }
  }

  // 4. Créer un fichier de configuration de sécurité
  createSecurityConfig() {
    log('INFO', 'Création de la configuration de sécurité...');
    
    const securityConfig = {
      version: "1.0.0",
      lastUpdate: new Date().toISOString(),
      security: {
        headers: {
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff",
          "X-XSS-Protection": "1; mode=block",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        },
        cors: {
          origin: ["http://localhost:3000", "http://localhost:5174"],
          credentials: true,
          optionsSuccessStatus: 200
        },
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100, // limite à 100 requêtes par fenêtre
          message: "Too many requests from this IP"
        },
        session: {
          secure: false, // true en production avec HTTPS
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 heures
          sameSite: 'strict'
        },
        bcrypt: {
          saltRounds: 12
        }
      },
      monitoring: {
        logLevel: "info",
        logRequests: true,
        logErrors: true,
        alertOnFailedAuth: true
      }
    };

    const configPath = path.join(__dirname, 'security.config.json');
    fs.writeFileSync(configPath, JSON.stringify(securityConfig, null, 2));
    this.fixes.push('Configuration de sécurité créée');
    log('SUCCESS', 'Configuration de sécurité créée: security.config.json');
  }

  // 5. Créer un script de vérification de sécurité
  createSecurityMiddleware() {
    log('INFO', 'Création du middleware de sécurité...');
    
    const middlewareCode = `/**
 * Middleware de sécurité pour WEEKOOK
 * À intégrer dans server/app.js
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import session from 'express-session';

// Configuration de sécurité
const securityConfig = {
  headers: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000", "http://localhost:5174"],
    credentials: true,
    optionsSuccessStatus: 200
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: "Too many requests from this IP" }
  }
};

export function setupSecurity(app) {
  // Helmet pour les headers de sécurité
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:"]
      }
    },
    frameguard: { action: 'deny' }
  }));

  // CORS sécurisé
  app.use(cors(securityConfig.cors));

  // Rate limiting
  const limiter = rateLimit(securityConfig.rateLimit);
  app.use('/api', limiter);

  // Rate limiting plus strict pour l'authentification
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many authentication attempts" }
  });
  app.use('/api/auth', authLimiter);

  // Middleware de logging de sécurité
  app.use((req, res, next) => {
    // Logger les tentatives d'accès suspects
    if (req.path.includes('..') || req.path.includes('admin') || req.path.includes('config')) {
      console.warn(\`[SECURITY] Suspicious access attempt: \${req.ip} -> \${req.path}\`);
    }
    next();
  });

  console.log('🔒 Middleware de sécurité activé');
}

export { securityConfig };`;

    const middlewarePath = path.join(__dirname, 'server/security-middleware.js');
    fs.writeFileSync(middlewarePath, middlewareCode);
    this.fixes.push('Middleware de sécurité créé');
    log('SUCCESS', 'Middleware de sécurité créé: server/security-middleware.js');
  }

  // 6. Installer les dépendances de sécurité
  addSecurityDependencies() {
    log('INFO', 'Ajout des dépendances de sécurité...');
    
    const packageJsonPath = path.join(__dirname, 'server/package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const securityDeps = {
        "helmet": "^7.1.0",
        "express-rate-limit": "^7.1.5",
        "express-session": "^1.17.3",
        "joi": "^17.11.0",
        "bcryptjs": "^2.4.3"
      };

      let changed = false;
      Object.entries(securityDeps).forEach(([dep, version]) => {
        if (!packageJson.dependencies[dep]) {
          packageJson.dependencies[dep] = version;
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.fixes.push('Dépendances de sécurité ajoutées au package.json');
        log('SUCCESS', 'Dépendances de sécurité ajoutées. Exécutez "cd server && npm install"');
      }
    }
  }

  // Lancer la sécurisation
  async secure() {
    console.log('🔒 SÉCURISATION DE L\\'ENVIRONNEMENT WEEKOOK');
    console.log('==========================================\\n');
    
    this.secureEnvFiles();
    this.secureGitignore();
    this.createSecurityConfig();
    this.createSecurityMiddleware();
    this.addSecurityDependencies();
    
    // Rapport final
    console.log('\\n' + '='.repeat(50));
    log('SUCCESS', 'SÉCURISATION TERMINÉE');
    console.log('='.repeat(50));
    
    this.fixes.forEach((fix, index) => {
      console.log(\`\${colors.green}✅ \${index + 1}.\${colors.reset} \${fix}\`);
    });
    
    console.log('\\n📋 PROCHAINES ÉTAPES:');
    console.log('1. cd server && npm install (installer les dépendances de sécurité)');
    console.log('2. Intégrer le middleware dans server/app.js');
    console.log('3. Tester avec: node security-audit.js');
    console.log('4. Vérifier que tout fonctionne: npm run dev');
    
    return true;
  }
}

// Lancer la sécurisation
const hardening = new SecurityHardening();
hardening.secure().catch(error => {
  log('ERROR', \`Erreur lors de la sécurisation: \${error.message}\`);
  process.exit(1);
});