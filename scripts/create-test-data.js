import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🌱 Création des données de test pour le système de disponibilités de repas...');

  try {
    // 1. Créer l'utilisateur avec l'email et mot de passe spécifiés
    const hashedPassword = await bcrypt.hash('Newlife2022*', 12);

    const user = await prisma.user.upsert({
      where: { email: 'guillaumeroca@free.fr' },
      update: {
        password: hashedPassword,
        firstName: 'Guillaume',
        lastName: 'Roca',
        phone: '0623456789',
        address: '123 Rue de la Méditerranée',
        postalCode: '13008',
        city: 'Marseille',
        isKooker: true,
        isVerified: true,
      },
      create: {
        email: 'guillaumeroca@free.fr',
        password: hashedPassword,
        firstName: 'Guillaume',
        lastName: 'Roca',
        phone: '0623456789',
        address: '123 Rue de la Méditerranée',
        postalCode: '13008',
        city: 'Marseille',
        isKooker: true,
        isVerified: true,
      },
    });

    console.log('✅ Utilisateur créé/mis à jour:', user.email);

    // 2. Créer le profil Kooker
    const kookerProfile = await prisma.kookerProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: "Chef passionné spécialisé dans la cuisine provençale et méditerranéenne. J'aime partager ma passion pour les produits locaux et les saveurs authentiques du Sud.",
        experience: "10 ans d'expérience en cuisine, formé dans les meilleures tables de Provence",
        profileImage: "https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg",
        coverImage: "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg",
        serviceArea: 25,
        pricePerHour: 55,
        minimumDuration: 2,
        maxGuests: 10,
        specialties: ['Cuisine provençale', 'Cuisine méditerranéenne', 'Poissons et fruits de mer', 'Cuisine du terroir'],
        certificates: [
          'CAP Cuisine',
          'Formation cuisine méditerranéenne',
          'Certification produits de la mer'
        ],
        rating: 4.8,
        reviewCount: 67,
        isActive: true,
      },
      create: {
        userId: user.id,
        bio: "Chef passionné spécialisé dans la cuisine provençale et méditerranéenne. J'aime partager ma passion pour les produits locaux et les saveurs authentiques du Sud.",
        experience: "10 ans d'expérience en cuisine, formé dans les meilleures tables de Provence",
        profileImage: "https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg",
        coverImage: "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg",
        serviceArea: 25,
        pricePerHour: 55,
        minimumDuration: 2,
        maxGuests: 10,
        specialties: ['Cuisine provençale', 'Cuisine méditerranéenne', 'Poissons et fruits de mer', 'Cuisine du terroir'],
        certificates: [
          'CAP Cuisine',
          'Formation cuisine méditerranéenne',
          'Certification produits de la mer'
        ],
        rating: 4.8,
        reviewCount: 67,
        isActive: true,
      },
    });

    console.log('✅ Profil Kooker créé/mis à jour pour:', user.email);

    // 3. Créer les disponibilités de repas pour la semaine du 19 au 25 septembre 2025
    const dates = [
      '2025-09-19', // Vendredi
      '2025-09-20', // Samedi
      '2025-09-21', // Dimanche
      '2025-09-22', // Lundi
      '2025-09-23', // Mardi
      '2025-09-24', // Mercredi
      '2025-09-25', // Jeudi
    ];

    const mealTypes = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
    const statuses = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'BLOCKED']; // Plus de disponible que de bloqué

    // Supprimer les anciennes disponibilités pour ces dates
    await prisma.mealAvailability.deleteMany({
      where: {
        kookerId: kookerProfile.id,
        date: {
          gte: new Date('2025-09-19'),
          lte: new Date('2025-09-25')
        }
      }
    });

    console.log('🗑️ Anciennes disponibilités supprimées pour les dates de test');

    // Créer les nouvelles disponibilités
    const mealAvailabilities = [];

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay(); // 0 = Dimanche, 6 = Samedi

      for (const mealType of mealTypes) {
        // Logique pour varier les disponibilités de façon réaliste
        let isAvailable = true;
        let status = 'AVAILABLE';
        let notes = null;

        // Dimanche : pas de petit déjeuner ou goûter en service
        if (dayOfWeek === 0 && (mealType === 'BREAKFAST' || mealType === 'SNACK')) {
          isAvailable = false;
          status = 'BLOCKED';
          notes = 'Service non proposé le dimanche';
        }

        // Lundi : matinée bloquée (petit déjeuner indisponible)
        if (dayOfWeek === 1 && mealType === 'BREAKFAST') {
          isAvailable = false;
          status = 'BLOCKED';
          notes = 'Matinée réservée pour les courses';
        }

        // Mercredi : dîner déjà réservé
        if (dayOfWeek === 3 && mealType === 'DINNER') {
          isAvailable = true;
          status = 'BOOKED';
          notes = 'Réservé par un client régulier';
        }

        // Vendredi : pas de goûter
        if (dayOfWeek === 5 && mealType === 'SNACK') {
          isAvailable = false;
          status = 'BLOCKED';
          notes = 'Préparation pour le service du soir';
        }

        const mealAvailability = {
          kookerId: kookerProfile.id,
          date: date,
          mealType: mealType,
          isAvailable: isAvailable,
          status: status,
          notes: notes,
        };

        mealAvailabilities.push(mealAvailability);
      }
    }

    // Insérer toutes les disponibilités
    for (const availability of mealAvailabilities) {
      await prisma.mealAvailability.create({
        data: availability
      });
    }

    console.log(`✅ ${mealAvailabilities.length} disponibilités de repas créées`);

    // Afficher un résumé des données créées
    console.log('\n📊 Résumé des données de test créées:');
    console.log('👤 Utilisateur: guillaumeroca@free.fr (mot de passe: Newlife2022*)');
    console.log('👨‍🍳 Profil Kooker: Guillaume Roca - Cuisine provençale');
    console.log('📅 Disponibilités créées du 19 au 25 septembre 2025:');

    const availableCount = mealAvailabilities.filter(m => m.status === 'AVAILABLE').length;
    const bookedCount = mealAvailabilities.filter(m => m.status === 'BOOKED').length;
    const blockedCount = mealAvailabilities.filter(m => m.status === 'BLOCKED').length;

    console.log(`   - ${availableCount} créneaux disponibles (vert dans le calendrier)`);
    console.log(`   - ${bookedCount} créneaux réservés (orange dans le calendrier)`);
    console.log(`   - ${blockedCount} créneaux bloqués (rouge dans le calendrier)`);

    console.log('\n🎯 Vous pouvez maintenant tester:');
    console.log('   - La sauvegarde des disponibilités dans les paramètres Kooker');
    console.log('   - L\'affichage du calendrier avec les dates en couleur');
    console.log('   - Le flux de réservation depuis le calendrier');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
    throw error;
  }
}

async function main() {
  try {
    await createTestData();
    console.log('\n🎉 Données de test créées avec succès !');
  } catch (error) {
    console.error('❌ Échec de la création des données de test:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();