import bcrypt from 'bcryptjs';
import { dbUtils } from './database';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isKooker: boolean;
  isVerified: boolean;
}

export class AuthService {
  static async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    try {
      const user = await dbUtils.getUserByEmail(email);
      
      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        isKooker: user.isKooker,
        isVerified: user.isVerified,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  static async createUser(email: string, password: string): Promise<AuthUser> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await dbUtils.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Un compte avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Créer l'utilisateur
      const user = await dbUtils.createUser({
        email,
        password: hashedPassword,
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        isKooker: user.isKooker,
        isVerified: user.isVerified,
      };
    } catch (error) {
      console.error('User creation error:', error);
      throw error;
    }
  }

  static async verifyUserEmail(userId: string): Promise<void> {
    try {
      await dbUtils.verifyUser(userId);
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error('Erreur lors de la vérification de l\'email');
    }
  }

  static async createKooker(userId: string): Promise<void> {
    try {
      // Marquer l'utilisateur comme Kooker
      await dbUtils.makeUserKooker(userId);

      // Créer le profil Kooker de base
      await dbUtils.createKookerProfile({
        userId,
        bio: '',
        experience: '',
        serviceArea: 20,
        pricePerHour: 35,
        minimumDuration: 2,
        maxGuests: 8,
        specialties: [],
        certificates: [],
      });
    } catch (error) {
      console.error('Kooker creation error:', error);
      throw new Error('Erreur lors de la création du profil Kooker');
    }
  }

  static async updateUserProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
  }): Promise<void> {
    try {
      await dbUtils.updateUser(userId, data);
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }

  static async updateKookerProfile(userId: string, data: {
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
  }): Promise<void> {
    try {
      await dbUtils.updateKookerProfile(userId, data);
    } catch (error) {
      console.error('Kooker profile update error:', error);
      throw new Error('Erreur lors de la mise à jour du profil Kooker');
    }
  }

  static logout(): void {
    // Dans une vraie application, on invaliderait les tokens ici
    console.log('User logged out');
  }
}