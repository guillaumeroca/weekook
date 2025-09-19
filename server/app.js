const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../node_modules/@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour les images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes d'authentification
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        kookerProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Retourner les données utilisateur
    res.json({
      success: true,
      user: {
        id: user.User_Id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isKooker: user.isKooker,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion'
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address, postalCode, city } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        postalCode,
        city,
        isVerified: false,
        isKooker: false,
      },
    });

    res.json({
      success: true,
      user: {
        id: user.User_Id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isKooker: user.isKooker,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte'
    });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    // En production, vous devriez vérifier le token et récupérer l'ID utilisateur
    // Pour le moment, on simule la vérification
    
    res.json({
      success: true,
      message: 'Email vérifié avec succès'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return res.json({
        success: true,
        message: 'Si cet email existe, vous recevrez un lien de réinitialisation'
      });
    }

    // Ici, vous devriez envoyer un email avec un token de réinitialisation
    // Pour le moment, on simule

    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation'
    });
  }
});

app.put('/api/auth/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, address, postalCode, city } = req.body;

    const updatedUser = await prisma.user.update({
      where: { User_Id: userId },
      data: {
        firstName,
        lastName,
        phone,
        address,
        postalCode,
        city,
      },
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isKooker: updatedUser.isKooker,
        isVerified: updatedUser.isVerified,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

app.post('/api/auth/become-kooker/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Marquer l'utilisateur comme Kooker
    const updatedUser = await prisma.user.update({
      where: { User_Id: userId },
      data: { isKooker: true },
    });

    // Créer un profil Kooker avec des valeurs par défaut
    await prisma.kookerProfile.create({
      data: {
        User_Id: userId,
        bio: '',
        experience: '',
        serviceArea: 20,
        pricePerHour: 35,
        minimumDuration: 2,
        maxGuests: 8,
        specialties: [],
        certificates: [],
      },
    });

    res.json({
      success: true,
      message: 'Vous êtes maintenant un Kooker !'
    });
  } catch (error) {
    console.error('Become kooker error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du profil Kooker'
    });
  }
});

app.put('/api/kooker/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      // Champs User
      firstName, lastName, phone, address, city,
      // Champs KookerProfile
      bio, experience, profileImage, coverImage, serviceArea, pricePerHour, minimumDuration, maxGuests, specialties, certificates
    } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { User_Id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Mettre à jour les champs User si fournis
    const userUpdateData = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (address !== undefined) userUpdateData.address = address;
    if (city !== undefined) userUpdateData.city = city;

    // Mettre à jour User si des champs sont fournis
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { User_Id: userId },
        data: userUpdateData
      });
    }

    await prisma.kookerProfile.upsert({
      where: { User_Id: userId },
      update: {
        bio,
        experience,
        profileImage,
        coverImage,
        serviceArea,
        pricePerHour,
        minimumDuration,
        maxGuests,
        specialties: specialties || [],
        certificates: certificates || [],
      },
      create: {
        User_Id: userId,
        bio,
        experience,
        profileImage,
        coverImage,
        serviceArea,
        pricePerHour,
        minimumDuration,
        maxGuests,
        specialties: specialties || [],
        certificates: certificates || [],
      },
    });

    res.json({
      success: true,
      message: 'Profil Kooker mis à jour avec succès'
    });
  } catch (error) {
    console.error('Update kooker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil Kooker'
    });
  }
});

app.get('/api/kooker/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId },
      include: {
        user: {
          select: {
            User_Id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
            postalCode: true,
            city: true,
            isKooker: true,
            isVerified: true,
          }
        },
        specialtyCards: true
      }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé'
      });
    }

    res.json({
      success: true,
      profile: {
        id: kookerProfile.id,
        userId: kookerProfile.User_Id,
        bio: kookerProfile.bio,
        experience: kookerProfile.experience,
        profileImage: kookerProfile.profileImage,
        coverImage: kookerProfile.coverImage,
        serviceArea: kookerProfile.serviceArea,
        pricePerHour: kookerProfile.pricePerHour,
        minimumDuration: kookerProfile.minimumDuration,
        maxGuests: kookerProfile.maxGuests,
        specialties: kookerProfile.specialties,
        certificates: kookerProfile.certificates,
        rating: kookerProfile.rating,
        reviewCount: kookerProfile.reviewCount,
        isActive: kookerProfile.isActive,
        user: kookerProfile.user,
        specialtyCards: kookerProfile.specialtyCards
      }
    });
  } catch (error) {
    console.error('Get kooker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil Kooker'
    });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { User_Id: userId },
      include: {
        kookerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.User_Id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        postalCode: user.postalCode,
        city: user.city,
        isKooker: user.isKooker,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
});

