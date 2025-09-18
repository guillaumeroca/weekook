import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle2, XCircle, AlertCircle, Euro, Phone, Mail } from 'lucide-react';
import { bookingsAPI, Booking } from '../../api/bookings';
import { useAuth } from '../../contexts/AuthContext';

const KookerBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  // Récupérer l'ID du profil Kooker (à adapter selon votre structure)
  const kookerId = user?.isKooker ? user.id : null;

  useEffect(() => {
    const loadKookerBookings = async () => {
      if (!kookerId) return;

      try {
        setLoading(true);
        const response = await bookingsAPI.getKookerBookings(kookerId);

        if (response.success && response.bookings) {
          setBookings(response.bookings);
        } else {
          setError(response.message || 'Erreur lors du chargement des réservations');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des réservations:', err);
        setError('Erreur lors du chargement des réservations');
      } finally {
        setLoading(false);
      }
    };

    loadKookerBookings();
  }, [kookerId]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingBooking(bookingId);
      const response = await bookingsAPI.updateBookingStatus(bookingId, newStatus);

      if (response.success) {
        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: newStatus as any }
              : booking
          )
        );
      } else {
        alert(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingBooking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_KOOKER_VALIDATION':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            À valider
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

  if (!user?.isKooker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Cette page est réservée aux Kookers</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des réservations</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réservation</h3>
            <p className="text-gray-600">Vous n'avez pas encore reçu de réservation</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.user ?
                        `${booking.user.firstName} ${booking.user.lastName}` :
                        'Client'
                      }
                    </h3>
                    {booking.specialtyCard && (
                      <p className="text-gray-600 mt-1">{booking.specialtyCard.name}</p>
                    )}
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{booking.guestCount} invité{booking.guestCount > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Euro className="w-4 h-4" />
                    <span className="font-semibold">{booking.totalPrice}€</span>
                  </div>
                </div>

                {booking.user && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Informations client</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{booking.user.email}</span>
                      </div>
                      {booking.user.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{booking.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Notes du client :</strong> {booking.notes}
                    </p>
                  </div>
                )}

                {booking.status === 'PENDING_KOOKER_VALIDATION' && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'PENDING_PAYMENT')}
                      disabled={updatingBooking === booking.id}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      {updatingBooking === booking.id ? 'Validation...' : 'Accepter'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                      disabled={updatingBooking === booking.id}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      {updatingBooking === booking.id ? 'Annulation...' : 'Refuser'}
                    </button>
                  </div>
                )}

                {booking.status === 'CONFIRMED' && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                      disabled={updatingBooking === booking.id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      {updatingBooking === booking.id ? 'Finalisation...' : 'Marquer comme terminée'}
                    </button>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Réservation du {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KookerBookingsPage;