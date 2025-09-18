import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChefHat, MapPin, Star, Clock, Users, Calendar, Award, CheckCircle2, Euro } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import { format, addDays } from 'date-fns';
import { kookersAPI } from '../../api/kookers';

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

// Generate available dates for the next 30 days
const generateAvailableDates = () => {
  const availableTimeSlots: Record<string, string[]> = {};
  const today = new Date();
  
  // Add random available slots for the next 30 days
  for (let i = 1; i <= 30; i++) {
    if (Math.random() > 0.5) { // 50% chance of a date being available
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Generate random time slots
      const timeSlots = [];
      if (Math.random() > 0.5) timeSlots.push('10:00');
      if (Math.random() > 0.5) timeSlots.push('14:00');
      if (Math.random() > 0.5) timeSlots.push('19:00');
      
      if (timeSlots.length > 0) {
        availableTimeSlots[dateStr] = timeSlots;
      }
    }
  }
  
  return availableTimeSlots;
};

// Update mock data with generated dates
const mockKooker = {
  id: '1',
  firstName: 'Marie',
  lastName: 'Dubois',
  profileImage: "https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg",
  coverImage: "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg",
  city: 'Lyon',
  bio: "Passionnée de cuisine depuis mon plus jeune âge, j'ai suivi une formation à l'école Ferrandi avant de travailler dans plusieurs restaurants étoilés. Aujourd'hui, je partage ma passion à travers des cours et des dîners privés.",
  specialties: ['Cuisine française', 'Pâtisserie', 'Cuisine méditerranéenne'],
  experience: "15 ans d'expérience en cuisine, dont 5 ans dans des restaurants étoilés",
  certificates: [
    'Diplôme de l\'École Ferrandi',
    'CAP Cuisine',
    'Formation en pâtisserie fine'
  ],
  rating: 4.9,
  reviewCount: 124,
  minimumDuration: 2,
  maxGuests: 8,
  serviceArea: 20,
  specialtyCards: [
    {
      id: '1',
      name: 'Atelier Macarons',
      serviceArea: 'Lyon et périphérie',
      pricePerPerson: 65,
      additionalInfo: 'Apprenez à réaliser des macarons comme un professionnel. Vous repartirez avec vos créations et toutes les techniques pour les reproduire chez vous.',
      requiredEquipment: 'Four, robot pâtissier, plaque de cuisson',
      photos: [
        'https://images.pexels.com/photos/3776529/pexels-photo-3776529.jpeg',
        'https://images.pexels.com/photos/4109996/pexels-photo-4109996.jpeg',
        'https://images.pexels.com/photos/6941042/pexels-photo-6941042.jpeg'
      ]
    },
    {
      id: '2',
      name: 'Dîner Gastronomique',
      serviceArea: 'Lyon',
      pricePerPerson: 85,
      additionalInfo: 'Un menu gastronomique 3 services élaboré selon vos préférences. Une expérience unique dans le confort de votre maison.',
      requiredEquipment: 'Cuisine équipée, four, plaques de cuisson',
      photos: [
        'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg',
        'https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg'
      ]
    }
  ],
  availableTimeSlots: generateAvailableDates(),
  reviews: [
    {
      id: 1,
      author: 'Sophie Martin',
      date: '2024-02-15',
      rating: 5,
      comment: "Une expérience incroyable ! Marie est une excellente pédagogue et nous a appris à faire des macarons comme des pros. Je recommande vivement !",
      type: "Atelier Macarons"
    },
    {
      id: 2,
      author: 'Pierre Durand',
      date: '2024-02-10',
      rating: 5,
      comment: "Soirée mémorable avec Marie qui nous a préparé un dîner gastronomique exceptionnel. Sa cuisine est raffinée et pleine de saveurs.",
      type: "Dîner Gastronomique"
    },
    {
      id: 3,
      author: 'Julie Bernard',
      date: '2024-02-01',
      rating: 4,
      comment: "Très bon cours de cuisine française. Marie partage ses connaissances avec passion et donne plein de conseils pratiques.",
      type: "Cours de cuisine"
    }
  ]
};

const KookerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyCard | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [isBookingModalOpen, _setIsBookingModalOpen] = useState(false);
  const [kooker, setKooker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du kooker depuis l'API
  useEffect(() => {
    const loadKooker = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const kookerData = await kookersAPI.getKookerById(id);
        if (kookerData) {
          // Adapter les données pour correspondre à la structure attendue
          const adaptedKooker = {
            id: kookerData.id,
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
            // Données par défaut avec vraies données si disponibles
            experience: kookerData.experience || '5 ans d\'expérience en cuisine',
            certificates: kookerData.certificates || ['Certification professionnelle'],
            minimumDuration: kookerData.minimumDuration || 2,
            maxGuests: kookerData.maxGuests || 8,
            serviceArea: kookerData.serviceArea || 20,
            availableTimeSlots: generateAvailableDates(),
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
        } else {
          setError('Kooker non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du kooker:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadKooker();
  }, [id]);

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

  // Get available dates from the kooker's availableTimeSlots
  const availableDates = Object.keys(kooker.availableTimeSlots).map(date => new Date(date));

  // Function to check if a date is available
  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      format(availableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return kooker.availableTimeSlots[dateKey] || [];
  };

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
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Calendar size={20} />
                    Réserver
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Euro size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">À partir de {kooker.specialtyCards.length > 0 ? Math.min(...kooker.specialtyCards.map(card => card.pricePerPerson)) : 30}€</p>
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
                {kooker.specialtyCards.map((card) => (
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

                        <button
                          onClick={() => {
                            setSelectedSpecialty(card);
                            setIsBookingModalOpen(true);
                          }}
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          Réserver cette prestation
                        </button>
                      </div>
                    </div>

                    {/* Additional Photos */}
                    {card.photos.length > 1 && (
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-2 gap-4">
                          {card.photos.slice(1).map((photo, index) => (
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
                {kooker.specialties.map((specialty, index) => (
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
                    {kooker.certificates.map((cert, index) => (
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
                {kooker.reviews.map((review) => (
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

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Réserver une prestation</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de prestation
                  </label>
                  <select
                    value={selectedSpecialty?.id || ''}
                    onChange={(e) => {
                      const specialty = kooker.specialtyCards.find(card => card.id === e.target.value);
                      setSelectedSpecialty(specialty || null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionnez une prestation</option>
                    {kooker.specialtyCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} - {card.pricePerPerson}€/pers.
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSpecialty && (
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm text-gray-600">{selectedSpecialty.additionalInfo}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-primary font-medium">{selectedSpecialty.pricePerPerson}€ par personne</p>
                      <p className="text-gray-500">Zone : {selectedSpecialty.serviceArea}</p>
                      {selectedSpecialty.requiredEquipment && (
                        <p className="text-gray-500">
                          Matériel requis : {selectedSpecialty.requiredEquipment}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="border border-gray-200 rounded-lg">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={fr}
                      modifiers={{
                        available: isDateAvailable
                      }}
                      modifiersStyles={{
                        available: {
                          fontWeight: 'bold'
                        }
                      }}
                      disabled={!selectedSpecialty}
                      fromDate={new Date()}
                      className="p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horaire
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedDate || !selectedSpecialty}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Sélectionnez un horaire</option>
                    {getAvailableTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de participants
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    disabled={!selectedSpecialty}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'participant' : 'participants'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSpecialty && selectedDate && selectedTime && guestCount && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Récapitulatif</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Prix par personne : {selectedSpecialty.pricePerPerson}€</p>
                      <p>Nombre de participants : {guestCount}</p>
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <p className="text-lg font-medium text-primary">
                          Total : {selectedSpecialty.pricePerPerson * guestCount}€
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!selectedSpecialty || !selectedDate || !selectedTime}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar size={20} />
                    Réserver
                  </button>
                </div>
              </form>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KookerProfilePage;