// Routes pour les Specialty Cards
app.post('/api/kooker/specialty-card/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, serviceArea, pricePerPerson, additionalInfo, requiredEquipment, photos } = req.body;

    // Récupérer le profil Kooker
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé'
      });
    }

    // Créer la specialty card
    const specialtyCard = await prisma.specialtyCard.create({
      data: {
        Kooker_Id: kookerProfile.id,
        name,
        serviceArea,
        pricePerPerson,
        additionalInfo,
        requiredEquipment,
        photos: photos || []
      }
    });

    res.json({
      success: true,
      specialtyCard,
      message: 'Fiche spécialité créée avec succès'
    });
  } catch (error) {
    console.error('Create specialty card error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la fiche spécialité'
    });
  }
});

app.put('/api/kooker/specialty-card/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const { name, serviceArea, pricePerPerson, additionalInfo, requiredEquipment, photos } = req.body;

    // Vérifier que la fiche existe
    const existingCard = await prisma.specialtyCard.findUnique({
      where: { id: cardId }
    });

    if (!existingCard) {
      return res.status(404).json({
        success: false,
        message: 'Fiche spécialité non trouvée'
      });
    }

    const updatedCard = await prisma.specialtyCard.update({
      where: { id: cardId },
      data: {
        name,
        serviceArea,
        pricePerPerson,
        additionalInfo,
        requiredEquipment,
        photos: photos || []
      }
    });

    res.json({
      success: true,
      specialtyCard: updatedCard,
      message: 'Fiche spécialité mise à jour avec succès'
    });
  } catch (error) {
    console.error('Update specialty card error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la fiche spécialité'
    });
  }
});

app.delete('/api/kooker/specialty-card/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;

    await prisma.specialtyCard.delete({
      where: { id: cardId }
    });

    res.json({
      success: true,
      message: 'Fiche spécialité supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete specialty card error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la fiche spécialité'
    });
  }
});

// Routes pour les Kookers
app.get('/api/kookers/search', async (req, res) => {
  try {
    const { query, location, specialties, priceMin, priceMax, rating } = req.query;
    
    // Construire les conditions de recherche
    const whereConditions = {
      isActive: true,
      AND: []
    };

    // Filtre par localisation
    if (location) {
      whereConditions.AND.push({
        user: {
          city: {
            contains: location
          }
        }
      });
    }

    // Filtre par spécialités
    if (specialties) {
      const specialtyArray = specialties.split(',').map(s => s.trim());
      whereConditions.AND.push({
        specialties: {
          hasSome: specialtyArray
        }
      });
    }

    // Filtre par prix
    if (priceMin || priceMax) {
      const priceFilter = {};
      if (priceMin) priceFilter.gte = parseInt(priceMin);
      if (priceMax) priceFilter.lte = parseInt(priceMax);
      whereConditions.AND.push({
        pricePerHour: priceFilter
      });
    }

    // Filtre par note
    if (rating) {
      whereConditions.AND.push({
        rating: {
          gte: parseFloat(rating)
        }
      });
    }

    // Recherche textuelle
    if (query) {
      whereConditions.AND.push({
        OR: [
          {
            user: {
              firstName: {
                contains: query
              }
            }
          },
          {
            user: {
              lastName: {
                contains: query
              }
            }
          },
          {
            bio: {
              contains: query
            }
          },
          {
            experience: {
              contains: query
            }
          }
        ]
      });
    }

    const kookers = await prisma.kookerProfile.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            User_Id: true,
            firstName: true,
            lastName: true,
            city: true,
          }
        },
        specialtyCards: {
          select: {
            id: true,
            name: true,
            pricePerPerson: true,
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    res.json({
      success: true,
      kookers: kookers.map(kooker => ({
        id: kooker.id,
        user: kooker.user,
        bio: kooker.bio,
        profileImage: kooker.profileImage,
        coverImage: kooker.coverImage,
        specialties: kooker.specialties,
        rating: kooker.rating,
        reviewCount: kooker.reviewCount,
        pricePerHour: kooker.pricePerHour,
        specialtyCards: kooker.specialtyCards,
      }))
    });
  } catch (error) {
    console.error('Search kookers error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche des Kookers'
    });
  }
});

