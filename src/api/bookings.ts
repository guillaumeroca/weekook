import { config } from '../config/generated';

const API_BASE_URL = config.urls.api;

// Types
export interface BookingRequest {
  userId: string;
  kookerId: string;
  specialtyCardId: string;
  date: string; // Format ISO date
  time: string; // Format HH:MM
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';
  guestCount: number;
  notes?: string;
}

export interface Booking {
  id: string;
  userId: string;
  kookerId: string;
  specialtyCardId?: string;
  date: string;
  time: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';
  guestCount: number;
  totalPrice: number;
  status: 'PENDING_KOOKER_VALIDATION' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  kooker?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
    profileImage?: string;
  };
  specialtyCard?: {
    id: string;
    name: string;
    pricePerPerson: number;
  };
}

export interface BookingsResponse {
  success: boolean;
  bookings?: Booking[];
  message?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: Booking;
  message?: string;
}

// API Functions
export const bookingsAPI = {
  // Créer une réservation
  async createBooking(bookingData: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        message: 'Erreur lors de la création de la réservation'
      };
    }
  },

  // Récupérer les réservations d'un utilisateur
  async getUserBookings(userId: string): Promise<BookingsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des réservations'
      };
    }
  },

  // Récupérer les réservations d'un Kooker
  async getKookerBookings(kookerId: string): Promise<BookingsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/kooker/${kookerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching kooker bookings:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des réservations'
      };
    }
  },

  // Mettre à jour le statut d'une réservation
  async updateBookingStatus(bookingId: string, status: string): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour du statut'
      };
    }
  }
};