import { config } from '../config/generated';

const API_BASE_URL = config.urls.api;

// Types
export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';
export type MealStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface MealAvailability {
  id: string;
  kookerId: string;
  date: string;
  mealType: MealType;
  isAvailable: boolean;
  status: MealStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealAvailabilityInput {
  date: string;
  mealType: MealType;
  isAvailable: boolean;
  status: MealStatus;
  notes?: string;
}

export interface DayMealAvailabilities {
  date: string;
  availabilities: MealAvailabilityInput[];
}

export interface MealAvailabilitiesResponse {
  success: boolean;
  mealAvailabilities?: MealAvailability[];
  message?: string;
}

export interface MealAvailabilityResponse {
  success: boolean;
  mealAvailability?: MealAvailability;
  message?: string;
}

export interface CalendarDay {
  date: string;
  meals: Array<{
    mealType: MealType;
    isAvailable: boolean;
    status: MealStatus;
  }>;
  color: 'green' | 'blue' | 'yellow' | 'red';
  allAvailable: boolean;
  someBooked: boolean;
  allBooked: boolean;
  hasAvailability: boolean;
}

export interface CalendarResponse {
  success: boolean;
  calendar?: CalendarDay[];
  message?: string;
}

// Labels pour les types de repas
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Petit déjeuner',
  LUNCH: 'Déjeuner',
  SNACK: 'Goûter',
  DINNER: 'Dîner'
};

// Ordre d'affichage des repas
export const MEAL_TYPE_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];