app.get('/api/kookers', async (req, res) => {
  try {
    const kookers = await prisma.kookerProfile.findMany({
      where: { isActive: true },
      include: {
        user: true,
        specialtyCards: true,
      },
    });

    res.json({
      success: true,
      kookers: kookers.map(kooker => ({
        id: kooker.id,
        userId: kooker.User_Id,
        user: {
          firstName: kooker.user.firstName,
          lastName: kooker.user.lastName,
          city: kooker.user.city,
        },
        bio: kooker.bio,
        experience: kooker.experience,
        profileImage: kooker.profileImage,
        coverImage: kooker.coverImage,
        serviceArea: kooker.serviceArea,
        pricePerHour: kooker.pricePerHour,
        minimumDuration: kooker.minimumDuration,
        maxGuests: kooker.maxGuests,
        specialties: kooker.specialties,
        certificates: kooker.certificates,
        rating: kooker.rating,
        reviewCount: kooker.reviewCount,
        specialtyCards: kooker.specialtyCards,
      }))
    });
  } catch (error) {
    console.error('Get kookers error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des Kookers'
    });
  }
});

app.get('/api/kookers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const kooker = await prisma.kookerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        specialtyCards: true,
        reviews: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!kooker) {
      return res.status(404).json({
        success: false,
        message: 'Kooker non trouvé'
      });
    }

    res.json({
      success: true,
      kooker: {
        id: kooker.id,
        userId: kooker.User_Id,
        user: {
          firstName: kooker.user.firstName,
          lastName: kooker.user.lastName,
          city: kooker.user.city,
        },
        bio: kooker.bio,
        experience: kooker.experience,
        profileImage: kooker.profileImage,
        coverImage: kooker.coverImage,
        serviceArea: kooker.serviceArea,
        pricePerHour: kooker.pricePerHour,
        minimumDuration: kooker.minimumDuration,
        maxGuests: kooker.maxGuests,
        specialties: kooker.specialties,
        certificates: kooker.certificates,
        rating: kooker.rating,
        reviewCount: kooker.reviewCount,
        specialtyCards: kooker.specialtyCards,
        reviews: kooker.reviews,
      }
    });
  } catch (error) {
    console.error('Get kooker error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du Kooker'
    });
  }
});

// Routes pour les disponibilités
app.get('/api/kooker/availabilities/:kookerId', async (req, res) => {
  try {
    const { kookerId } = req.params;

    // Récupérer le profil Kooker
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { id: kookerId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé'
      });
    }

    // Récupérer les disponibilités hebdomadaires
    const weeklyAvailabilities = await prisma.weeklyAvailability.findMany({
      where: { Kooker_Id: kookerProfile.id },
      orderBy: { dayOfWeek: 'asc' }
    });

    // Récupérer les disponibilités spécifiques (pour le mois en cours + 2 mois suivants)
    const startDate = new Date();
    startDate.setDate(1); // Premier jour du mois actuel
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3); // 3 mois à partir du mois actuel

    const dailyAvailabilities = await prisma.dailyAvailability.findMany({
      where: {
        Kooker_Id: kookerProfile.id,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({
      success: true,
      availabilities: {
        weekly: weeklyAvailabilities,
        daily: dailyAvailabilities
      }
    });
  } catch (error) {
    console.error('Get availabilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des disponibilités'
    });
  }
});

app.post('/api/kooker/availabilities/weekly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { availabilities } = req.body; // Array of { dayOfWeek, startTime, endTime, isActive }

    // Récupérer le profil Kooker
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé'
      });
    }

    // Supprimer les anciennes disponibilités hebdomadaires
    await prisma.weeklyAvailability.deleteMany({
      where: { Kooker_Id: kookerProfile.id }
    });

    // Créer les nouvelles disponibilités
    if (availabilities && availabilities.length > 0) {
      await prisma.weeklyAvailability.createMany({
        data: availabilities.map(availability => ({
          Kooker_Id: kookerProfile.id,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
          endTime: availability.endTime,
          isActive: availability.isActive !== false
        }))
      });
    }

    res.json({
      success: true,
      message: 'Disponibilités hebdomadaires mises à jour'
    });
  } catch (error) {
    console.error('Update weekly availabilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des disponibilités'
    });
  }
});

