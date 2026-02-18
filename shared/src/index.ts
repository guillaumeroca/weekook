export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  kookerProfileId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface KookerProfile {
  id: number;
  userId: number;
  bio?: string;
  specialties: string[];
  type: string[];
  city?: string;
  address?: string;
  experience?: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  active: boolean;
  user: User;
  services?: Service[];
  availabilities?: Availability[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  kookerProfileId: number;
  title: string;
  description?: string;
  type: string[];
  priceInCents: number;
  durationMinutes: number;
  maxGuests: number;
  active: boolean;
  allergens?: string[];
  constraints?: string[];
  images?: ServiceImage[];
  menuItems?: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceImage {
  id: number;
  serviceId: number;
  url: string;
  alt?: string;
  sortOrder: number;
}

export interface MenuItem {
  id: number;
  serviceId: number;
  category: string;
  name: string;
  description?: string;
  sortOrder: number;
}

export interface Booking {
  id: number;
  userId: number;
  kookerProfileId: number;
  serviceId: number;
  date: string;
  startTime: string;
  endTime?: string;
  guests: number;
  totalPriceInCents: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  user?: User;
  kookerProfile?: KookerProfile;
  service?: Service;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  userId: number;
  kookerProfileId: number;
  rating: number;
  comment?: string;
  user?: User;
  createdAt: string;
}

export interface Favorite {
  id: number;
  userId: number;
  kookerProfileId: number;
  kookerProfile?: KookerProfile;
  createdAt: string;
}

export interface Availability {
  id: number;
  kookerProfileId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  sender?: User;
  receiver?: User;
  createdAt: string;
}

export interface Testimonial {
  id: number;
  authorName: string;
  authorRole?: string;
  content: string;
  rating: number;
  featured: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
