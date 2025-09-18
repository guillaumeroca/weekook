// Script pour tester la connexion à la base de données
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('🔄 Test de connexion à la base de données...');
    
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion réussie !');
    
    // Test de requête simple
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs: ${userCount}`);
    
    // Test de création de table (si nécessaire)
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Requête SQL exécutée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Solutions possibles:');
      console.log('1. Vérifiez l\'URL de connexion dans le fichier .env');
      console.log('2. Assurez-vous que la base de données est accessible');
      console.log('3. Vérifiez les paramètres de pare-feu/sécurité');
      console.log('4. Contactez le support Infomaniak pour l\'accès externe');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();