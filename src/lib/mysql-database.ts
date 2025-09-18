import mysql from 'mysql2/promise';

// Configuration de la connexion MariaDB
const dbConfig = {
  host: '6501ew.myd.infomaniak.com',
  user: '6501ew_WeekookVA',
  password: 'Weekookmania1-1',
  database: '6501ew_WeeKooK_VAL',
  port: 3306,
  ssl: false, // Désactiver SSL pour commencer
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,
};

// Pool de connexions
let pool: mysql.Pool;

export function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
      queueLimit: 0,
      reconnect: true,
      acquireTimeout: 60000,
      timeout: 60000,
    });
  }
  return pool;
}

// Test de connexion
export async function testMySQLConnection() {
  try {
    console.log('🔄 Test de connexion MySQL directe...');
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion MySQL réussie !');
    
    // Test de requête simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Requête test exécutée:', rows);
    
    // Lister les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Tables dans la base:', tables);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL:', error.message);
    
    // Essayer avec différentes configurations
    if (error.code === 'ENOTFOUND') {
      console.log('🔄 Tentative avec mysql.infomaniak.com...');
      return await testAlternativeHosts();
    }
    
    return false;
  }
}

async function testAlternativeHosts() {
  const alternativeHosts = [
    'mysql.infomaniak.com',
    'mysql1.infomaniak.com',
    'mysql2.infomaniak.com',
    'db.infomaniak.com',
  ];
  
  for (const host of alternativeHosts) {
    try {
      console.log(`🔄 Test avec ${host}...`);
      const connection = await mysql.createConnection({
        ...dbConfig,
        host,
      });
      console.log(`✅ Connexion réussie avec ${host}`);
      await connection.end();
      return true;
    } catch (error) {
      console.log(`❌ Échec avec ${host}: ${error.message}`);
    }
  }
  
  return false;
}

// Utilitaires pour les requêtes
export const mysqlDB = {
  async query(sql: string, params?: unknown[]) {
    const connection = getConnection();
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error('MySQL Query Error:', error);
      throw error;
    }
  },

  async getUserByEmail(email: string) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await this.query(sql, [email]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  },

  async createUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const sql = `
      INSERT INTO users (email, password, firstName, lastName, isKooker, isVerified, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, false, false, NOW(), NOW())
    `;
    const result = await this.query(sql, [
      userData.email,
      userData.password,
      userData.firstName || null,
      userData.lastName || null,
    ]);
    return result;
  },

  async createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(191) NOT NULL,
        firstName VARCHAR(191),
        lastName VARCHAR(191),
        phone VARCHAR(191),
        address VARCHAR(191),
        city VARCHAR(191),
        isKooker BOOLEAN DEFAULT false,
        isVerified BOOLEAN DEFAULT false,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    const createKookerProfilesTable = `
      CREATE TABLE IF NOT EXISTS kooker_profiles (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        userId VARCHAR(36) UNIQUE NOT NULL,
        bio TEXT,
        experience TEXT,
        profileImage VARCHAR(191),
        coverImage VARCHAR(191),
        serviceArea INT DEFAULT 20,
        pricePerHour INT DEFAULT 35,
        minimumDuration INT DEFAULT 2,
        maxGuests INT DEFAULT 8,
        specialties JSON,
        certificates JSON,
        rating DECIMAL(3,2) DEFAULT 0,
        reviewCount INT DEFAULT 0,
        isActive BOOLEAN DEFAULT true,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    try {
      await this.query(createUsersTable);
      await this.query(createKookerProfilesTable);
      console.log('✅ Tables créées avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la création des tables:', error);
      return false;
    }
  },

  async close() {
    if (pool) {
      await pool.end();
    }
  }
};