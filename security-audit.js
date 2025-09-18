#!/usr/bin/env node

/**
 * Script d'audit de sécurité pour WEEKOOK
 * Vérification des vulnérabilités et bonnes pratiques
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CRITICAL_FILES = ['.env', 'server/.env', 'config/', 'server/app.js'];
const SENSITIVE_PATTERNS = [
  /password\s*[:=]\s*["'][^"']*["']/gi,
  /secret\s*[:=]\s*["'][^"']*["']/gi,
  /token\s*[:=]\s*["'][^"']*["']/gi,
  /api[_-]?key\s*[:=]\s*["'][^"']*["']/gi,
  /jwt[_-]?secret\s*[:=]\s*["'][^"']*["']/gi,
  /database[_-]?password\s*[:=]\s*["'][^"']*["']/gi
];

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const levelColors = {
    'ERROR': colors.red,
    'WARN': colors.yellow,
    'INFO': colors.blue,
    'SUCCESS': colors.green,
    'CRITICAL': colors.magenta
  };
  
  console.log(`${levelColors[level]}[${level}]${colors.reset} ${colors.bright}${timestamp}${colors.reset} - ${message}`);
}

class SecurityAudit {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.info = [];
  }

  addIssue(severity, category, message, file = null) {
    const issue = { severity, category, message, file, timestamp: new Date() };
    
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      this.issues.push(issue);
      log('ERROR', `${category}: ${message}${file ? ` (${file})` : ''}`);
    } else if (severity === 'MEDIUM') {
      this.warnings.push(issue);
      log('WARN', `${category}: ${message}${file ? ` (${file})` : ''}`);
    } else {
      this.info.push(issue);
      log('INFO', `${category}: ${message}${file ? ` (${file})` : ''}`);
    }
  }

  // 1. Vérification des fichiers sensibles
  checkSensitiveFiles() {
    log('INFO', 'Vérification des fichiers sensibles...');
    
    const sensitiveFiles = [
      '.env',
      'server/.env',
      'config/environments/development.config.cjs',
      'config/environments/production.config.cjs',
      'prisma/schema.prisma'
    ];

    sensitiveFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier les mots de passe faibles
        if (content.includes('password') && (
          content.includes('123') || 
          content.includes('password') || 
          content.includes('admin') ||
          content.includes('root')
        )) {
          this.addIssue('HIGH', 'WEAK_PASSWORD', 'Mot de passe faible détecté', file);
        }

        // Vérifier les secrets par défaut
        if (content.includes('CHANGE-ME') || content.includes('your-secret')) {
          this.addIssue('CRITICAL', 'DEFAULT_SECRET', 'Secret par défaut non changé', file);
        }

        // Vérifier les patterns sensibles
        SENSITIVE_PATTERNS.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            this.addIssue('MEDIUM', 'EXPOSED_CREDENTIAL', 'Credential potentiellement exposé', file);
          }
        });

        this.addIssue('LOW', 'FILE_CHECK', `Fichier sensible vérifié`, file);
      } else {
        this.addIssue('MEDIUM', 'MISSING_FILE', `Fichier de configuration manquant`, file);
      }
    });
  }

  // 2. Vérification des dépendances
  checkDependencies() {
    log('INFO', 'Vérification des dépendances...');
    
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Vérifier les dépendances obsolètes/dangereuses
      const dangerousDeps = ['eval', 'serialize-javascript', 'handlebars'];
      const deprecatedDeps = ['request', 'mkdirp'];
      
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      Object.keys(allDeps).forEach(dep => {
        if (dangerousDeps.includes(dep)) {
          this.addIssue('HIGH', 'DANGEROUS_DEPENDENCY', `Dépendance dangereuse: ${dep}`, 'package.json');
        }
        if (deprecatedDeps.includes(dep)) {
          this.addIssue('MEDIUM', 'DEPRECATED_DEPENDENCY', `Dépendance obsolète: ${dep}`, 'package.json');
        }
      });

      this.addIssue('LOW', 'DEPENDENCY_CHECK', `${Object.keys(allDeps).length} dépendances vérifiées`);
    }
  }

  // 3. Vérification du code source
  checkSourceCode() {
    log('INFO', 'Vérification du code source...');
    
    const sourceFiles = this.findFiles(['src/', 'server/'], ['.js', '.ts', '.tsx']);
    
    sourceFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Vérifier console.log en production
        if (content.includes('console.log')) {
          this.addIssue('LOW', 'DEBUG_CODE', 'console.log trouvé (à supprimer en production)', file);
        }

        // Vérifier eval()
        if (content.includes('eval(')) {
          this.addIssue('CRITICAL', 'CODE_INJECTION', 'Usage de eval() détecté', file);
        }

        // Vérifier innerHTML
        if (content.includes('innerHTML')) {
          this.addIssue('MEDIUM', 'XSS_RISK', 'Usage de innerHTML (risque XSS)', file);
        }

        // Vérifier les URLs hardcodées
        const urlPattern = /https?:\/\/[^\s"']+/g;
        const urls = content.match(urlPattern);
        if (urls && urls.some(url => !url.includes('localhost') && !url.includes('127.0.0.1'))) {
          this.addIssue('LOW', 'HARDCODED_URL', 'URL externe hardcodée', file);
        }
      }
    });
  }

  // 4. Vérification de la configuration serveur
  checkServerConfig() {
    log('INFO', 'Vérification de la configuration serveur...');
    
    const serverAppPath = path.join(__dirname, 'server/app.js');
    if (fs.existsSync(serverAppPath)) {
      const content = fs.readFileSync(serverAppPath, 'utf8');
      
      // Vérifier CORS
      if (!content.includes('cors')) {
        this.addIssue('HIGH', 'MISSING_CORS', 'Configuration CORS manquante', 'server/app.js');
      }

      // Vérifier helmet (sécurité headers)
      if (!content.includes('helmet')) {
        this.addIssue('MEDIUM', 'MISSING_SECURITY_HEADERS', 'Headers de sécurité manquants (helmet)', 'server/app.js');
      }

      // Vérifier rate limiting
      if (!content.includes('rateLimit') && !content.includes('express-rate-limit')) {
        this.addIssue('MEDIUM', 'MISSING_RATE_LIMIT', 'Rate limiting manquant', 'server/app.js');
      }

      // Vérifier la validation des inputs
      if (!content.includes('joi') && !content.includes('yup') && !content.includes('zod')) {
        this.addIssue('HIGH', 'MISSING_INPUT_VALIDATION', 'Validation des inputs manquante', 'server/app.js');
      }
    }
  }

  // 5. Vérification des permissions fichiers
  checkFilePermissions() {
    log('INFO', 'Vérification des permissions fichiers...');
    
    const criticalFiles = ['.env', 'server/.env', 'server/app.js'];
    
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = stats.mode;
          
          // Vérifier que les fichiers .env ne sont pas lisibles par tous
          if (file.includes('.env') && (mode & parseInt('044', 8))) {
            this.addIssue('HIGH', 'INSECURE_PERMISSIONS', 'Fichier .env lisible par tous', file);
          }
        } catch (error) {
          this.addIssue('LOW', 'PERMISSION_CHECK_FAILED', `Impossible de vérifier les permissions: ${error.message}`, file);
        }
      }
    });
  }

  // Utilitaire pour trouver des fichiers
  findFiles(directories, extensions) {
    const files = [];
    
    directories.forEach(dir => {
      const fullDir = path.join(__dirname, dir);
      if (fs.existsSync(fullDir)) {
        const dirFiles = fs.readdirSync(fullDir, { recursive: true });
        dirFiles.forEach(file => {
          if (typeof file === 'string' && extensions.some(ext => file.endsWith(ext))) {
            files.push(path.join(fullDir, file));
          }
        });
      }
    });
    
    return files;
  }

  // Générer le rapport
  generateReport() {
    log('INFO', 'Génération du rapport de sécurité...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        critical: this.issues.filter(i => i.severity === 'CRITICAL').length,
        high: this.issues.filter(i => i.severity === 'HIGH').length,
        medium: this.warnings.filter(w => w.severity === 'MEDIUM').length,
        low: this.info.filter(i => i.severity === 'LOW').length,
        total: this.issues.length + this.warnings.length + this.info.length
      },
      issues: this.issues,
      warnings: this.warnings,
      info: this.info
    };

    // Sauvegarder le rapport
    fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));
    
    // Afficher le résumé
    console.log('\n' + '='.repeat(60));
    log('SUCCESS', 'RAPPORT DE SÉCURITÉ WEEKOOK');
    console.log('='.repeat(60));
    
    console.log(`${colors.magenta}🔴 CRITIQUES:${colors.reset} ${report.summary.critical}`);
    console.log(`${colors.red}🟠 ÉLEVÉES:${colors.reset}   ${report.summary.high}`);
    console.log(`${colors.yellow}🟡 MOYENNES:${colors.reset}  ${report.summary.medium}`);
    console.log(`${colors.blue}🔵 FAIBLES:${colors.reset}   ${report.summary.low}`);
    console.log(`${colors.bright}📊 TOTAL:${colors.reset}     ${report.summary.total}`);
    
    console.log('\n' + '='.repeat(60));
    
    if (report.summary.critical > 0) {
      log('ERROR', 'ATTENTION: Des vulnérabilités critiques ont été détectées!');
      return false;
    } else if (report.summary.high > 0) {
      log('WARN', 'Des vulnérabilités élevées nécessitent votre attention');
      return false;
    } else {
      log('SUCCESS', 'Aucune vulnérabilité critique détectée');
      return true;
    }
  }

  // Lancer l'audit complet
  async runAudit() {
    console.log(`${colors.cyan}🔒 AUDIT DE SÉCURITÉ WEEKOOK${colors.reset}`);
    console.log(`${colors.cyan}==============================${colors.reset}\n`);
    
    this.checkSensitiveFiles();
    this.checkDependencies();
    this.checkSourceCode();
    this.checkServerConfig();
    this.checkFilePermissions();
    
    return this.generateReport();
  }
}

// Lancer l'audit
const audit = new SecurityAudit();
audit.runAudit().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log('ERROR', `Erreur lors de l'audit: ${error.message}`);
  process.exit(1);
});