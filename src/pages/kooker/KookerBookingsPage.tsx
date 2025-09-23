import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle2, XCircle, AlertCircle, Euro, Phone, Mail, MessageCircle, Eye, X } from 'lucide-react';
import { bookingsAPI, Booking } from '../../api/bookings';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import { Link } from 'react-router-dom';

const KookerBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [kookerId, setKookerId] = useState<string | null>(null);

  useEffect(() => {
    const loadKookerProfile = async () => {
      if (!user?.isKooker || !user.id) return;

      try {
        const response = await authAPI.getKookerProfile(user.id);
        if (response.success && response.profile) {
          setKookerId(response.profile.id);
        } else {
          setError('Erreur lors du chargement du profil Kooker');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil Kooker:', err);
        setError('Erreur lors du chargement du profil Kooker');
      }
    };

    loadKookerProfile();
  }, [user]);

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

  const handleStatusUpdate = async (bookingId: string, newStatus: string, message?: string) => {
    try {
      setUpdatingBooking(bookingId);
      // Utiliser l'endpoint avec message qui enverra automatiquement un message dans la messagerie interne
      const response = await bookingsAPI.updateBookingStatusWithMessage(bookingId, newStatus, message);

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

  const handleAcceptBooking = (booking: Booking) => {
    const acceptMessage = `Bonjour ${booking.user?.firstName || ''},\n\nBonne nouvelle ! J'ai accepté votre réservation pour le ${formatDate(booking.date)} à ${booking.time}.\n\nVous allez recevoir un email pour procéder au paiement et confirmer définitivement votre réservation.\n\nJ'ai hâte de cuisiner pour vous !\n\nCordialement,\n${user?.firstName || 'Votre Kooker'}`;
    handleStatusUpdate(booking.id, 'PENDING_PAYMENT', acceptMessage);
  };

  const handleCancelBooking = () => {
    if (!cancellingBooking || !cancelReason.trim()) {
      alert('Veuillez saisir une raison d\'annulation');
      return;
    }

    const cancelMessage = `Bonjour ${cancellingBooking.user?.firstName || ''},\n\nJe suis désolé(e) de vous informer que je dois annuler votre réservation du ${formatDate(cancellingBooking.date)} à ${cancellingBooking.time}.\n\nRaison: ${cancelReason}\n\nToutes mes excuses pour ce désagrément. N'hésitez pas à me recontacter pour reprogrammer ou si vous avez des questions.\n\nCordialement,\n${user?.firstName || 'Votre Kooker'}`;

    handleStatusUpdate(cancellingBooking.id, 'CANCELLED', cancelMessage);
    setShowCancelModal(false);
    setCancellingBooking(null);
    setCancelReason('');
  };

  const openCancelModal = (booking: Booking) => {
    setCancellingBooking(booking);
    setShowCancelModal(true);
  };

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
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
                      onClick={() => handleAcceptBooking(booking)}
                      disabled={updatingBooking === booking.id}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      {updatingBooking === booking.id ? 'Validation...' : 'Accepter'}
                    </button>
                    <button
                      onClick={() => openCancelModal(booking)}
                      disabled={updatingBooking === booking.id}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Refuser
                    </button>
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-3">
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => {
                          const completeMessage = `Bonjour ${booking.user?.firstName || ''},\n\nJ'espère que vous avez apprécié notre moment culinaire ! Votre réservation du ${formatDate(booking.date)} est maintenant terminée.\n\nN'hésitez pas à laisser un avis sur votre expérience et à me recontacter pour de nouvelles aventures culinaires !\n\nÀ bientôt,\n${user?.firstName || 'Votre Kooker'}`;
                          handleStatusUpdate(booking.id, 'COMPLETED', completeMessage);
                        }}
                        disabled={updatingBooking === booking.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        {updatingBooking === booking.id ? 'Finalisation...' : 'Marquer comme terminée'}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openBookingModal(booking)}
                      className="flex items-center gap-2 px-3 py-1 text-primary hover:bg-primary/10 rounded-md transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                    {booking.user && (
                      <Link
                        to={`/messages?userId=${booking.user.id}`}
                        className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contacter
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Réservation du {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'annulation avec message obligatoire */}
      {showCancelModal && cancellingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-600">Annuler la réservation</h3>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellingBooking(null);
                    setCancelReason('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Vous êtes sur le point d'annuler la réservation de{' '}
                  <strong>{cancellingBooking.user?.firstName} {cancellingBooking.user?.lastName}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(cancellingBooking.date)} à {cancellingBooking.time}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de l'annulation (obligatoire) *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Expliquez la raison de l'annulation au client..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellingBooking(null);
                    setCancelReason('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={!cancelReason.trim() || updatingBooking === cancellingBooking.id}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors"
                >
                  Confirmer l'annulation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {/* Informations sur le client */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Client</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Nom :</strong> {selectedBooking.user ?
                        `${selectedBooking.user.firstName} ${selectedBooking.user.lastName}` :
                        'Information non disponible'
                      }
                    </p>
                    {selectedBooking.user?.phone && (
                      <p className="text-gray-700">
                        <strong>Téléphone :</strong> {selectedBooking.user.phone}
                      </p>
                    )}
                    {selectedBooking.user?.email && (
                      <p className="text-gray-700">
                        <strong>Email :</strong> {selectedBooking.user.email}
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
                        <strong>Prix par personne :</strong> {selectedBooking.specialtyCard.pricePerPerson}€
                      </p>
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
                    <h4 className="font-semibold text-gray-900 mb-2">Notes du client</h4>
                    <p className="text-gray-700">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6">
                {selectedBooking.user && (
                  <Link
                    to={`/messages?userId=${selectedBooking.user.id}`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contacter le client
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

export default KookerBookingsPage;