app.post('/api/kooker/availabilities/daily/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, startTime, endTime, isAvailable, status, notes } = req.body;

    // Récupérer le profil Kooker
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé'
      });
    }

    // Créer ou mettre à jour la disponibilité pour cette date
    const dailyAvailability = await prisma.dailyAvailability.upsert({
      where: {
        Kooker_Id_date: {
          Kooker_Id: kookerProfile.id,
          date: new Date(date)
        }
      },
      update: {
        startTime,
        endTime,
        isAvailable: isAvailable !== false,
        status: status || 'AVAILABLE',
        notes
      },
      create: {
        Kooker_Id: kookerProfile.id,
        date: new Date(date),
        startTime,
        endTime,
        isAvailable: isAvailable !== false,
        status: status || 'AVAILABLE',
        notes
      }
    });

    res.json({
      success: true,
      availability: dailyAvailability,
      message: 'Disponibilité mise à jour'
    });
  } catch (error) {
    console.error('Update daily availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la disponibilité'
    });
  }
});

app.delete('/api/kooker/availabilities/daily/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    // Récupérer le profil Kooker
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé'
      });
    }

    // Supprimer la disponibilité pour cette date
    await prisma.dailyAvailability.delete({
      where: {
        Kooker_Id_date: {
          Kooker_Id: kookerProfile.id,
          date: new Date(date)
        }
      }
    });

    res.json({
      success: true,
      message: 'Disponibilité supprimée'
    });
  } catch (error) {
    console.error('Delete daily availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la disponibilité'
    });
  }
});

// Routes pour les réservations
app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, kookerId, specialtyCardId, date, time, mealType, guestCount, notes } = req.body;

    // Validation des données requises
    if (!userId || !kookerId || !specialtyCardId || !date || !time || !mealType || !guestCount) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes. userId, kookerId, specialtyCardId, date, time, mealType et guestCount sont requis.'
      });
    }

    // Validation du type de repas
    const validMealTypes = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'Type de repas invalide. Doit être BREAKFAST, LUNCH, SNACK ou DINNER.'
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { User_Id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier que le Kooker existe
    const kooker = await prisma.kookerProfile.findUnique({
      where: { id: kookerId }
    });

    if (!kooker) {
      return res.status(404).json({
        success: false,
        message: 'Kooker non trouvé'
      });
    }

    // Vérifier que la spécialité existe
    const specialtyCard = await prisma.specialtyCard.findUnique({
      where: { id: specialtyCardId }
    });

    if (!specialtyCard) {
      return res.status(404).json({
        success: false,
        message: 'Spécialité non trouvée'
      });
    }

    // Vérifier la disponibilité du repas pour cette date
    const bookingDate = new Date(date);
    const mealAvailability = await prisma.mealAvailability.findUnique({
      where: {
        Kooker_Id_date_mealType: {
          Kooker_Id: kookerId,
          date: bookingDate,
          mealType
        }
      }
    });

    // Si pas de disponibilité configurée ou pas disponible, refuser la réservation
    if (!mealAvailability || !mealAvailability.isAvailable || mealAvailability.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'Ce repas n\'est pas disponible pour cette date'
      });
    }

    // Calculer le prix total
    const totalPrice = specialtyCard.pricePerPerson * guestCount;

    // Créer la réservation avec le statut PKV (PENDING_KOOKER_VALIDATION)
    const booking = await prisma.booking.create({
      data: {
        User_Id: userId,
        Kooker_Id: kookerId,
        specialtyCardId,
        date: bookingDate,
        time,
        mealType,
        guestCount,
        totalPrice,
        notes: notes || null,
        status: 'PENDING_KOOKER_VALIDATION'
      },
      include: {
        user: {
          select: { User_Id: true, firstName: true, lastName: true, email: true }
        },
        kooker: {
          select: { id: true, user: { select: { firstName: true, lastName: true } } }
        },
        specialtyCard: {
          select: { id: true, name: true, pricePerPerson: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès en attente de validation du Kooker',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message
    });
  }
});

