const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

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
        id: user.id,
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
        id: user.id,
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
      where: { id: userId },
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
      where: { id: userId },
      data: { isKooker: true },
    });

    // Créer un profil Kooker avec des valeurs par défaut
    await prisma.kookerProfile.create({
      data: {
        userId,
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
    const { bio, experience, profileImage, coverImage, serviceArea, pricePerHour, minimumDuration, maxGuests, specialties, certificates } = req.body;

    await prisma.kookerProfile.upsert({
      where: { userId },
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
        userId,
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
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
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
        userId: kookerProfile.userId,
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
      where: { id: userId },
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
        id: user.id,
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
      where: { userId }
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
        kookerId: kookerProfile.id,
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
            id: true,
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
        userId: kooker.userId,
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
        userId: kooker.userId,
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