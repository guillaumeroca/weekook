import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, ChefHat, Filter, X, Clock } from 'lucide-react';
import { kookersAPI, SearchFilters } from '../api/kookers';

interface SearchFormData {
  query: string;
  location: string;
  specialties: string[];
  priceRange: string;
  availability: string;
  rating: string;
}

interface KookerResult {
  id: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    city: string | null;
  };
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
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

const specialtiesList = [
  "Cuisine française",
  "Cuisine italienne",
  "Cuisine japonaise",
  "Pâtisserie",
  "Cuisine végétarienne",
  "Cuisine méditerranéenne",
  "Cuisine asiatique",
  "Boulangerie",
  "Cuisine du monde"
];

const SearchPage: React.FC = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [kookers, setKookers] = useState<KookerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit } = useForm<SearchFormData>();

  // Charger tous les kookers au démarrage
  useEffect(() => {
    loadKookers();
  }, []);

  const loadKookers = async (filters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await kookersAPI.searchKookers(filters || {});
      setKookers(results as KookerResult[]);
    } catch (err) {
      console.error('Error loading kookers:', err);
      setError('Erreur lors du chargement des Kookers');
      // Les données de fallback sont gérées dans l'API
      setKookers([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SearchFormData) => {
    const filters: SearchFilters = {};

    if (data.query) {
      filters.query = data.query;
    }

    if (data.location) {
      filters.location = data.location;
    }

    if (selectedSpecialties.length > 0) {
      filters.specialties = selectedSpecialties;
    }

    if (data.priceRange) {
      const [min, max] = data.priceRange.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        filters.priceRange = { min, max };
      } else if (data.priceRange.endsWith('+')) {
        const min = Number(data.priceRange.replace('+', ''));
        if (!isNaN(min)) {
          filters.priceRange = { min, max: 1000 };
        }
      }
    }

    if (data.rating) {
      filters.rating = Number(data.rating);
    }

    await loadKookers(filters);
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const getKookerName = (kooker: KookerResult) => {
    if (kooker.user.firstName && kooker.user.lastName) {
      return `${kooker.user.firstName} ${kooker.user.lastName}`;
    }
    return 'Kooker';
  };

  const getMinPrice = (kooker: KookerResult) => {
    if (kooker.specialtyCards.length > 0) {
      return Math.min(...kooker.specialtyCards.map(card => card.pricePerPerson));
    }
    return kooker.pricePerHour;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des Kookers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher par nom, spécialité..."
                    {...register('query')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div className="w-full md:w-64">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ville"
                    {...register('location')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Rechercher
              </button>
              <button
                type="button"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Filter size={20} />
                <span className="hidden md:inline">Filtres</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filtres</h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Spécialités</h3>
                <div className="space-y-2">
                  {specialtiesList.map(specialty => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={() => toggleSpecialty(specialty)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Prix par heure</h3>
                <select
                  {...register('priceRange')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Tous les prix</option>
                  <option value="0-25">Moins de 25€</option>
                  <option value="25-50">25€ - 50€</option>
                  <option value="50-75">50€ - 75€</option>
                  <option value="75+">Plus de 75€</option>
                </select>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Note minimum</h3>
                <select
                  {...register('rating')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Toutes les notes</option>
                  <option value="4.5">4.5+ étoiles</option>
                  <option value="4">4+ étoiles</option>
                  <option value="3.5">3.5+ étoiles</option>
                  <option value="3">3+ étoiles</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {kookers.length} Kooker{kookers.length > 1 ? 's' : ''} trouvé{kookers.length > 1 ? 's' : ''}
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {kookers.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun Kooker trouvé pour ces critères.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {kookers.map(kooker => (
                  <Link 
                    key={kooker.id} 
                    to={`/kookers/${kooker.id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Cover Image */}
                    <div className="relative h-48">
                      <img 
                        src={kooker.coverImage || "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg"}
                        alt={`Spécialité de ${getKookerName(kooker)}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Profile Image */}
                      <div className="absolute -bottom-6 left-6">
                        <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                          <img 
                            src={kooker.profileImage || "https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg"}
                            alt={getKookerName(kooker)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{getKookerName(kooker)}</h3>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <MapPin size={14} />
                            <span>{kooker.user.city || 'Non spécifié'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{kooker.rating}</span>
                          <span className="text-gray-500 text-sm">({kooker.reviewCount})</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">
                        {kooker.bio || 'Passionné de cuisine'}
                      </p>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {kooker.specialties.slice(0, 3).map((specialty, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {specialty}
                            </span>
                          ))}
                          {kooker.specialties.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              +{kooker.specialties.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Clock size={16} />
                            <span>À partir de {getMinPrice(kooker)}€</span>
                          </div>
                          <span className="text-primary hover:text-primary/90 font-medium transition-colors">
                            Voir le profil
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;