// API Functions
export const mealAvailabilitiesAPI = {
  // Récupérer les disponibilités par repas d'un Kooker pour une période (par user ID)
  async getMealAvailabilities(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<MealAvailabilitiesResponse> {
    try {
      let url = `${API_BASE_URL}/kooker/meal-availabilities/${userId}`;

      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching meal availabilities:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des disponibilités par repas'
      };
    }
  },

  // Récupérer les disponibilités par repas d'un Kooker pour une période (par kooker profile ID)
  async getMealAvailabilitiesByProfileId(
    kookerProfileId: string,
    startDate?: string,
    endDate?: string
  ): Promise<MealAvailabilitiesResponse> {
    try {
      let url = `${API_BASE_URL}/kooker/meal-availabilities/profile/${kookerProfileId}`;

      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching meal availabilities by profile ID:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des disponibilités par repas'
      };
    }
  },

  // Mettre à jour une disponibilité par repas
  async updateMealAvailability(
    userId: string,
    availability: MealAvailabilityInput
  ): Promise<MealAvailabilityResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/meal-availabilities/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(availability),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating meal availability:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour de la disponibilité par repas'
      };
    }
  },

  // Mettre à jour les disponibilités pour une journée complète
  async updateDayMealAvailabilities(
    userId: string,
    dayData: DayMealAvailabilities
  ): Promise<MealAvailabilitiesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/meal-availabilities/day/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dayData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating day meal availabilities:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour des disponibilités de la journée'
      };
    }
  },

  // Supprimer une disponibilité par repas
  async deleteMealAvailability(
    userId: string,
    date: string,
    mealType: MealType
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/meal-availabilities/${userId}/${date}/${mealType}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting meal availability:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression de la disponibilité'
      };
    }
  },

  // Récupérer le statut des disponibilités pour un calendrier (vue d'ensemble)
  async getCalendarView(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CalendarResponse> {
    try {
      let url = `${API_BASE_URL}/kooker/meal-availabilities/calendar/${userId}`;

      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching calendar view:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération du calendrier'
      };
    }
  },

  // Sauvegarder les paramètres hebdomadaires dans la base de données
  async saveWeeklySettings(
    userId: string,
    weeklySettings: any
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Convertir le format frontend vers le format backend
      const backendFormat: any = {};

      for (const [dayOfWeek, daySettings] of Object.entries(weeklySettings)) {
        const meals: any[] = [];

        for (const [mealType, mealConfig] of Object.entries(daySettings as any)) {
          if (mealConfig.isActive) {
            meals.push({
              mealType: mealType,
              enabled: true
            });
          }
        }

        if (meals.length > 0) {
          backendFormat[dayOfWeek] = meals;
        }
      }

      // Sauvegarde en base de données via l'API
      const response = await fetch(`${API_BASE_URL}/kooker/weekly-settings/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendFormat),
      });

      const data = await response.json();

      // Aussi sauvegarder en localStorage comme fallback (format original)
      const key = `weeklyMealSettings_${userId}`;
      localStorage.setItem(key, JSON.stringify(weeklySettings));

      return data;
    } catch (error) {
      console.error('Error saving weekly settings:', error);

      // Fallback vers localStorage uniquement si l'API échoue
      try {
        const key = `weeklyMealSettings_${userId}`;
        localStorage.setItem(key, JSON.stringify(weeklySettings));
        return {
          success: true,
          message: 'Paramètres hebdomadaires sauvegardés localement'
        };
      } catch (localError) {
        return {
          success: false,
          message: 'Erreur lors de la sauvegarde des paramètres hebdomadaires'
        };
      }
    }
  },

  // Récupérer les paramètres hebdomadaires depuis la base de données
  async getWeeklySettings(
    userId: string
  ): Promise<{ success: boolean; weeklySettings?: any; message?: string }> {
    try {
      // D'abord essayer de récupérer depuis l'API
      const response = await fetch(`${API_BASE_URL}/kooker/weekly-settings/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.weeklySettings) {
          // Convertir le format backend vers le format frontend
          const frontendFormat: any = {};

          // Initialiser tous les jours avec des valeurs par défaut
          for (let day = 0; day < 7; day++) {
            frontendFormat[day] = {
              BREAKFAST: { isActive: false, startTime: '07:00', endTime: '10:00' },
              LUNCH: { isActive: false, startTime: '12:00', endTime: '14:00' },
              SNACK: { isActive: false, startTime: '16:00', endTime: '18:00' },
              DINNER: { isActive: false, startTime: '19:00', endTime: '22:00' }
            };
          }

          // Appliquer les données de l'API
          for (const [dayOfWeek, meals] of Object.entries(data.weeklySettings)) {
            const dayIndex = parseInt(dayOfWeek);
            if (Array.isArray(meals)) {
              for (const meal of meals) {
                if (frontendFormat[dayIndex] && frontendFormat[dayIndex][meal.mealType]) {
                  frontendFormat[dayIndex][meal.mealType].isActive = true;
                }
              }
            }
          }

          return {
            success: true,
            weeklySettings: frontendFormat
          };
        }
      }

      // Fallback vers localStorage si l'API échoue ou n'a pas de données
      const key = `weeklyMealSettings_${userId}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        const weeklySettings = JSON.parse(stored);
        return {
          success: true,
          weeklySettings
        };
      } else {
        return {
          success: true,
          weeklySettings: {}
        };
      }
    } catch (error) {
      console.error('Error loading weekly settings:', error);

      // Fallback vers localStorage en cas d'erreur
      try {
        const key = `weeklyMealSettings_${userId}`;
        const stored = localStorage.getItem(key);

        if (stored) {
          const weeklySettings = JSON.parse(stored);
          return {
            success: true,
            weeklySettings
          };
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }

      return {
        success: false,
        message: 'Erreur lors du chargement des paramètres hebdomadaires'
      };
    }
  }
};

// Utilitaires
export const getMealTypeColor = (mealType: MealType): string => {
  switch (mealType) {
    case 'BREAKFAST':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LUNCH':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'SNACK':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'DINNER':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusColor = (status: MealStatus): string => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-500';
    case 'BOOKED':
      return 'bg-blue-500';
    case 'BLOCKED':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

export const getDayColor = (color: 'green' | 'blue' | 'yellow' | 'red'): string => {
  switch (color) {
    case 'green':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'blue':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'yellow':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 'red':
      return 'bg-red-100 border-red-300 text-red-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};