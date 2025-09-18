import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('DATABASE_URL actuelle:', process.env.DATABASE_URL);

    // Vérifier si les nouvelles tables existent en essayant de les requêter
    console.log('\n🔍 Vérification des tables de disponibilités...');

    try {
      const weeklyCount = await prisma.weeklyAvailability.count();
      console.log('✅ Table weekly_availabilities existe - Nombre d\'enregistrements:', weeklyCount);
    } catch (error) {
      console.log('❌ Table weekly_availabilities n\'existe pas:', error.message);
    }

    try {
      const dailyCount = await prisma.dailyAvailability.count();
      console.log('✅ Table daily_availabilities existe - Nombre d\'enregistrements:', dailyCount);
    } catch (error) {
      console.log('❌ Table daily_availabilities n\'existe pas:', error.message);
    }

    // Vérifier les autres tables existantes
    console.log('\n📊 Tables existantes:');
    const userCount = await prisma.user.count();
    console.log(`- users: ${userCount} enregistrements`);

    const kookerCount = await prisma.kookerProfile.count();
    console.log(`- kooker_profiles: ${kookerCount} enregistrements`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();