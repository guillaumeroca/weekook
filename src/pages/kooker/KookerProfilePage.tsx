import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChefHat, MapPin, Star, Clock, Users, Calendar, Award, CheckCircle2, Euro, X, Coffee, Utensils, Cookie, Moon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import { format, addDays } from 'date-fns';
import { kookersAPI } from '../../api/kookers';
import { mealAvailabilitiesAPI, MealType, MEAL_TYPE_LABELS } from '../../api/mealAvailabilities';
import { bookingsAPI } from '../../api/bookings';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { formatDateToString } from '../../utils/dateUtils';
import ChatButton from '../../components/chat/ChatButton';
import 'react-day-picker/dist/style.css';

// Types for specialty card
interface SpecialtyCard {
  id: string;
  name: string;
  serviceArea: string;
  pricePerPerson: number;
  additionalInfo: string;
  requiredEquipment: string;
  photos: string[];
}

// Interface pour les disponibilités par repas
interface MealAvailability {
  id: string;
  kookerId: string;
  date: string;
  mealType: MealType;
  isAvailable: boolean;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Icônes pour chaque type de repas
const getMealIcon = (mealType: MealType, className: string = '') => {
  switch (mealType) {
    case 'BREAKFAST':
      return <Coffee className={className} />;
    case 'LUNCH':
      return <Utensils className={className} />;
    case 'SNACK':
      return <Cookie className={className} />;
    case 'DINNER':
      return <Moon className={className} />;
    default:
      return <Utensils className={className} />;
  }
};

const KookerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedMealType, setSelectedMealType] = useState<MealType | ''>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyCard | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [kooker, setKooker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealAvailabilities, setMealAvailabilities] = useState<MealAvailability[]>([]);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');

  // Charger les données du kooker et ses disponibilités depuis l'API
  useEffect(() => {
    const loadKookerAndAvailabilities = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Charger les données du kooker
        const kookerData = await kookersAPI.getKookerById(id);
        if (!kookerData) {
          setError('Kooker non trouvé');
          setLoading(false);
          return;
        }

        // Charger les disponibilités par repas du kooker
        const startDate = format(new Date(), 'yyyy-MM-dd');
        const endDate = format(addDays(new Date(), 60), 'yyyy-MM-dd');

        console.log('🔍 Chargement des disponibilités par repas pour le kooker:', id);
        const mealAvailabilitiesResponse = await mealAvailabilitiesAPI.getMealAvailabilitiesByProfileId(id, startDate, endDate);
        console.log('🍽️ Réponse disponibilités par repas:', mealAvailabilitiesResponse);

        if (mealAvailabilitiesResponse.success && mealAvailabilitiesResponse.mealAvailabilities) {
          setMealAvailabilities(mealAvailabilitiesResponse.mealAvailabilities);

          // Créer un Set des dates qui ont au moins un repas disponible
          const datesWithAvailability = new Set<string>();
          mealAvailabilitiesResponse.mealAvailabilities.forEach((meal: MealAvailability) => {
            if (meal.isAvailable && meal.status === 'AVAILABLE') {
              // Convertir la date ISO en format YYYY-MM-DD
              const dateStr = formatDateToString(meal.date);
              datesWithAvailability.add(dateStr);
            }
          });
          setAvailableDates(datesWithAvailability);
          console.log('📅 Dates disponibles:', Array.from(datesWithAvailability));
        } else {
          console.log('⚠️ Pas de disponibilités trouvées dans la base de données');
          setAvailableDates(new Set());
        }

        // Adapter les données pour correspondre à la structure attendue
        const adaptedKooker = {
          id: kookerData.id,
          userId: kookerData.User_Id || kookerData.user?.User_Id, // Ajouter l'ID utilisateur
          firstName: kookerData.user.firstName || 'Kooker',
          lastName: kookerData.user.lastName || '',
          city: kookerData.user.city || 'Non spécifié',
          bio: kookerData.bio || 'Passionné de cuisine',
          profileImage: kookerData.profileImage || 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg',
          coverImage: kookerData.coverImage || 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg',
          specialties: kookerData.specialties || [],
          rating: kookerData.rating || 5.0,
          reviewCount: kookerData.reviewCount || 0,
          specialtyCards: kookerData.specialtyCards || [],
          experience: (kookerData as any).experience || '5 ans d\'expérience en cuisine',
          certificates: (kookerData as any).certificates || ['Certification professionnelle'],
          minimumDuration: (kookerData as any).minimumDuration || 2,
          maxGuests: (kookerData as any).maxGuests || 8,
          serviceArea: (kookerData as any).serviceArea || 20,
          reviews: [
            {
              id: 1,
              author: 'Client satisfait',
              date: '2024-02-15',
              rating: 5,
              comment: 'Excellent service, je recommande vivement !',
              type: 'Prestation générale'
            }
          ]
        };
        setKooker(adaptedKooker);
      } catch (err) {
        console.error('Erreur lors du chargement du kooker:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadKookerAndAvailabilities();
  }, [id]);

  // Fonction pour vérifier si une date a au moins un repas disponible
  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAvailable = availableDates.has(dateStr);
    // console.log(`📅 isDateAvailable(${dateStr}):`, isAvailable, 'AvailableDates:', Array.from(availableDates));
    return isAvailable;
  };

  // Fonction pour obtenir les repas disponibles pour une date
  const getAvailableMealsForDate = (date: Date): MealType[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealAvailabilities
      .filter(meal => {
        // Convertir la date ISO en format YYYY-MM-DD pour la comparaison
        const mealDateStr = formatDateToString(meal.date);
        return mealDateStr === dateStr && meal.isAvailable && meal.status === 'AVAILABLE';
      })
      .map(meal => meal.mealType);
  };

  // Ouvrir la modal quand on clique sur une date disponible
  const handleDateClick = (date: Date | undefined) => {
    console.log('🖱️ Clic sur date:', date ? format(date, 'yyyy-MM-dd') : 'undefined');
    if (date && isDateAvailable(date)) {
      console.log('✅ Date disponible, ouverture de la modal');
      setSelectedDate(date);
      setIsBookingModalOpen(true);
    } else {
      console.log('❌ Date non disponible ou invalide');
    }
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vous devez être connecté pour faire une réservation');
      return;
    }

    if (!selectedSpecialty || !selectedDate || !selectedMealType || !id) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setIsSubmittingBooking(true);

    try {
      const bookingData = {
        userId: user.id,
        kookerId: kooker.id,
        specialtyCardId: selectedSpecialty.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: '12:00', // On peut ajuster selon le type de repas si nécessaire
        mealType: selectedMealType,
        guestCount: guestCount,
        notes: bookingNotes || undefined
      };

      const response = await bookingsAPI.createBooking(bookingData);

      if (response.success) {
        toast.success('Réservation créée avec succès ! En attente de validation du Kooker.');
        // Réinitialiser le formulaire
        setSelectedSpecialty(null);
        setSelectedDate(undefined);
        setSelectedMealType('');
        setGuestCount(2);
        setBookingNotes('');
        setIsBookingModalOpen(false);
      } else {
        toast.error(response.message || 'Erreur lors de la création de la réservation');
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast.error('Erreur lors de la création de la réservation');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le kooker n'est pas trouvé
  if (error || !kooker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Kooker non trouvé</h2>
          <p className="text-gray-600 mb-4">{error || 'Ce profil n\'existe pas'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div
        className="h-80 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${kooker.coverImage})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-32 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={kooker.profileImage}
                  alt={`${kooker.firstName} ${kooker.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {kooker.firstName} {kooker.lastName}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <MapPin size={16} />
                      <span>{kooker.city}</span>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{kooker.rating}</span>
                        <span className="text-gray-500">({kooker.reviewCount} avis)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Euro size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">À partir de {kooker.specialtyCards.length > 0 ? Math.min(...kooker.specialtyCards.map((card: any) => card.pricePerPerson)) : 30}€</p>
                      <p className="text-sm text-gray-500">Par participant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">{kooker.minimumDuration}h minimum</p>
                      <p className="text-sm text-gray-500">Durée de service</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">Jusqu'à {kooker.maxGuests} pers.</p>
                      <p className="text-sm text-gray-500">Capacité d'accueil</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">{kooker.serviceArea} km</p>
                      <p className="text-sm text-gray-500">Zone de service</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos</h2>
              <p className="text-gray-600 whitespace-pre-line">{kooker.bio}</p>
            </section>

            {/* Specialty Cards */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Prestations proposées</h2>
              <div className="grid grid-cols-1 gap-6">
                {kooker.specialtyCards.map((card: any) => (
                  <div
                    key={card.id}
                    className="border-2 border-primary/10 rounded-lg overflow-hidden hover:border-primary transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Photos */}
                      <div className="relative h-48 md:h-full">
                        {card.photos.length > 0 ? (
                          <img
                            src={card.photos[0]}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <ChefHat size={48} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 md:col-span-2">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
                            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                              <MapPin size={14} />
                              <span>{card.serviceArea}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">{card.pricePerPerson}€</p>
                            <p className="text-sm text-gray-500">par personne</p>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{card.additionalInfo}</p>

                        {card.requiredEquipment && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-800 mb-2">Matériel requis :</h4>
                            <p className="text-gray-600 text-sm">{card.requiredEquipment}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Photos */}
                    {card.photos.length > 1 && (
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-2 gap-4">
                          {card.photos.slice(1).map((photo: any, index: any) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`${card.name} - Photo ${index + 2}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Specialties */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Spécialités</h2>
              <div className="flex flex-wrap gap-2">
                {kooker.specialties.map((specialty: any, index: any) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </section>

            {/* Experience & Certificates */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Expérience & Formation</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Award size={20} className="text-primary" />
                    Expérience
                  </h3>
                  <p className="text-gray-600">{kooker.experience}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-primary" />
                    Certifications
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {kooker.certificates.map((cert: any, index: any) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Avis</h2>
                <div className="flex items-center gap-2">
                  <Star size={24} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold">{kooker.rating}</span>
                  <span className="text-gray-500">({kooker.reviewCount} avis)</span>
                </div>
              </div>

              <div className="space-y-6">
                {kooker.reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{review.author}</h3>
                        <p className="text-sm text-gray-500">{review.type}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Booking Sidebar - Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Réserver une prestation</h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Sélectionnez une date en vert pour voir les disponibilités
                </p>
                <div className="flex items-center gap-4 text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00ff41' }}></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span>Non disponible</span>
                  </div>
                </div>
                {/* Debug info */}
                <div className="text-xs text-gray-500 mb-3">
                  Debug: {availableDates.size} dates disponibles | {mealAvailabilities.length} repas dans les données
                  {availableDates.size > 0 && (
                    <div className="mt-1">
                      Dates vertes: {Array.from(availableDates).slice(0, 5).join(', ')}
                    </div>
                  )}
                  {mealAvailabilities.length > 0 && (
                    <div className="mt-1">
                      Données brutes: {mealAvailabilities.slice(0, 2).map(m => `${formatDateToString(m.date)}(${m.mealType})`).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <style>{`
                .rdp {
                  --rdp-cell-size: 40px;
                }

                /* Dates disponibles en vert */
                .rdp-day_available {
                  background-color: transparent !important;
                  color: #059669 !important;
                  font-weight: 600 !important;
                  border: 2px solid #10b981 !important;
                  border-radius: 50% !important;
                  position: relative !important;
                }

                .rdp-day_available .rdp-button {
                  cursor: pointer !important;
                }

                .rdp-day_available:hover {
                  background-color: #10b981 !important;
                  color: white !important;
                }

                /* Dates sélectionnées */
                .rdp-day_selected {
                  background-color: #ef4444 !important;
                  color: white !important;
                }

                .rdp-day_selected .rdp-button {
                  cursor: pointer !important;
                }

                /* Dates non disponibles */
                .rdp-day:not(.rdp-day_available):not(.rdp-day_outside):not(.rdp-day_selected) {
                  opacity: 0.3;
                }

                .rdp-day:not(.rdp-day_available):not(.rdp-day_selected) .rdp-button {
                  cursor: not-allowed !important;
                }

                /* Dates passées */
                .rdp-day_disabled {
                  opacity: 0.2;
                }

                .rdp-day_disabled .rdp-button {
                  cursor: not-allowed !important;
                }

                /* Dates hors du mois */
                .rdp-day_outside .rdp-button {
                  cursor: not-allowed !important;
                }

                /* Masquer le focus ring par défaut */
                .rdp-day:focus {
                  outline: none;
                }

                /* Style des boutons de date */
                .rdp-button {
                  border: none;
                  background: transparent;
                  font-size: inherit;
                  padding: 8px;
                  width: 100%;
                  height: 100%;
                  border-radius: 6px;
                  cursor: default;
                }
              `}</style>

              <DayPicker
                mode="single"
                selected={selectedDate}
                onDayClick={(date, modifiers) => {
                  console.log('🖱️ Clic sur date:', format(date, 'yyyy-MM-dd'), 'Modifiers:', modifiers);
                  // Ne traiter le clic que si la date est disponible
                  if (modifiers.available && !modifiers.disabled && !modifiers.outside) {
                    handleDateClick(date);
                  } else {
                    console.log('❌ Date non disponible ou désactivée');
                  }
                }}
                locale={fr}
                modifiers={{
                  available: (date) => {
                    const isAvail = isDateAvailable(date);
                    console.log('🔍 Vérification date:', format(date, 'yyyy-MM-dd'), 'Disponible:', isAvail);
                    return isAvail;
                  }
                }}
                disabled={[
                  // Désactiver les dates passées
                  { before: new Date() },
                  // Désactiver les dates non disponibles
                  (date) => !isDateAvailable(date)
                ]}
                fromDate={new Date()}
                className="border border-gray-200 rounded-lg p-4"
                modifiersStyles={{
                  available: {
                    backgroundColor: '#00ff41',
                    color: 'black',
                    fontWeight: '700',
                    border: '2px solid #00d435',
                    opacity: 1
                  }
                }}
                showOutsideDays={false}
              />

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>Réponse rapide</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <Calendar size={16} />
                  <span>Disponible cette semaine</span>
                </div>
              </div>

              {/* Chat Button */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <ChatButton
                  kookerId={id!}
                  kookerName={`${kooker.firstName} ${kooker.lastName}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Réservation pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                </h2>
                <button
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setSelectedMealType('');
                    setSelectedSpecialty(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Sélection du type de repas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type de repas
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {getAvailableMealsForDate(selectedDate).map((mealType) => (
                      <button
                        key={mealType}
                        type="button"
                        onClick={() => setSelectedMealType(mealType)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedMealType === mealType
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getMealIcon(mealType, 'w-6 h-6 text-primary')}
                          <span className="font-medium">{MEAL_TYPE_LABELS[mealType]}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sélection de la prestation */}
                {selectedMealType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Prestation
                    </label>
                    <div className="space-y-3">
                      {kooker.specialtyCards.map((card: any) => (
                        <div
                          key={card.id}
                          onClick={() => setSelectedSpecialty(card)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedSpecialty?.id === card.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{card.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{card.additionalInfo}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-primary">{card.pricePerPerson}€</p>
                              <p className="text-xs text-gray-500">par personne</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nombre d'invités */}
                {selectedSpecialty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Nombre d'invités
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {[...Array(kooker.maxGuests)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? 'personne' : 'personnes'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notes (optionnel) */}
                {selectedSpecialty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Informations supplémentaires, allergies, préférences..."
                    />
                  </div>
                )}

                {/* Récapitulatif */}
                {selectedSpecialty && selectedMealType && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Récapitulatif</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date :</span>
                        <span className="font-medium">{format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Repas :</span>
                        <span className="font-medium">{MEAL_TYPE_LABELS[selectedMealType]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prestation :</span>
                        <span className="font-medium">{selectedSpecialty.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre d'invités :</span>
                        <span className="font-medium">{guestCount}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Prix par personne :</span>
                          <span className="font-medium">{selectedSpecialty.pricePerPerson}€</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="font-medium text-gray-900">Total :</span>
                          <span className="font-semibold text-primary text-lg">
                            {selectedSpecialty.pricePerPerson * guestCount}€
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bouton de réservation */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      setSelectedMealType('');
                      setSelectedSpecialty(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedSpecialty || !selectedMealType || isSubmittingBooking}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Calendar size={20} />
                    {isSubmittingBooking ? 'Réservation...' : 'Réserver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KookerProfilePage;