// Récupérer les réservations d'un utilisateur
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { User_Id: userId },
      include: {
        kooker: {
          select: {
            User_Id: true,
            user: { select: { firstName: true, lastName: true } },
            profileImage: true
          }
        },
        specialtyCard: {
          select: { id: true, name: true, pricePerPerson: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
});

// Récupérer les réservations d'un Kooker
app.get('/api/bookings/kooker/:kookerId', async (req, res) => {
  try {
    const { kookerId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { Kooker_Id: kookerId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        specialtyCard: {
          select: { id: true, name: true, pricePerPerson: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get kooker bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
});

// Mettre à jour le statut d'une réservation
app.patch('/api/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Valider le statut
    const validStatuses = ['PENDING_KOOKER_VALIDATION', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: {
          select: { User_Id: true, firstName: true, lastName: true, email: true }
        },
        kooker: {
          select: { id: true, user: { select: { firstName: true, lastName: true } } }
        },
        specialtyCard: {
          select: { id: true, name: true, pricePerPerson: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Statut de la réservation mis à jour',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
});

// Test de connexion à la base de données
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      success: true,
      message: 'API et base de données fonctionnent correctement',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error.message
    });
  }
});

// ===========================================
// ROUTES MEAL AVAILABILITIES
// ===========================================

// Récupérer les disponibilités par repas d'un Kooker pour une période (par user ID)
app.get('/api/kooker/meal-availabilities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Récupérer l'ID du KookerProfile à partir de l'ID utilisateur
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé pour cet utilisateur'
      });
    }

    const whereClause = { Kooker_Id: kookerProfile.id };
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const mealAvailabilities = await prisma.mealAvailability.findMany({
      where: whereClause,
      orderBy: [
        { date: 'asc' },
        { mealType: 'asc' }
      ]
    });

    res.json({
      success: true,
      mealAvailabilities
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités par repas:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des disponibilités par repas'
    });
  }
});

// Récupérer les disponibilités par repas d'un Kooker pour une période (par kooker profile ID)
app.get('/api/kooker/meal-availabilities/profile/:kookerProfileId', async (req, res) => {
  try {
    const { kookerProfileId } = req.params;
    const { startDate, endDate } = req.query;

    // Vérifier que le profil Kooker existe
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { id: kookerProfileId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé'
      });
    }

    const whereClause = { Kooker_Id: kookerProfileId };
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const mealAvailabilities = await prisma.mealAvailability.findMany({
      where: whereClause,
      orderBy: [
        { date: 'asc' },
        { mealType: 'asc' }
      ]
    });

    res.json({
      success: true,
      mealAvailabilities
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités par repas:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des disponibilités par repas'
    });
  }
});

// Mettre à jour une disponibilité par repas
app.post('/api/kooker/meal-availabilities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, mealType, isAvailable, status, notes } = req.body;

    // Récupérer l'ID du KookerProfile à partir de l'ID utilisateur
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé pour cet utilisateur'
      });
    }

    const mealAvailability = await prisma.mealAvailability.upsert({
      where: {
        Kooker_Id_date_mealType: {
          Kooker_Id: kookerProfile.id,
          date: new Date(date),
          mealType: mealType
        }
      },
      update: {
        isAvailable,
        status,
        notes
      },
      create: {
        Kooker_Id: kookerProfile.id,
        date: new Date(date),
        mealType,
        isAvailable,
        status,
        notes
      }
    });

    res.json({
      success: true,
      mealAvailability
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la disponibilité par repas:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la disponibilité par repas'
    });
  }
});

// Mettre à jour les disponibilités pour une journée complète
app.post('/api/kooker/meal-availabilities/day/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, availabilities } = req.body; // availabilities est un array d'objets { mealType, isAvailable, status, notes }

    // Récupérer l'ID du KookerProfile à partir de l'ID utilisateur
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé pour cet utilisateur'
      });
    }

    const results = [];

    for (const availability of availabilities) {
      const mealAvailability = await prisma.mealAvailability.upsert({
        where: {
          Kooker_Id_date_mealType: {
            Kooker_Id: kookerProfile.id,
            date: new Date(date),
            mealType: availability.mealType
          }
        },
        update: {
          isAvailable: availability.isAvailable,
          status: availability.status,
          notes: availability.notes
        },
        create: {
          Kooker_Id: kookerProfile.id,
          date: new Date(date),
          mealType: availability.mealType,
          isAvailable: availability.isAvailable,
          status: availability.status,
          notes: availability.notes
        }
      });
      results.push(mealAvailability);
    }

    res.json({
      success: true,
      mealAvailabilities: results
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des disponibilités de la journée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des disponibilités de la journée'
    });
  }
});

// Supprimer une disponibilité par repas
app.delete('/api/kooker/meal-availabilities/:userId/:date/:mealType', async (req, res) => {
  try {
    const { userId, date, mealType } = req.params;

    // Récupérer l'ID du KookerProfile à partir de l'ID utilisateur
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé pour cet utilisateur'
      });
    }

    await prisma.mealAvailability.delete({
      where: {
        Kooker_Id_date_mealType: {
          Kooker_Id: kookerProfile.id,
          date: new Date(date),
          mealType: mealType
        }
      }
    });

    res.json({
      success: true,
      message: 'Disponibilité supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la disponibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la disponibilité'
    });
  }
});

// Récupérer le statut des disponibilités pour un calendrier (vue d'ensemble)
app.get('/api/kooker/meal-availabilities/calendar/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Récupérer l'ID du KookerProfile à partir de l'ID utilisateur
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé pour cet utilisateur'
      });
    }

    const whereClause = { Kooker_Id: kookerProfile.id };
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const mealAvailabilities = await prisma.mealAvailability.findMany({
      where: whereClause,
      select: {
        date: true,
        mealType: true,
        isAvailable: true,
        status: true
      }
    });

    // Grouper par date pour calculer le statut global de chaque jour
    const dayStatuses = {};

    mealAvailabilities.forEach(meal => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (!dayStatuses[dateKey]) {
        dayStatuses[dateKey] = {
          date: dateKey,
          meals: [],
          allAvailable: true,
          someBooked: false,
          allBooked: true,
          hasAvailability: false
        };
      }

      dayStatuses[dateKey].meals.push(meal);
      dayStatuses[dateKey].hasAvailability = true;

      if (!meal.isAvailable || meal.status === 'BLOCKED') {
        dayStatuses[dateKey].allAvailable = false;
      }

      if (meal.status === 'BOOKED') {
        dayStatuses[dateKey].someBooked = true;
      } else {
        dayStatuses[dateKey].allBooked = false;
      }
    });

    // Calculer la couleur pour chaque jour
    Object.keys(dayStatuses).forEach(dateKey => {
      const day = dayStatuses[dateKey];

      if (!day.hasAvailability) {
        day.color = 'red'; // Pas de disponibilité définie
      } else if (day.allBooked) {
        day.color = 'yellow'; // Toutes les disponibilités sont réservées
      } else if (day.someBooked) {
        day.color = 'blue'; // Au moins une disponibilité est réservée
      } else if (day.allAvailable) {
        day.color = 'green'; // Toutes les disponibilités sont libres
      } else {
        day.color = 'red'; // Pas de disponibilité pour cette journée
      }
    });

    res.json({
      success: true,
      calendar: Object.values(dayStatuses)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du calendrier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du calendrier'
    });
  }
});

// Sauvegarder les paramètres hebdomadaires d'un Kooker
app.post('/api/kooker/weekly-settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const weeklySettings = req.body;

    // Récupérer l'ID du KookerProfile à partir de l'ID utilisateur
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé pour cet utilisateur'
      });
    }

    // Convertir les paramètres hebdomadaires en disponibilités par repas
    const mealAvailabilities = [];

    // Générer les disponibilités pour les 30 prochains jours à partir d'aujourd'hui
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);

    for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = dimanche, 1 = lundi, etc.
      const dateString = date.toISOString().split('T')[0];

      // Vérifier s'il y a des paramètres pour ce jour de la semaine
      const daySettings = weeklySettings[dayOfWeek];
      if (daySettings && daySettings.length > 0) {
        // Créer les disponibilités pour chaque repas configuré
        for (const mealSetting of daySettings) {
          mealAvailabilities.push({
            Kooker_Id: kookerProfile.id,
            date: new Date(dateString),
            mealType: mealSetting.mealType,
            isAvailable: true,
            status: 'AVAILABLE',
            notes: null
          });
        }
      }
    }

    // Supprimer les anciennes disponibilités pour éviter les doublons
    await prisma.mealAvailability.deleteMany({
      where: {
        Kooker_Id: kookerProfile.id,
        date: {
          gte: today,
          lte: endDate
        }
      }
    });

    // Insérer les nouvelles disponibilités
    if (mealAvailabilities.length > 0) {
      await prisma.mealAvailability.createMany({
        data: mealAvailabilities
      });
    }

    res.json({
      success: true,
      message: 'Paramètres hebdomadaires sauvegardés',
      availabilitiesCreated: mealAvailabilities.length
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres hebdomadaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde des paramètres hebdomadaires'
    });
  }
});

