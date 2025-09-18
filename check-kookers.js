import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkKookers() {
  try {
    console.log('📋 Liste des Kookers dans la base de données:');

    const kookers = await prisma.kookerProfile.findMany({
      include: {
        user: true,
        weeklyAvailabilities: true,
        dailyAvailabilities: true
      }
    });

    kookers.forEach((kooker, index) => {
      console.log(`\n${index + 1}. Kooker ID: ${kooker.id}`);
      console.log(`   User: ${kooker.user.firstName} ${kooker.user.lastName}`);
      console.log(`   Email: ${kooker.user.email}`);
      console.log(`   Disponibilités hebdomadaires: ${kooker.weeklyAvailabilities.length}`);
      console.log(`   Disponibilités quotidiennes: ${kooker.dailyAvailabilities.length}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkKookers();