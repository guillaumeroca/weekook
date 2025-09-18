import { config } from '../config/generated';

const API_BASE_URL = config.urls.api;

export interface SearchFilters {
  query?: string;
  location?: string;
  specialties?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
}

export interface Kooker {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    city: string;
  };
  bio: string;
  profileImage: string;
  coverImage: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  specialtyCards: Array<{
    id: string;
    name: string;
    pricePerPerson: number;
  }>;
}

// Mock data pour les kookers
const mockKookers: Kooker[] = [
  {
    id: '1',
    user: {
      firstName: 'Marie',
      lastName: 'Dubois',
      city: 'Paris'
    },
    bio: 'Passionnée de cuisine française traditionnelle avec 15 ans d\'expérience',
    profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
    coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
    specialties: ['Cuisine française', 'Pâtisserie', 'Cuisine de saison'],
    rating: 4.8,
    reviewCount: 24,
    pricePerHour: 45,
    specialtyCards: [
      {
        id: '1',
        name: 'Menu traditionnel français',
        pricePerPerson: 35
      },
      {
        id: '2',
        name: 'Atelier pâtisserie',
        pricePerPerson: 28
      }
    ]
  },
  {
    id: '2',
    user: {
      firstName: 'Giuseppe',
      lastName: 'Rossi',
      city: 'Lyon'
    },
    bio: 'Chef italien spécialisé dans les pâtes fraîches et la cuisine méditerranéenne',
    profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
    coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
    specialties: ['Cuisine italienne', 'Pâtes fraîches', 'Méditerranéenne'],
    rating: 4.9,
    reviewCount: 31,
    pricePerHour: 50,
    specialtyCards: [
      {
        id: '3',
        name: 'Cours de pâtes fraîches',
        pricePerPerson: 40
      },
      {
        id: '4',
        name: 'Menu italien complet',
        pricePerPerson: 45
      }
    ]
  },
  {
    id: '3',
    user: {
      firstName: 'Yuki',
      lastName: 'Tanaka',
      city: 'Marseille'
    },
    bio: 'Spécialiste de la cuisine japonaise authentique et fusion',
    profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
    coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
    specialties: ['Cuisine japonaise', 'Sushi', 'Fusion'],
    rating: 4.7,
    reviewCount: 18,
    pricePerHour: 55,
    specialtyCards: [
      {
        id: '5',
        name: 'Atelier sushi',
        pricePerPerson: 50
      },
      {
        id: '6',
        name: 'Menu japonais traditionnel',
        pricePerPerson: 42
      }
    ]
  },
  {
    id: '4',
    user: {
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      city: 'Nice'
    },
    bio: 'Expert en cuisine du Maghreb et épices orientales',
    profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
    coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
    specialties: ['Cuisine marocaine', 'Orientale', 'Épices'],
    rating: 4.6,
    reviewCount: 22,
    pricePerHour: 40,
    specialtyCards: [
      {
        id: '7',
        name: 'Tajine et couscous',
        pricePerPerson: 32
      },
      {
        id: '8',
        name: 'Pâtisseries orientales',
        pricePerPerson: 25
      }
    ]
  },
  {
    id: '5',
    user: {
      firstName: 'Sophie',
      lastName: 'Martin',
      city: 'Bordeaux'
    },
    bio: 'Cheffe végétarienne passionnée par la cuisine healthy et créative',
    profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
    coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
    specialties: ['Cuisine végétarienne', 'Healthy', 'Bio'],
    rating: 4.9,
    reviewCount: 35,
    pricePerHour: 42,
    specialtyCards: [
      {
        id: '9',
        name: 'Menu végétarien créatif',
        pricePerPerson: 38
      },
      {
        id: '10',
        name: 'Cuisine healthy et colorée',
        pricePerPerson: 35
      }
    ]
  },
  {
    id: '6',
    user: {
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      city: 'Toulouse'
    },
    bio: 'Passionné de cuisine espagnole et tapas authentiques',
    profileImage: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
    coverImage: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
    specialties: ['Cuisine espagnole', 'Tapas', 'Paella'],
    rating: 4.5,
    reviewCount: 19,
    pricePerHour: 38,
    specialtyCards: [
      {
        id: '11',
        name: 'Soirée tapas',
        pricePerPerson: 30
      },
      {
        id: '12',
        name: 'Paella traditionnelle',
        pricePerPerson: 35
      }
    ]
  }
];

export const kookersAPI = {
  async searchKookers(filters: SearchFilters = {}): Promise<Kooker[]> {
    try {
      // Construire les paramètres de recherche
      const params = new URLSearchParams();
      
      if (filters.query) params.append('query', filters.query);
      if (filters.location) params.append('location', filters.location);
      if (filters.specialties && filters.specialties.length > 0) {
        params.append('specialties', filters.specialties.join(','));
      }
      if (filters.priceRange) {
        params.append('priceMin', filters.priceRange.min.toString());
        params.append('priceMax', filters.priceRange.max.toString());
      }
      if (filters.rating) params.append('rating', filters.rating.toString());

      const response = await fetch(`${API_BASE_URL}/kookers/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.kookers : [];
    } catch (error) {
      console.error('Error searching kookers:', error);
      // Fallback vers l'API getAllKookers
      return this.getAllKookers();
    }
  },

  async getAllKookers(): Promise<Kooker[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/kookers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.kookers : [];
    } catch (error) {
      console.error('Error getting all kookers:', error);
      // Fallback vers les données mock en cas d'erreur
      return mockKookers;
    }
  },

  async getKookerById(id: string): Promise<Kooker | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/kookers/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.kooker : null;
    } catch (error) {
      console.error('Error getting kooker by id:', error);
      // Fallback vers les données mock
      return mockKookers.find(kooker => kooker.id === id) || null;
    }
  },

  async getKookerProfile(userId: string): Promise<any | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/kooker/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.profile : null;
    } catch (error) {
      console.error('Error getting kooker profile:', error);
      return null;
    }
  }
};