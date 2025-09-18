import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Créer des utilisateurs de test
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Utilisateur client simple
  const user1 = await prisma.user.upsert({
    where: { email: 'client@weekook.fr' },
    update: {},
    create: {
      email: 'client@weekook.fr',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '0123456789',
      address: '123 Rue de la Paix',
      city: 'Lyon',
      isKooker: false,
      isVerified: true,
    },
  });

  // Utilisateur kooker
  const user2 = await prisma.user.upsert({
    where: { email: 'marie@weekook.fr' },
    update: {},
    create: {
      email: 'marie@weekook.fr',
      password: hashedPassword,
      firstName: 'Marie',
      lastName: 'Dubois',
      phone: '0987654321',
      address: '456 Avenue des Chefs',
      city: 'Lyon',
      isKooker: true,
      isVerified: true,
    },
  });

  // Profil kooker pour Marie
  const kookerProfile = await prisma.kookerProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      bio: "Passionnée de cuisine depuis mon plus jeune âge, j'ai suivi une formation à l'école Ferrandi avant de travailler dans plusieurs restaurants étoilés.",
      experience: "15 ans d'expérience en cuisine, dont 5 ans dans des restaurants étoilés",
      profileImage: "https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg",
      coverImage: "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg",
      serviceArea: 20,
      pricePerHour: 45,
      minimumDuration: 2,
      maxGuests: 8,
      specialties: ['Cuisine française', 'Pâtisserie', 'Cuisine méditerranéenne'],
      certificates: [
        'Diplôme de l\'École Ferrandi',
        'CAP Cuisine',
        'Formation en pâtisserie fine'
      ],
      rating: 4.9,
      reviewCount: 124,
      isActive: true,
    },
  });

  // Fiches spécialités
  await prisma.specialtyCard.upsert({
    where: { id: 'specialty-1' },
    update: {},
    create: {
      id: 'specialty-1',
      kookerId: kookerProfile.id,
      name: 'Atelier Macarons',
      serviceArea: 'Lyon et périphérie',
      pricePerPerson: 65,
      additionalInfo: 'Apprenez à réaliser des macarons comme un professionnel. Vous repartirez avec vos créations et toutes les techniques pour les reproduire chez vous.',
      requiredEquipment: 'Four, robot pâtissier, plaque de cuisson',
      photos: [
        'https://images.pexels.com/photos/3776529/pexels-photo-3776529.jpeg',
        'https://images.pexels.com/photos/4109996/pexels-photo-4109996.jpeg'
      ],
      isActive: true,
    },
  });

  await prisma.specialtyCard.upsert({
    where: { id: 'specialty-2' },
    update: {},
    create: {
      id: 'specialty-2',
      kookerId: kookerProfile.id,
      name: 'Dîner Gastronomique',
      serviceArea: 'Lyon',
      pricePerPerson: 85,
      additionalInfo: 'Un menu gastronomique 3 services élaboré selon vos préférences. Une expérience unique dans le confort de votre maison.',
      requiredEquipment: 'Cuisine équipée, four, plaques de cuisson',
      photos: [
        'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg',
        'https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg'
      ],
      isActive: true,
    },
  });

  console.log('✅ Seeding terminé avec succès !');
  console.log('👤 Utilisateurs créés :');
  console.log('   - Client: client@weekook.fr (password: password123)');
  console.log('   - Kooker: marie@weekook.fr (password: password123)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });