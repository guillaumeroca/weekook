import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { ChefHat, Settings, Calendar, Star, Save, MessageCircle, Clock, Users, MapPin, CheckCircle2, XCircle, AlertCircle, Euro, Eye, X } from 'lucide-react';
import { messagesAPI } from '../../api/messages';
import { bookingsAPI, Booking } from '../../api/bookings';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  postalCode: string;  // Code postal français (5 chiffres)
  city: string;
}

interface ExtendedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;  // Code postal français (5 chiffres)
  city?: string;
  isKooker: boolean;
  isVerified: boolean;
}

const UserSettingsPage: React.FC = () => {
  const { user, becomeKooker, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // États pour les réservations
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [reservationsTab, setReservationsTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
    }
  });

  // Récupérer les données complètes de l'utilisateur et le nombre de messages non lus
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user/${user.id}`);
        const result = await response.json();

        if (result.success) {
          setUserData(result.user);
          // Mettre à jour le formulaire avec les données de la BDD
          reset({
            firstName: result.user.firstName || '',
            lastName: result.user.lastName || '',
            phone: result.user.phone || '',
            address: result.user.address || '',
            postalCode: result.user.postalCode || '',
            city: result.user.city || '',
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      } finally {
        setDataLoading(false);
      }
    };

    const fetchUnreadCount = async () => {
      if (!user?.id) return;

      try {
        const response = await messagesAPI.getUnreadCount(user.id);
        if (response.success && response.count !== undefined) {
          setUnreadCount(response.count);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de messages non lus:', error);
      }
    };

    fetchUserData();
    fetchUnreadCount();
  }, [user?.id, reset]);

  // Charger les réservations utilisateur
  const loadUserBookings = async () => {
    if (!user?.id) return;

    try {
      setBookingsLoading(true);
      setBookingsError(null);
      const response = await bookingsAPI.getUserBookings(user.id);

      if (response.success && response.bookings) {
        setBookings(response.bookings);
      } else {
        setBookingsError(response.message || 'Erreur lors du chargement des réservations');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
      setBookingsError('Erreur lors du chargement des réservations');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fonctions d'aide pour les réservations
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_KOOKER_VALIDATION':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            En attente de validation
          </div>
        );
      case 'PENDING_PAYMENT':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Euro className="w-4 h-4" />
            En attente de paiement
          </div>
        );
      case 'CONFIRMED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Confirmée
          </div>
        );
      case 'CANCELLED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Annulée
          </div>
        );
      case 'COMPLETED':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Terminée
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
            {status}
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtrer les réservations
  const filterBookings = (bookings: Booking[], type: 'upcoming' | 'past') => {
    const now = new Date();
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return type === 'upcoming' ? bookingDate >= now : bookingDate < now;
    });
  };

  // Ouvrir le modal de détail
  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleBecomeKooker = async () => {
    setIsLoading(true);
    try {
      await becomeKooker();
    } catch (error) {
      console.error('Error becoming kooker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const displayUser = userData || user;

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon profil</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">
                  {displayUser.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium">
                  {displayUser.firstName && displayUser.lastName 
                    ? `${displayUser.firstName} ${displayUser.lastName}` 
                    : displayUser.email
                  }
                </h3>
                <p className="text-sm text-gray-500">
                  {displayUser.isKooker ? 'Client & Kooker' : 'Client'}
                </p>
                {!displayUser.isVerified && (
                  <p className="text-sm text-orange-600">Email non vérifié</p>
                )}
                {(displayUser.city || displayUser.address) && (
                  <p className="text-sm text-gray-500">
                    <button
                      onClick={() => {
                        // Détection du système d'exploitation
                        const userAgent = navigator.userAgent.toLowerCase();
                        const isIOS = /iphone|ipad|ipod/.test(userAgent);
                        const isAndroid = /android/.test(userAgent);
                        
                        // Construire l'adresse complète avec code postal
                        const fullAddress = [displayUser.address, displayUser.postalCode, displayUser.city].filter(Boolean).join(', ');
                        const searchQuery = fullAddress || displayUser.city || displayUser.address;
                        
                        let mapsUrl = '';
                        
                        if (isIOS) {
                          // Apple Maps sur iOS
                          mapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(searchQuery)}`;
                        } else if (isAndroid) {
                          // Google Maps sur Android
                          mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}`;
                        } else {
                          // Google Maps sur desktop
                          mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}`;
                        }
                        
                        window.open(mapsUrl, '_blank');
                      }}
                      className="hover:text-primary transition-colors cursor-pointer"
                      title="Voir sur la carte"
                    >
                      📍 {displayUser.address 
                        ? `${displayUser.address}${displayUser.postalCode ? ', ' + displayUser.postalCode : ''}, ${displayUser.city}` 
                        : displayUser.city}
                    </button>
                  </p>
                )}
              </div>
            </div>
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-md ${
                  activeTab === 'profile' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings size={18} />
                <span>Paramètres du profil</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('reservations');
                  loadUserBookings();
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-md ${
                  activeTab === 'reservations'
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar size={18} />
                <span>Réservations</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-md ${
                  activeTab === 'reviews'
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Star size={18} />
                <span>Avis</span>
              </button>
              <Link
                to="/messages"
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 relative"
              >
                <MessageCircle size={18} />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full ml-auto">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
          
          {!user.isKooker && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-dashed border-primary/50">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat size={24} className="text-primary" />
                <h3 className="font-semibold text-gray-800">Devenir Kooker</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Partagez votre passion pour la cuisine et gagnez un revenu supplémentaire.
              </p>
              <button 
                onClick={handleBecomeKooker}
                disabled={isLoading}
                className={`w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Inscription...' : 'Devenir Kooker'}
              </button>
            </div>
          )}

          {user.isKooker && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat size={24} className="text-primary" />
                <h3 className="font-semibold text-gray-800">Mode Kooker</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Vous êtes déjà inscrit comme Kooker. Gérez votre profil et vos disponibilités.
              </p>
              <Link 
                to="/kooker-settings" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
              >
                Accéder à mon profil Kooker
              </Link>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Paramètres du profil</h2>
                
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={displayUser.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      L'adresse email ne peut pas être modifiée
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        {...register('firstName', { required: 'Le prénom est requis' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        {...register('lastName', { required: 'Le nom est requis' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      id="address"
                      type="text"
                      {...register('address')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        maxLength={5}
                        pattern="[0-9]{5}"
                        {...register('postalCode', { 
                          pattern: {
                            value: /^[0-9]{5}$/,
                            message: 'Le code postal doit contenir exactement 5 chiffres'
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ex: 75001"
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        id="city"
                        type="text"
                        {...register('city')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className={`bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center gap-2 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Save size={18} />
                      {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'reservations' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Mes réservations</h2>

                {/* Onglets futures/passées */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setReservationsTab('upcoming')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          reservationsTab === 'upcoming'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        À venir ({filterBookings(bookings, 'upcoming').length})
                      </button>
                      <button
                        onClick={() => setReservationsTab('past')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          reservationsTab === 'past'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Passées ({filterBookings(bookings, 'past').length})
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Contenu des réservations */}
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-600">Chargement de vos réservations...</p>
                    </div>
                  </div>
                ) : bookingsError ? (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
                    <p className="text-gray-600 mb-4">{bookingsError}</p>
                    <button
                      onClick={loadUserBookings}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : (
                  (() => {
                    const filteredBookings = filterBookings(bookings, reservationsTab);

                    if (filteredBookings.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {reservationsTab === 'upcoming' ? 'Aucune réservation à venir' : 'Aucune réservation passée'}
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {reservationsTab === 'upcoming'
                              ? 'Vous n\'avez pas encore de réservations prévues'
                              : 'Vous n\'avez pas encore d\'historique de réservations'
                            }
                          </p>
                          {reservationsTab === 'upcoming' && (
                            <button
                              onClick={() => window.location.href = '/'}
                              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                              Découvrir nos Kookers
                            </button>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                          <div key={booking.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {booking.kooker ?
                                    `${booking.kooker.user.firstName} ${booking.kooker.user.lastName}` :
                                    'Kooker'
                                  }
                                </h3>
                                {booking.specialtyCard && (
                                  <p className="text-gray-600 text-sm mt-1">{booking.specialtyCard.name}</p>
                                )}
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(booking.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{booking.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Users className="w-4 h-4" />
                                <span>{booking.guestCount} invité{booking.guestCount > 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Euro className="w-4 h-4" />
                                <span className="font-semibold">{booking.totalPrice}€</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                Réservation du {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                              <button
                                onClick={() => openBookingModal(booking)}
                                className="flex items-center gap-2 px-3 py-1 text-primary hover:bg-primary/10 rounded-md transition-colors text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                Voir détails
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Avis</h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-500 italic">Vous n'avez pas encore d'avis.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détail de la réservation */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Détails de la réservation</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations sur le Kooker */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Kooker</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Nom :</strong> {selectedBooking.kooker ?
                        `${selectedBooking.kooker.user.firstName} ${selectedBooking.kooker.user.lastName}` :
                        'Information non disponible'
                      }
                    </p>
                    {selectedBooking.kooker?.user.phone && (
                      <p className="text-gray-700">
                        <strong>Téléphone :</strong> {selectedBooking.kooker.user.phone}
                      </p>
                    )}
                    {selectedBooking.kooker?.user.email && (
                      <p className="text-gray-700">
                        <strong>Email :</strong> {selectedBooking.kooker.user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Informations sur la spécialité */}
                {selectedBooking.specialtyCard && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Spécialité</h4>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <strong>Nom :</strong> {selectedBooking.specialtyCard.name}
                      </p>
                      <p className="text-gray-700">
                        <strong>Zone de service :</strong> {selectedBooking.specialtyCard.serviceArea}
                      </p>
                      <p className="text-gray-700">
                        <strong>Prix par personne :</strong> {selectedBooking.specialtyCard.pricePerPerson}€
                      </p>
                      {selectedBooking.specialtyCard.additionalInfo && (
                        <p className="text-gray-700">
                          <strong>Informations :</strong> {selectedBooking.specialtyCard.additionalInfo}
                        </p>
                      )}
                      {selectedBooking.specialtyCard.requiredEquipment && (
                        <p className="text-gray-700">
                          <strong>Matériel requis :</strong> {selectedBooking.specialtyCard.requiredEquipment}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Détails de la réservation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Détails de la réservation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{formatDate(selectedBooking.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-600">Heure</p>
                        <p className="font-medium">{selectedBooking.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-600">Invités</p>
                        <p className="font-medium">{selectedBooking.guestCount} personne{selectedBooking.guestCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Euro className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-600">Prix total</p>
                        <p className="font-medium text-lg">{selectedBooking.totalPrice}€</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statut de la réservation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Statut</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      {getStatusBadge(selectedBooking.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Créée le {new Date(selectedBooking.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-700">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Actions selon le statut */}
                {selectedBooking.status === 'PENDING_PAYMENT' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Action requise</h4>
                    <p className="text-blue-800 text-sm mb-3">
                      Votre réservation a été validée ! Procédez au paiement pour la confirmer définitivement.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Payer maintenant
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'PENDING_KOOKER_VALIDATION' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">En attente</h4>
                    <p className="text-orange-800 text-sm">
                      Votre réservation est en attente de validation par le Kooker.
                      Vous recevrez une notification dès qu'elle sera confirmée.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6">
                {selectedBooking.kooker && (
                  <Link
                    to={`/messages?userId=${selectedBooking.kookerId}`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contacter le Kooker
                  </Link>
                )}
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettingsPage;