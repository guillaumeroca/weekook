
import { config } from '../config/generated';

const API_BASE_URL = config.urls.api;

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  isKooker: boolean;
  isVerified: boolean;
}

export const authAPI = {
  async login(data: LoginData): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Erreur de connexion'
      };
    }
  },

  async signup(data: SignupData): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Erreur lors de la création du compte'
      };
    }
  },

  async verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Erreur lors de la vérification'
      };
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Erreur lors de la demande de réinitialisation'
      };
    }
  },

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    postalCode?: string;  // Code postal français (5 chiffres)
    city?: string;
  }): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour du profil'
      };
    }
  },

  async becomeKooker(userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/become-kooker/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Become kooker error:', error);
      return {
        success: false,
        message: 'Erreur lors de la création du profil Kooker'
      };
    }
  },

  async updateKookerProfile(userId: string, data: {
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
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update kooker profile error:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour du profil Kooker'
      };
    }
  },

  async getCurrentUser(userId: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur'
      };
    }
  },

  async getKookerProfile(userId: string): Promise<{ success: boolean; profile?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get kooker profile error:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération du profil Kooker'
      };
    }
  },

  async createSpecialtyCard(userId: string, data: {
    name: string;
    serviceArea: string;
    pricePerPerson: number;
    additionalInfo?: string;
    requiredEquipment?: string;
    photos?: string[];
  }): Promise<{ success: boolean; specialtyCard?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/specialty-card/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create specialty card error:', error);
      return {
        success: false,
        message: 'Erreur lors de la création de la fiche spécialité'
      };
    }
  },

  async updateSpecialtyCard(cardId: string, data: {
    name: string;
    serviceArea: string;
    pricePerPerson: number;
    additionalInfo?: string;
    requiredEquipment?: string;
    photos?: string[];
  }): Promise<{ success: boolean; specialtyCard?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/specialty-card/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update specialty card error:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de la fiche spécialité'
      };
    }
  },

  async deleteSpecialtyCard(cardId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/specialty-card/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete specialty card error:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression de la fiche spécialité'
      };
    }
  }
};