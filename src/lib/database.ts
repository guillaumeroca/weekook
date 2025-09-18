import { PrismaClient } from '@prisma/client';

// Singleton pattern pour Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Test de connexion
export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    return false;
  }
}

// Types pour les données utilisateur
export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;  // Code postal français (5 chiffres)
  city?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;  // Code postal français (5 chiffres)
  city?: string;
  bio?: string;
}

export interface CreateKookerProfileData {
  userId: string;
  bio?: string;
  experience?: string;
  profileImage?: string;
  coverImage?: string;
  serviceArea?: number;
  pricePerHour?: number;
  minimumDuration?: number;
  maxGuests?: number;
  specialties?: string[];
  certificates?: string[];
}

export interface CreateSpecialtyCardData {
  kookerId: string;
  name: string;
  serviceArea: string;
  pricePerPerson: number;
  additionalInfo?: string;
  requiredEquipment?: string;
  photos?: string[];
}

export interface CreateBookingData {
  userId: string;
  kookerId: string;
  specialtyCardId?: string;
  date: Date;
  time: string;
  guestCount: number;
  totalPrice: number;
  notes?: string;
}

// Fonctions utilitaires pour la base de données
export const dbUtils = {
  // Utilisateurs
  async createUser(data: CreateUserData) {
    return await prisma.user.create({
      data: {
        ...data,
        isVerified: false,
        isKooker: false,
      },
    });
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        kookerProfile: {
          include: {
            specialtyCards: true,
          },
        },
      },
    });
  },

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        kookerProfile: {
          include: {
            specialtyCards: true,
          },
        },
      },
    });
  },

  async updateUser(id: string, data: UpdateUserData) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  async verifyUser(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  },

  async makeUserKooker(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { isKooker: true },
    });
  },

  // Profils Kooker
  async createKookerProfile(data: CreateKookerProfileData) {
    return await prisma.kookerProfile.create({
      data: {
        ...data,
        specialties: data.specialties || [],
        certificates: data.certificates || [],
      },
    });
  },

  async updateKookerProfile(userId: string, data: Partial<CreateKookerProfileData>) {
    return await prisma.kookerProfile.update({
      where: { userId },
      data: {
        ...data,
        specialties: data.specialties || [],
        certificates: data.certificates || [],
      },
    });
  },

  async getKookerProfile(userId: string) {
    return await prisma.kookerProfile.findUnique({
      where: { userId },
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
  },

  async getAllKookers() {
    return await prisma.kookerProfile.findMany({
      where: { isActive: true },
      include: {
        user: true,
        specialtyCards: true,
      },
    });
  },

  // Fiches spécialité
  async createSpecialtyCard(data: CreateSpecialtyCardData) {
    return await prisma.specialtyCard.create({
      data: {
        ...data,
        photos: data.photos || [],
      },
    });
  },

  async updateSpecialtyCard(id: string, data: Partial<CreateSpecialtyCardData>) {
    return await prisma.specialtyCard.update({
      where: { id },
      data: {
        ...data,
        photos: data.photos || [],
      },
    });
  },

  async deleteSpecialtyCard(id: string) {
    return await prisma.specialtyCard.delete({
      where: { id },
    });
  },

  async getSpecialtyCard(id: string) {
    return await prisma.specialtyCard.findUnique({
      where: { id },
      include: {
        kooker: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  // Réservations
  async createBooking(data: CreateBookingData) {
    return await prisma.booking.create({
      data,
    });
  },

  async getUserBookings(userId: string) {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        kooker: {
          include: {
            user: true,
          },
        },
        specialtyCard: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getKookerBookings(kookerId: string) {
    return await prisma.booking.findMany({
      where: { kookerId },
      include: {
        user: true,
        specialtyCard: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateBookingStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
    return await prisma.booking.update({
      where: { id },
      data: { status },
    });
  },

  // Avis
  async createReview(data: {
    bookingId: string;
    userId: string;
    kookerId: string;
    rating: number;
    comment?: string;
  }) {
    return await prisma.review.create({
      data,
    });
  },

  async getKookerReviews(kookerId: string) {
    return await prisma.review.findMany({
      where: { kookerId },
      include: {
        user: true,
        booking: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Recherche
  async searchKookers(filters: {
    query?: string;
    location?: string;
    specialties?: string[];
    priceRange?: { min: number; max: number };
    rating?: number;
  }) {
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (filters.location) {
      where.user = {
        city: {
          contains: filters.location,
          mode: 'insensitive',
        },
      };
    }

    if (filters.rating) {
      where.rating = {
        gte: filters.rating,
      };
    }

    if (filters.priceRange) {
      where.pricePerHour = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max,
      };
    }

    return await prisma.kookerProfile.findMany({
      where,
      include: {
        user: true,
        specialtyCards: true,
      },
    });
  },
};