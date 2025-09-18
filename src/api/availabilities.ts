import { config } from '../config/generated';

const API_BASE_URL = config.urls.api;

// Types
export interface WeeklyAvailability {
  id: string;
  dayOfWeek: number; // 0=Dimanche, 1=Lundi, 2=Mardi, ..., 6=Samedi
  startTime: string; // Format HH:MM
  endTime: string;   // Format HH:MM
  isActive: boolean;
}

export interface DailyAvailability {
  id: string;
  date: string; // Format ISO date
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
  status: 'AVAILABLE' | 'PARTIALLY_BOOKED' | 'FULLY_BOOKED' | 'UNAVAILABLE';
  notes?: string;
}

export interface AvailabilitiesResponse {
  success: boolean;
  availabilities?: {
    weekly: WeeklyAvailability[];
    daily: DailyAvailability[];
  };
  message?: string;
}

export interface WeeklyAvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface DailyAvailabilityInput {
  date: string;
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
  status?: 'AVAILABLE' | 'PARTIALLY_BOOKED' | 'FULLY_BOOKED' | 'UNAVAILABLE';
  notes?: string;
}

// API Functions
export const availabilitiesAPI = {
  // Récupérer toutes les disponibilités d'un Kooker
  async getAvailabilities(userId: string): Promise<AvailabilitiesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/kooker/availabilities/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des disponibilités'
      };
    }
  },

  // Mettre à jour les disponibilités hebdomadaires
  async updateWeeklyAvailabilities(userId: string, availabilities: WeeklyAvailabilityInput[]): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/kooker/availabilities/weekly/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availabilities }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating weekly availabilities:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour des disponibilités hebdomadaires'
      };
    }
  },

  // Mettre à jour une disponibilité quotidienne
  async updateDailyAvailability(userId: string, availability: DailyAvailabilityInput): Promise<{ success: boolean; availability?: DailyAvailability; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/kooker/availabilities/daily/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(availability),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating daily availability:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de la disponibilité'
      };
    }
  },

  // Supprimer une disponibilité quotidienne
  async deleteDailyAvailability(userId: string, date: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/kooker/availabilities/daily/${userId}/${date}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting daily availability:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression de la disponibilité'
      };
    }
  }
};