// Récupérer les paramètres hebdomadaires d'un Kooker
app.get('/api/kooker/weekly-settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer l'ID du KookerProfile à partir de l'ID utilisateur
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { User_Id: userId }
    });

    if (!kookerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profil Kooker non trouvé pour cet utilisateur'
      });
    }

    // Récupérer les disponibilités existantes
    const mealAvailabilities = await prisma.mealAvailability.findMany({
      where: {
        Kooker_Id: kookerProfile.id,
        date: {
          gte: new Date() // Seulement les disponibilités futures
        }
      }
    });

    // Reconstruire les paramètres hebdomadaires à partir des disponibilités
    const weeklySettings = {};

    mealAvailabilities.forEach(availability => {
      const dayOfWeek = availability.date.getDay();

      if (!weeklySettings[dayOfWeek]) {
        weeklySettings[dayOfWeek] = [];
      }

      // Éviter les doublons
      const exists = weeklySettings[dayOfWeek].some(
        setting => setting.mealType === availability.mealType
      );

      if (!exists) {
        weeklySettings[dayOfWeek].push({
          mealType: availability.mealType,
          isAvailable: availability.isAvailable
        });
      }
    });

    res.json({
      success: true,
      weeklySettings
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres hebdomadaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres hebdomadaires'
    });
  }
});

// ========================
// Routes de messagerie
// ========================

// Récupérer toutes les conversations d'un utilisateur
app.get('/api/messages/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupérer toutes les conversations de l'utilisateur
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { userId: userId },
          { kookerId: userId }
        ]
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        participants: true
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Formater les conversations avec les infos des participants
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const userInfo = await prisma.user.findUnique({
          where: { User_Id: conv.userId },
          select: { firstName: true, lastName: true, email: true }
        });

        const kookerInfo = await prisma.user.findUnique({
          where: { User_Id: conv.kookerId },
          select: { firstName: true, lastName: true, email: true }
        });

        // Compter les messages non lus
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            senderId: { not: userId }
          }
        });

        return {
          id: conv.id,
          userId: conv.userId,
          kookerId: conv.kookerId,
          lastMessageAt: conv.lastMessageAt,
          isActiveUser: conv.isActiveUser,
          isActiveKooker: conv.isActiveKooker,
          userInfo,
          kookerInfo,
          lastMessage: conv.messages[0] || null,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations'
    });
  }
});

// Récupérer une conversation spécifique
app.get('/api/messages/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    const userInfo = await prisma.user.findUnique({
      where: { User_Id: conversation.userId },
      select: { firstName: true, lastName: true, email: true }
    });

    const kookerInfo = await prisma.user.findUnique({
      where: { User_Id: conversation.kookerId },
      select: { firstName: true, lastName: true, email: true }
    });

    res.json({
      success: true,
      conversation: {
        ...conversation,
        userInfo,
        kookerInfo,
        lastMessage: conversation.messages[0] || null
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la conversation'
    });
  }
});

// Récupérer les messages d'une conversation
app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const totalMessages = await prisma.message.count({
      where: { conversationId }
    });

    const hasMore = skip + messages.length < totalMessages;

    res.json({
      success: true,
      messages: messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        senderInfo: msg.sender
      })),
      hasMore
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
});

// Envoyer un message
app.post('/api/messages/send', async (req, res) => {
  try {
    const { conversationId, recipientId, content } = req.body;

    // Si pas de conversationId, on doit créer une nouvelle conversation
    let convId = conversationId;

    if (!convId) {
      // Déterminer qui est l'utilisateur et qui est le kooker
      // Pour simplifier, on suppose que le sender est toujours dans le body
      // À améliorer selon votre logique d'authentification
      const senderId = req.body.senderId || req.body.userId;

      if (!senderId) {
        return res.status(400).json({
          success: false,
          error: 'Sender ID manquant'
        });
      }

      // Vérifier si une conversation existe déjà
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { userId: senderId, kookerId: recipientId },
            { userId: recipientId, kookerId: senderId }
          ]
        }
      });

      if (existingConversation) {
        convId = existingConversation.id;
      } else {
        // Créer une nouvelle conversation
        const newConversation = await prisma.conversation.create({
          data: {
            userId: senderId,
            kookerId: recipientId
          }
        });
        convId = newConversation.id;
      }
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: convId,
        senderId: req.body.senderId || req.body.userId,
        content,
        isRead: false
      },
      include: {
        sender: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    // Mettre à jour lastMessageAt de la conversation
    await prisma.conversation.update({
      where: { id: convId },
      data: { lastMessageAt: new Date() }
    });

    res.json({
      success: true,
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
        senderInfo: message.sender
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message'
    });
  }
});

// Marquer les messages comme lus
app.post('/api/messages/mark-read', async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Messages marqués comme lus'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage comme lu'
    });
  }
});

// Créer une conversation
app.post('/api/messages/conversation', async (req, res) => {
  try {
    const { userId, kookerId } = req.body;
    console.log('📝 Création conversation - userId:', userId, 'kookerId:', kookerId);

    // Vérifier si kookerId est un ID de profil ou d'utilisateur
    let actualKookerId = kookerId;

    // Essayer de trouver un profil de kooker avec cet ID
    const kookerProfile = await prisma.kookerProfile.findUnique({
      where: { id: kookerId },
      include: { user: true }
    });

    if (kookerProfile) {
      if (kookerProfile.User_Id) {
        actualKookerId = kookerProfile.User_Id;
        console.log('🔄 Conversion profil ID vers User_Id:', kookerId, '->', actualKookerId);
      } else {
        console.error('❌ Profil kooker trouvé mais User_Id est null:', kookerId);
        return res.status(400).json({
          success: false,
          message: 'Profil kooker invalide (User_Id manquant)'
        });
      }
    } else {
      console.log('🔍 Aucun profil kooker trouvé pour l\'ID:', kookerId, '- assume que c\'est déjà un User_Id');
    }

    // Vérifier que les utilisateurs existent
    const user = await prisma.user.findUnique({ where: { User_Id: userId } });
    const kooker = await prisma.user.findUnique({ where: { User_Id: actualKookerId } });

    console.log('👤 User trouvé:', !!user, 'Kooker trouvé:', !!kooker);
    console.log('🔍 userId final:', userId, 'actualKookerId final:', actualKookerId);

    if (user) console.log('✅ User details:', user.User_Id, user.email);
    if (kooker) console.log('✅ Kooker details:', kooker.User_Id, kooker.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!kooker) {
      return res.status(404).json({
        success: false,
        message: 'Kooker non trouvé'
      });
    }

    // Vérifier si une conversation existe déjà
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { userId: userId, kookerId: actualKookerId },
          { userId: actualKookerId, kookerId: userId }
        ]
      }
    });

    if (existingConversation) {
      const userInfo = await prisma.user.findUnique({
        where: { User_Id: existingConversation.userId },
        select: { firstName: true, lastName: true, email: true }
      });

      const kookerInfo = await prisma.user.findUnique({
        where: { User_Id: existingConversation.kookerId },
        select: { firstName: true, lastName: true, email: true }
      });

      return res.json({
        success: true,
        conversation: {
          ...existingConversation,
          userInfo,
          kookerInfo
        }
      });
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        kookerId: actualKookerId,
        participants: {
          create: [
            { userId, kookerId: actualKookerId, isUser: true },
            { userId, kookerId: actualKookerId, isUser: false }
          ]
        }
      }
    });

    const userInfo = await prisma.user.findUnique({
      where: { User_Id: userId },
      select: { firstName: true, lastName: true, email: true }
    });

    const kookerInfo = await prisma.user.findUnique({
      where: { User_Id: actualKookerId },
      select: { firstName: true, lastName: true, email: true }
    });

    res.json({
      success: true,
      conversation: {
        ...conversation,
        userInfo,
        kookerInfo
      }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la conversation'
    });
  }
});

// Supprimer une conversation (soft delete)
app.delete('/api/messages/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Soft delete selon le rôle de l'utilisateur
    const updateData = {};
    if (userId === conversation.userId) {
      updateData.isActiveUser = false;
    } else if (userId === conversation.kookerId) {
      updateData.isActiveKooker = false;
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Conversation supprimée'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la conversation'
    });
  }
});

// Compter les messages non lus
app.get('/api/messages/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { userId: userId },
            { kookerId: userId }
          ]
        },
        senderId: { not: userId },
        isRead: false
      }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du nombre de messages non lus'
    });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

// Gestion propre de la fermeture
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});