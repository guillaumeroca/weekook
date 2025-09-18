/**
 * Gestionnaire de configuration pour WEEKOOK
 * Ce fichier charge la configuration appropriée selon l'environnement
 */

const path = require('path');
const fs = require('fs');

/**
 * Charge la configuration pour l'environnement spécifié
 * @param {string} environment - L'environnement (development, validation, production)
 * @returns {Object} Configuration pour l'environnement
 */
function loadConfig(environment = null) {
  // Détermine l'environnement
  const env = environment || process.env.NODE_ENV || 'development';
  
  // Chemin vers le fichier de configuration
  const configPath = path.join(__dirname, 'environments', `${env}.config.cjs`);
  
  // Vérifie si le fichier existe
  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  Configuration pour l'environnement '${env}' non trouvée. Utilisation de la configuration par défaut.`);
    return loadConfig('development');
  }
  
  try {
    const config = require(configPath);
    console.log(`✅ Configuration chargée pour l'environnement: ${env}`);
    return config;
  } catch (error) {
    console.error(`❌ Erreur lors du chargement de la configuration pour ${env}:`, error.message);
    throw error;
  }
}

/**
 * Applique la configuration aux variables d'environnement
 * @param {Object} config - Configuration à appliquer
 */
function applyConfig(config) {
  if (config.env) {
    Object.keys(config.env).forEach(key => {
      if (!process.env[key]) {
        process.env[key] = config.env[key];
      }
    });
  }
}

/**
 * Valide la configuration
 * @param {Object} config - Configuration à valider
 * @returns {boolean} True si la configuration est valide
 */
function validateConfig(config) {
  const requiredFields = ['environment', 'ports', 'urls', 'database'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      console.error(`❌ Champ requis manquant dans la configuration: ${field}`);
      return false;
    }
  }
  
  // Validation des ports
  if (!config.ports.backend || !config.ports.frontend) {
    console.error('❌ Ports backend et frontend requis');
    return false;
  }
  
  // Validation de la base de données
  if (!config.database.url) {
    console.error('❌ URL de la base de données requise');
    return false;
  }
  
  return true;
}

/**
 * Affiche les informations de configuration
 * @param {Object} config - Configuration à afficher
 */
function displayConfig(config) {
  console.log('\n🔧 Configuration WEEKOOK');
  console.log('========================');
  console.log(`📍 Environnement: ${config.environment.name}`);
  console.log(`📝 Description: ${config.environment.description}`);
  console.log(`🔙 Backend: ${config.urls.backend}:${config.ports.backend}`);
  console.log(`🖥️  Frontend: ${config.urls.frontend}:${config.ports.frontend}`);
  console.log(`🗄️  Base de données: ${config.database.host}:${config.database.port}/${config.database.name}`);
  console.log(`🔐 JWT Secret: ${config.security.jwtSecret.substring(0, 10)}...`);
  console.log(`📧 Email activé: ${config.email.enabled ? '✅' : '❌'}`);
  console.log('========================\n');
}

// Charge la configuration par défaut
const currentConfig = loadConfig();

// Valide la configuration
if (!validateConfig(currentConfig)) {
  throw new Error('Configuration invalide');
}

// Applique la configuration
applyConfig(currentConfig);

// Affiche la configuration (seulement en développement)
if (currentConfig.environment.debug) {
  displayConfig(currentConfig);
}

module.exports = {
  loadConfig,
  applyConfig,
  validateConfig,
  displayConfig,
  current: currentConfig,
};