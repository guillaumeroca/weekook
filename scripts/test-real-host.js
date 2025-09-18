import mysql from 'mysql2/promise';

// Configuration avec l'hôte réel trouvé via DNS
const config = {
  host: 'h2mysql110.infomaniak.ch',
  user: '6501ew_WeekookVA',
  password: 'Weekookmania1-1',
  database: '6501ew_WeeKooK_VAL',
  port: 3306,
  ssl: false,
  connectTimeout: 15000,
};

async function testRealHost() {
  console.log('🔄 Test de connexion avec l\'hôte réel: h2mysql110.infomaniak.ch\n');
  
  try {
    console.log('📡 Tentative de connexion...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connexion réussie !');
    
    // Test de requête simple
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as time');
    console.log('📊 Résultat test:', rows[0]);
    
    // Test d'accès à la base
    try {
      const [dbRows] = await connection.execute('SELECT DATABASE() as current_db');
      console.log('🗄️  Base de données actuelle:', dbRows[0].current_db);
    } catch (dbError) {
      console.log('⚠️  Erreur accès base:', dbError.message);
    }
    
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
    console.log('\n🎉 Test réussi ! Vous pouvez maintenant utiliser cette configuration.');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Problème d\'authentification:');
      console.log('- Vérifiez le nom d\'utilisateur et mot de passe');
      console.log('- Assurez-vous que l\'utilisateur existe');
      console.log('- Vérifiez les permissions d\'accès');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Base de données non trouvée:');
      console.log('- Vérifiez que la base "6501ew_WeeKooK_VAL" existe');
      console.log('- Vérifiez les permissions sur cette base');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connexion refusée:');
      console.log('- Le serveur MySQL n\'accepte pas les connexions externes');
      console.log('- Vérifiez la configuration d\'accès distant dans Infomaniak');
    }
    
    return false;
  }
}

testRealHost().catch(console.error);