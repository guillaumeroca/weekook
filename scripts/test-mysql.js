import mysql from 'mysql2/promise';

// Configuration avec les vraies valeurs - test avec SSL et différents ports
const configs = [
  {
    host: '6501ew.myd.infomaniak.com',
    user: '6501ew_WeekookVA',
    password: 'Weekookmania1-1',
    database: '6501ew_WeeKooK_VAL',
    port: 3306,
    ssl: false,
    connectTimeout: 15000,
  },
  {
    host: '6501ew.myd.infomaniak.com',
    user: '6501ew_WeekookVA',
    password: 'Weekookmania1-1',
    database: '6501ew_WeeKooK_VAL',
    port: 3306,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 15000,
  },
  {
    host: 'mysql.infomaniak.com',
    user: '6501ew_WeekookVA',
    password: 'Weekookmania1-1',
    database: '6501ew_WeeKooK_VAL',
    port: 3306,
    ssl: false,
    connectTimeout: 15000,
  },
  {
    host: 'mysql.infomaniak.com',
    user: '6501ew_WeekookVA',
    password: 'Weekookmania1-1',
    database: '6501ew_WeeKooK_VAL',
    port: 3306,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 15000,
  },
  {
    host: 'mysql.infomaniak.com',
    user: '6501ew_WeekookVA',
    password: 'Weekookmania1-1',
    database: '6501ew_WeeKooK_VAL',
    port: 3307,
    ssl: false,
    connectTimeout: 15000,
  },
  {
    host: 'db.infomaniak.com',
    user: '6501ew_WeekookVA',
    password: 'Weekookmania1-1',
    database: '6501ew_WeeKooK_VAL',
    port: 3306,
    ssl: false,
    connectTimeout: 15000,
  },
];

async function testAllConfigs() {
  console.log('🔄 Test de connexion MySQL2 avec toutes les configurations...\n');
  
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const sslStatus = config.ssl ? 'SSL' : 'No SSL';
    console.log(`📡 Test ${i + 1}/${configs.length} - ${config.host}:${config.port} (${sslStatus})`);
    
    try {
      const connection = await mysql.createConnection(config);
      console.log('✅ Connexion réussie !');
      
      // Test de requête
      const [rows] = await connection.execute('SELECT 1 as test, NOW() as time');
      console.log('📊 Résultat test:', rows[0]);
      
      // Lister les tables
      try {
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tables trouvées: ${tables.length}`);
        if (tables.length > 0) {
          tables.forEach(table => console.log(`  - ${Object.values(table)[0]}`));
        }
      } catch (tableError) {
        console.log('⚠️  Erreur lors de la liste des tables:', tableError.message);
      }
      
      await connection.end();
      console.log('🎉 Configuration fonctionnelle trouvée !\n');
      
      // Sauvegarder la config qui marche
      console.log('💾 URL de connexion à utiliser :');
      console.log(`DATABASE_URL="mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}"`);
      
      return config;
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      if (error.code) {
        console.error('   Code:', error.code);
      }
      console.log('');
    }
  }
  
  console.log('❌ Aucune configuration fonctionnelle trouvée');
  console.log('\n💡 Solutions possibles:');
  console.log('1. Vérifier que l\'accès externe est autorisé sur votre base Infomaniak');
  console.log('2. Ajouter votre IP publique à la liste blanche');
  console.log('3. Vérifier les paramètres SSL requis');
  console.log('4. Contacter le support Infomaniak');
  
  return null;
}

testAllConfigs().catch(console.error);