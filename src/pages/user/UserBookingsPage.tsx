import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle2, XCircle, AlertCircle, Euro } from 'lucide-react';
import { bookingsAPI, Booking } from '../../api/bookings';
import { useAuth } from '../../contexts/AuthContext';

const UserBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserBookings = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await bookingsAPI.getUserBookings(user.id);

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

    loadUserBookings();
  }, [user?.id]);

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes réservations</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réservation</h3>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore effectué de réservation</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Découvrir nos Kookers
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.kooker ?
                        `${booking.kooker.user.firstName} ${booking.kooker.user.lastName}` :
                        'Kooker'
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

                {booking.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Notes :</strong> {booking.notes}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Réservation effectuée le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                </div>

                {booking.status === 'PENDING_KOOKER_VALIDATION' && (
                  <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-400">
                    <p className="text-sm text-orange-800">
                      Votre réservation est en attente de validation par le Kooker.
                      Vous recevrez une notification dès qu'elle sera confirmée.
                    </p>
                  </div>
                )}

                {booking.status === 'PENDING_PAYMENT' && (
                  <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      Votre réservation a été validée ! Procédez au paiement pour la confirmer définitivement.
                    </p>
                    <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                      Payer maintenant
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookingsPage;