const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const kookersData = [
  {
    email: 'marie.dubois@weekook.com',
    password: 'Weekook2024!',
    firstName: 'Marie',
    lastName: 'Dubois',
    phone: '0123456789',
    address: '15 rue de la Paix',
    postalCode: '75001',
    city: 'Paris',
    kookerProfile: {
      bio: 'Passionnée de cuisine française traditionnelle avec 15 ans d\'expérience',
      experience: 'Chef dans plusieurs restaurants parisiens, formatrice en cuisine traditionnelle',
      profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
      coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
      serviceArea: 25,
      pricePerHour: 45,
      minimumDuration: 2,
      maxGuests: 8,
      specialties: ['Cuisine française', 'Pâtisserie', 'Cuisine de saison'],
      certificates: ['CAP Cuisine', 'BTS Hôtellerie-Restauration'],
      rating: 4.8,
      reviewCount: 24,
      specialtyCards: [
        {
          name: 'Menu traditionnel français',
          serviceArea: 'Paris et banlieue',
          pricePerPerson: 35,
          additionalInfo: 'Cours de cuisine française traditionnelle avec dégustation',
          requiredEquipment: 'Ustensiles de cuisine de base',
          photos: []
        },
        {
          name: 'Atelier pâtisserie',
          serviceArea: 'Paris et banlieue',
          pricePerPerson: 28,
          additionalInfo: 'Apprenez à réaliser des pâtisseries françaises classiques',
          requiredEquipment: 'Fouet, moules, balance',
          photos: []
        }
      ]
    }
  },
  {
    email: 'giuseppe.rossi@weekook.com',
    password: 'Weekook2024!',
    firstName: 'Giuseppe',
    lastName: 'Rossi',
    phone: '0123456790',
    address: '22 cours Gambetta',
    postalCode: '69003',
    city: 'Lyon',
    kookerProfile: {
      bio: 'Chef italien spécialisé dans les pâtes fraîches et la cuisine méditerranéenne',
      experience: 'Originaire de Naples, chef depuis 20 ans, spécialiste des pâtes fraîches',
      profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
      coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
      serviceArea: 30,
      pricePerHour: 50,
      minimumDuration: 3,
      maxGuests: 6,
      specialties: ['Cuisine italienne', 'Pâtes fraîches', 'Méditerranéenne'],
      certificates: ['Diplôme de cuisine italienne', 'Certificat pâtes fraîches'],
      rating: 4.9,
      reviewCount: 31,
      specialtyCards: [
        {
          name: 'Cours de pâtes fraîches',
          serviceArea: 'Lyon et périphérie',
          pricePerPerson: 40,
          additionalInfo: 'Apprenez à faire des pâtes fraîches comme en Italie',
          requiredEquipment: 'Plan de travail, machine à pâtes optionnelle',
          photos: []
        },
        {
          name: 'Menu italien complet',
          serviceArea: 'Lyon et périphérie',
          pricePerPerson: 45,
          additionalInfo: 'De l\'antipasti au dessert, un repas italien authentique',
          requiredEquipment: 'Ustensiles de cuisine italienne',
          photos: []
        }
      ]
    }
  },
  {
    email: 'yuki.tanaka@weekook.com',
    password: 'Weekook2024!',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    phone: '0123456791',
    address: '45 avenue du Prado',
    postalCode: '13008',
    city: 'Marseille',
    kookerProfile: {
      bio: 'Spécialiste de la cuisine japonaise authentique et fusion',
      experience: 'Formée au Japon, 12 ans d\'expérience en cuisine japonaise et fusion',
      profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
      coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
      serviceArea: 20,
      pricePerHour: 55,
      minimumDuration: 2,
      maxGuests: 4,
      specialties: ['Cuisine japonaise', 'Sushi', 'Fusion'],
      certificates: ['Certification sushi', 'Diplôme cuisine japonaise'],
      rating: 4.7,
      reviewCount: 18,
      specialtyCards: [
        {
          name: 'Atelier sushi',
          serviceArea: 'Marseille et environs',
          pricePerPerson: 50,
          additionalInfo: 'Initiation à l\'art du sushi avec poissons frais',
          requiredEquipment: 'Couteau japonais, natte en bambou',
          photos: []
        },
        {
          name: 'Menu japonais traditionnel',
          serviceArea: 'Marseille et environs',
          pricePerPerson: 42,
          additionalInfo: 'Découverte de la cuisine japonaise traditionnelle',
          requiredEquipment: 'Baguettes, bols japonais',
          photos: []
        }
      ]
    }
  },
  {
    email: 'ahmed.benali@weekook.com',
    password: 'Weekook2024!',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    phone: '0123456792',
    address: '12 promenade des Anglais',
    postalCode: '06000',
    city: 'Nice',
    kookerProfile: {
      bio: 'Expert en cuisine du Maghreb et épices orientales',
      experience: 'Héritage familial culinaire, 15 ans de pratique professionnelle',
      profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
      coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
      serviceArea: 25,
      pricePerHour: 40,
      minimumDuration: 3,
      maxGuests: 10,
      specialties: ['Cuisine marocaine', 'Orientale', 'Épices'],
      certificates: ['Certificat cuisine marocaine', 'Formation épices orientales'],
      rating: 4.6,
      reviewCount: 22,
      specialtyCards: [
        {
          name: 'Tajine et couscous',
          serviceArea: 'Nice et Côte d\'Azur',
          pricePerPerson: 32,
          additionalInfo: 'Apprenez les secrets du tajine et du couscous authentiques',
          requiredEquipment: 'Tajine, couscoussier',
          photos: []
        },
        {
          name: 'Pâtisseries orientales',
          serviceArea: 'Nice et Côte d\'Azur',
          pricePerPerson: 25,
          additionalInfo: 'Découverte des pâtisseries du Maghreb',
          requiredEquipment: 'Moules à pâtisserie, sirop',
          photos: []
        }
      ]
    }
  },
  {
    email: 'sophie.martin@weekook.com',
    password: 'Weekook2024!',
    firstName: 'Sophie',
    lastName: 'Martin',
    phone: '0123456793',
    address: '8 cours de l\'Intendance',
    postalCode: '33000',
    city: 'Bordeaux',
    kookerProfile: {
      bio: 'Cheffe végétarienne passionnée par la cuisine healthy et créative',
      experience: 'Spécialisée en cuisine végétarienne et bio depuis 10 ans',
      profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
      coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
      serviceArea: 30,
      pricePerHour: 42,
      minimumDuration: 2,
      maxGuests: 8,
      specialties: ['Cuisine végétarienne', 'Healthy', 'Bio'],
      certificates: ['Certificat cuisine végétarienne', 'Formation alimentation bio'],
      rating: 4.9,
      reviewCount: 35,
      specialtyCards: [
        {
          name: 'Menu végétarien créatif',
          serviceArea: 'Bordeaux et Gironde',
          pricePerPerson: 38,
          additionalInfo: 'Cuisine végétarienne inventive et savoureuse',
          requiredEquipment: 'Extracteur de jus, spiralizer',
          photos: []
        },
        {
          name: 'Cuisine healthy et colorée',
          serviceArea: 'Bordeaux et Gironde',
          pricePerPerson: 35,
          additionalInfo: 'Apprenez à cuisiner healthy sans compromis sur le goût',
          requiredEquipment: 'Blender, balance nutritionnelle',
          photos: []
        }
      ]
    }
  },
  {
    email: 'carlos.rodriguez@weekook.com',
    password: 'Weekook2024!',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    phone: '0123456794',
    address: '20 place du Capitole',
    postalCode: '31000',
    city: 'Toulouse',
    kookerProfile: {
      bio: 'Passionné de cuisine espagnole et tapas authentiques',
      experience: 'Originaire de Séville, 18 ans d\'expérience en cuisine espagnole',
      profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
      coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
      serviceArea: 25,
      pricePerHour: 38,
      minimumDuration: 2,
      maxGuests: 12,
      specialties: ['Cuisine espagnole', 'Tapas', 'Paella'],
      certificates: ['Diplôme cuisine espagnole', 'Certificat paella valencienne'],
      rating: 4.5,
      reviewCount: 19,
      specialtyCards: [
        {
          name: 'Soirée tapas',
          serviceArea: 'Toulouse et région',
          pricePerPerson: 30,
          additionalInfo: 'Découverte des tapas authentiques d\'Espagne',
          requiredEquipment: 'Petites assiettes, plancha',
          photos: []
        },
        {
          name: 'Paella traditionnelle',
          serviceArea: 'Toulouse et région',
          pricePerPerson: 35,
          additionalInfo: 'Apprenez la vraie paella valencienne',
          requiredEquipment: 'Paellera, safran',
          photos: []
        }
      ]
    }
  }
];

async function main() {
  console.log('🚀 Démarrage de l\'insertion des Kookers...');

  try {
    for (const kookerData of kookersData) {
      console.log(`📝 Création de ${kookerData.firstName} ${kookerData.lastName}...`);

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: kookerData.email }
      });

      if (existingUser) {
        console.log(`⚠️  L'utilisateur ${kookerData.email} existe déjà, ignoré.`);
        continue;
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(kookerData.password, 10);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email: kookerData.email,
          password: hashedPassword,
          firstName: kookerData.firstName,
          lastName: kookerData.lastName,
          phone: kookerData.phone,
          address: kookerData.address,
          postalCode: kookerData.postalCode,
          city: kookerData.city,
          isKooker: true,
          isVerified: true
        }
      });

      console.log(`✅ Utilisateur créé avec ID: ${user.id}`);

      // Créer le profil Kooker
      const kookerProfile = await prisma.kookerProfile.create({
        data: {
          userId: user.id,
          bio: kookerData.kookerProfile.bio,
          experience: kookerData.kookerProfile.experience,
          profileImage: kookerData.kookerProfile.profileImage,
          coverImage: kookerData.kookerProfile.coverImage,
          serviceArea: kookerData.kookerProfile.serviceArea,
          pricePerHour: kookerData.kookerProfile.pricePerHour,
          minimumDuration: kookerData.kookerProfile.minimumDuration,
          maxGuests: kookerData.kookerProfile.maxGuests,
          specialties: kookerData.kookerProfile.specialties,
          certificates: kookerData.kookerProfile.certificates,
          rating: kookerData.kookerProfile.rating,
          reviewCount: kookerData.kookerProfile.reviewCount,
          isActive: true
        }
      });

      console.log(`✅ Profil Kooker créé avec ID: ${kookerProfile.id}`);

      // Créer les specialty cards
      for (const cardData of kookerData.kookerProfile.specialtyCards) {
        const specialtyCard = await prisma.specialtyCard.create({
          data: {
            kookerId: kookerProfile.id,
            name: cardData.name,
            serviceArea: cardData.serviceArea,
            pricePerPerson: cardData.pricePerPerson,
            additionalInfo: cardData.additionalInfo,
            requiredEquipment: cardData.requiredEquipment,
            photos: cardData.photos,
            isActive: true
          }
        });

        console.log(`✅ Specialty card créée: ${specialtyCard.name}`);
      }

      console.log(`🎉 ${kookerData.firstName} ${kookerData.lastName} créé avec succès!\n`);
    }

    console.log('🎯 Insertion terminée avec succès!');
    
    // Afficher un résumé
    const totalUsers = await prisma.user.count({ where: { isKooker: true } });
    const totalKookers = await prisma.kookerProfile.count();
    const totalCards = await prisma.specialtyCard.count();
    
    console.log(`📊 Résumé:`);
    console.log(`   - Total utilisateurs Kooker: ${totalUsers}`);
    console.log(`   - Total profils Kooker: ${totalKookers}`);
    console.log(`   - Total specialty cards: ${totalCards}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();