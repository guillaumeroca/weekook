import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('DATABASE_URL actuelle:', process.env.DATABASE_URL);

    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true
      }
    });

    console.log('Utilisateurs trouvés:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName})`);
    });

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();