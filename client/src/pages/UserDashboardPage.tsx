import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';

// ────────────────────────── Types ──────────────────────────
interface Booking {
  id: number;
  serviceName: string;
  kookerName: string;
  kookerAvatar: string;
  date: string;
  time: string;
  guests: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalPrice: number;
}

interface FavoriteKooker {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
}

// ────────────────────────── API Response Types ──────────────────────────
interface ApiBooking {
  id: number;
  date: string;
  startTime: string;
  guests: number;
  totalPriceInCents: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  service: {
    id: number;
    title: string;
    type: string;
  };
  kookerProfile: {
    id: number;
    city: string;
    user: {
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
  };
}

interface ApiFavorite {
  id: number;
  kookerProfile: {
    id: number;
    city: string;
    specialties: string;
    rating: number;
    reviewCount: number;
    user: {
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
    services: { priceInCents: number }[];
  };
}

// ────────────────────────── Helper Components ──────────────────────────

const StatusBadge = ({ status }: { status: Booking['status'] }) => {
  const config = {
    confirmed: { label: 'Confirmée', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    pending: { label: 'En attente', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    cancelled: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    completed: { label: 'Terminée', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  };
  const s = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatPrice = (cents: number) => {
  return (cents / 100).toFixed(2).replace('.', ',') + ' EUR';
};

// ────────────────────────── Booking Card ──────────────────────────

const BookingCard = ({ booking, showActions = false, onCancel }: { booking: Booking; showActions?: boolean; onCancel?: (id: number) => void }) => (
  <div className="bg-white rounded-[20px] border border-[#e0e2ef] p-5 md:p-6 hover:shadow-md transition-shadow">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="flex gap-4 flex-1 min-w-0">
        {/* Kooker Avatar */}
        <div className="w-12 h-12 rounded-full bg-[#c1a0fd]/20 flex items-center justify-center flex-shrink-0">
          {booking.kookerAvatar ? (
            <img src={booking.kookerAvatar} alt={booking.kookerName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <span className="text-[#c1a0fd] font-bold text-[14px]">
              {booking.kookerName.split(' ').map(n => n[0]).join('')}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="text-[15px] font-semibold text-[#111125] truncate">{booking.serviceName}</h4>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-[13px] text-[#111125]/60 mb-2">par {booking.kookerName}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#111125]/60">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.75" y="2.33337" width="10.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M1.75 5.83337H12.25" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M4.66667 1.16663V3.49996" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M9.33333 1.16663V3.49996" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              {formatDate(booking.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M7 4.08337V7.00004L8.75 8.75004" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              {booking.time}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.91667 12.25V11.0833C9.91667 10.4645 9.67083 9.871 9.23325 9.43342C8.79567 8.99583 8.20217 8.75 7.58333 8.75H3.5C2.88116 8.75 2.28767 8.99583 1.85008 9.43342C1.4125 9.871 1.16667 10.4645 1.16667 11.0833V12.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <circle cx="5.54167" cy="4.08333" r="2.33333" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M12.8333 12.25V11.0833C12.8333 10.0833 12.1667 9.25 11.375 8.91667" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M9.625 1.91663C10.4167 2.24996 11.0833 3.08329 11.0833 4.08329C11.0833 5.08329 10.4167 5.91663 9.625 6.24996" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              {booking.guests} convive{booking.guests > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-3">
        <p className="text-[16px] font-bold text-[#111125]">{formatPrice(booking.totalPrice)}</p>
        {showActions && booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-[12px] font-medium text-[#111125]/60 hover:text-[#111125] bg-[#f2f4fc] hover:bg-[#e8eaf5] rounded-[8px] transition-all">
              Détails
            </button>
            <button
              onClick={() => onCancel?.(booking.id)}
              className="px-3 py-1.5 text-[12px] font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-[8px] transition-all"
            >
              Annuler
            </button>
          </div>
        )}
        {booking.status === 'completed' && (
          <button className="px-3 py-1.5 text-[12px] font-medium text-[#c1a0fd] hover:text-[#b090ed] bg-[#c1a0fd]/10 hover:bg-[#c1a0fd]/20 rounded-[8px] transition-all">
            Laisser un avis
          </button>
        )}
      </div>
    </div>
  </div>
);

// ────────────────────────── Favorite Card ──────────────────────────

const FavoriteKookerCard = ({ kooker, onRemove }: { kooker: FavoriteKooker; onRemove: (id: number) => void }) => (
  <Link
    to={`/kooker/${kooker.id}`}
    className="bg-white rounded-[20px] border border-[#e0e2ef] overflow-hidden hover:shadow-md transition-shadow group block"
  >
    {/* Image placeholder */}
    <div className="h-[140px] bg-gradient-to-br from-[#c1a0fd]/20 to-[#c1a0fd]/5 relative flex items-center justify-center">
      {kooker.avatar ? (
        <img src={kooker.avatar} alt={kooker.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[#c1a0fd]/30 flex items-center justify-center">
          <span className="text-[#c1a0fd] font-bold text-[20px]">
            {kooker.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      )}
      {/* Remove favorite button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(kooker.id);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 14.5C8 14.5 1.5 10.5 1.5 5.75C1.5 4.69928 1.91726 3.69169 2.65931 2.94931C3.40137 2.20693 4.40896 1.78967 5.45968 1.78967C6.83968 1.78967 8 2.58967 8 2.58967C8 2.58967 9.16032 1.78967 10.5403 1.78967C11.591 1.78967 12.5986 2.20693 13.3407 2.94931C14.0827 3.69169 14.5 4.69928 14.5 5.75C14.5 10.5 8 14.5 8 14.5Z"/>
        </svg>
      </button>
    </div>

    <div className="p-4">
      <h4 className="text-[15px] font-semibold text-[#111125] mb-1 group-hover:text-[#c1a0fd] transition-colors">{kooker.name}</h4>
      <p className="text-[13px] text-[#111125]/60 mb-2">{kooker.specialty}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="#facc15" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1L8.854 4.562L12.854 5.108L9.927 7.868L10.708 11.782L7 9.862L3.292 11.782L4.073 7.868L1.146 5.108L5.146 4.562L7 1Z"/>
          </svg>
          <span className="text-[13px] font-semibold text-[#111125]">{kooker.rating}</span>
          <span className="text-[12px] text-[#111125]/40">({kooker.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1 text-[13px] text-[#111125]/50">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6.5C7.38071 6.5 8.5 5.38071 8.5 4C8.5 2.61929 7.38071 1.5 6 1.5C4.61929 1.5 3.5 2.61929 3.5 4C3.5 5.38071 4.61929 6.5 6 6.5Z" stroke="currentColor" strokeWidth="1"/>
            <path d="M6 6.5C3.5 6.5 1 8 1 10.5H11C11 8 8.5 6.5 6 6.5Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          {kooker.city}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#e0e2ef]">
        <p className="text-[13px] text-[#111125]/50">
          A partir de <span className="font-semibold text-[#111125]">{formatPrice(kooker.priceFrom)}</span>
        </p>
      </div>
    </div>
  </Link>
);

// ────────────────────────── Data Mapping Helpers ──────────────────────────

const mapApiBookingToBooking = (b: ApiBooking): Booking => ({
  id: b.id,
  serviceName: b.service.title,
  kookerName: `${b.kookerProfile.user.firstName} ${b.kookerProfile.user.lastName}`,
  kookerAvatar: b.kookerProfile.user.avatar || '',
  date: b.date,
  time: b.startTime,
  guests: b.guests,
  status: b.status,
  totalPrice: b.totalPriceInCents,
});

const mapApiFavoriteToKooker = (f: ApiFavorite): FavoriteKooker => {
  let specialties: string[] = [];
  try {
    specialties = JSON.parse(f.kookerProfile.specialties);
  } catch {
    specialties = [];
  }
  const minPrice = f.kookerProfile.services.length > 0
    ? Math.min(...f.kookerProfile.services.map(s => s.priceInCents))
    : 0;
  return {
    id: f.kookerProfile.id,
    name: `${f.kookerProfile.user.firstName} ${f.kookerProfile.user.lastName}`,
    avatar: f.kookerProfile.user.avatar || '',
    specialty: specialties[0] || '',
    city: f.kookerProfile.city,
    rating: f.kookerProfile.rating,
    reviewCount: f.kookerProfile.reviewCount,
    priceFrom: minPrice,
  };
};

// ────────────────────────── Main Page ──────────────────────────

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'favorites'>('upcoming');
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<FavoriteKooker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Mon Espace - Weekook';

    const fetchData = async () => {
      try {
        const [bookingsRes, favoritesRes] = await Promise.all([
          api.get<ApiBooking[]>('/bookings/my'),
          api.get<ApiFavorite[]>('/favorites'),
        ]);

        if (bookingsRes.success && bookingsRes.data) {
          const today = new Date().toISOString().split('T')[0];
          const mapped = bookingsRes.data.map(mapApiBookingToBooking);

          const upcoming = mapped.filter(
            b => (b.status === 'pending' || b.status === 'confirmed') && b.date >= today
          );
          const past = mapped.filter(
            b => b.status === 'completed' || b.status === 'cancelled' || b.date < today
          );

          setUpcomingBookings(upcoming);
          setHistoryBookings(past);
        }

        if (favoritesRes.success && favoritesRes.data) {
          setFavorites(favoritesRes.data.map(mapApiFavoriteToKooker));
        }
      } catch {
        // Silently fail — empty states will show
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const handleRemoveFavorite = async (id: number) => {
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch {
      // Silently fail
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.upload<{ url: string }>('/upload', formData);
      if (uploadRes.success && uploadRes.data) {
        await api.put('/users/avatar', { avatar: uploadRes.data.url });
        await refreshUser();
        toast.success('Avatar mis à jour');
      }
    } catch {
      toast.error('Erreur lors de la mise à jour de l\'avatar');
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelBooking = async (id: number) => {
    try {
      await api.put('/bookings/' + id + '/cancel');
      setUpcomingBookings(prev => prev.filter(b => b.id !== id));
      setHistoryBookings(prev => [
        ...prev,
        { ...upcomingBookings.find(b => b.id === id)!, status: 'cancelled' as const },
      ]);
      toast.success('Réservation annulée');
    } catch {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const tabs = [
    { key: 'upcoming' as const, label: 'A venir', shortLabel: 'A venir', count: upcomingBookings.length },
    { key: 'history' as const, label: 'Historique', shortLabel: 'Historique', count: historyBookings.length },
    { key: 'favorites' as const, label: 'Mes Favoris', shortLabel: 'Favoris', count: favorites.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f4fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-[#c1a0fd]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-[14px] text-[#111125]/50">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4fc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e0e2ef]">
        <div className="px-4 md:px-8 lg:px-[96px] py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] md:text-[28px] font-bold text-[#111125]">Mon Espace</h1>
              <p className="text-[14px] text-[#111125]/50 mt-1">Gérez vos réservations et vos favoris</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {user?.kookerProfileId && (
                <button
                  onClick={() => navigate('/kooker-dashboard')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#c1a0fd]/10 text-[#c1a0fd] hover:bg-[#c1a0fd]/20 rounded-[12px] text-[13px] font-semibold transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 14L10 8L6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Espace Kooker
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-[#111125]/50 hover:text-red-600 hover:bg-red-50 rounded-[12px] text-[13px] font-medium transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.6667 11.3333L14 7.99996L10.6667 4.66663" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-[96px] py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Card */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-white rounded-[20px] border border-[#e0e2ef] p-6 sticky top-8">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#c1a0fd] to-[#9171d9] flex items-center justify-center mb-4 relative group">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-[24px] md:text-[28px]">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-[#e0e2ef] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="#111125" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <h3 className="text-[18px] font-bold text-[#111125]">{user?.firstName} {user?.lastName}</h3>
                <p className="text-[13px] text-[#111125]/50 mt-1">{user?.email}</p>
              </div>

              {/* Info */}
              <div className="space-y-4 border-t border-[#e0e2ef] pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#c1a0fd]/10 rounded-[10px] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H13C13.55 3 14 3.45 14 4V12C14 12.55 13.55 13 13 13H3C2.45 13 2 12.55 2 12V4C2 3.45 2.45 3 3 3Z" stroke="#c1a0fd" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 4L8 8.5L2 4" stroke="#c1a0fd" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#111125]/40 uppercase tracking-wider font-medium">Email</p>
                    <p className="text-[13px] text-[#111125] truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#c1a0fd]/10 rounded-[10px] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.6667 11.28V13.28C14.6667 13.7 14.3333 14.0533 13.92 14.08C13.5867 14.1 13.32 14.1067 13.12 14.1067C7.04 14.1067 2.10667 9.17333 2.10667 3.09333C2.10667 2.89333 2.11333 2.62667 2.13333 2.29333C2.16 1.88 2.51333 1.54667 2.93333 1.54667H4.93333C5.10667 1.54667 5.26 1.66 5.30667 1.82667C5.44 2.34 5.62667 3.04 5.88 3.57333C5.94667 3.71333 5.90667 3.88 5.79333 3.98L4.72 5.05333C5.60667 6.99333 7.22 8.60667 9.16 9.49333L10.2333 8.42C10.3333 8.30667 10.5 8.26667 10.64 8.33333C11.1733 8.58667 11.8733 8.77333 12.3867 8.90667C12.5533 8.95333 12.6667 9.10667 12.6667 9.28V11.28H14.6667Z" stroke="#c1a0fd" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#111125]/40 uppercase tracking-wider font-medium">Téléphone</p>
                    <p className="text-[13px] text-[#111125]">{user?.phone || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#c1a0fd]/10 rounded-[10px] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2.66663" width="12" height="12" rx="1.5" stroke="#c1a0fd" strokeWidth="1.2"/>
                      <path d="M2 6.66663H14" stroke="#c1a0fd" strokeWidth="1.2"/>
                      <path d="M5.33333 1.33337V4.00004" stroke="#c1a0fd" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M10.6667 1.33337V4.00004" stroke="#c1a0fd" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#111125]/40 uppercase tracking-wider font-medium">Membre depuis</p>
                    <p className="text-[13px] text-[#111125]">Janvier 2026</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 border-t border-[#e0e2ef] pt-6 mt-6">
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[#c1a0fd]">{upcomingBookings.length + historyBookings.length}</p>
                  <p className="text-[11px] text-[#111125]/40 mt-0.5">Réservations</p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[#c1a0fd]">{favorites.length}</p>
                  <p className="text-[11px] text-[#111125]/40 mt-0.5">Favoris</p>
                </div>
                <div className="text-center">
                  <p className="text-[20px] font-bold text-[#c1a0fd]">{historyBookings.filter(b => b.status === 'completed').length}</p>
                  <p className="text-[11px] text-[#111125]/40 mt-0.5">Avis</p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-[#e0e2ef] pt-6 mt-6 space-y-3">
                <button
                  onClick={() => navigate('/recherche')}
                  className="w-full flex items-center justify-center gap-2 h-[44px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-semibold text-[13px] rounded-[12px] transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M14 14L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Trouver un Kooker
                </button>
                {!user?.kookerProfileId && (
                  <button
                    onClick={() => navigate('/devenir-kooker')}
                    className="w-full flex items-center justify-center gap-2 h-[44px] bg-white border border-[#c1a0fd] text-[#c1a0fd] hover:bg-[#c1a0fd]/5 font-semibold text-[13px] rounded-[12px] transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 3.33337V12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Devenir Kooker
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex bg-white rounded-[16px] border border-[#e0e2ef] p-1.5 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] md:text-[14px] font-semibold rounded-[12px] transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-[#c1a0fd] text-white shadow-sm'
                      : 'text-[#111125]/50 hover:text-[#111125]/70'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e8eaf5] text-[#111125]/40'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Upcoming Bookings Tab */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[16px] font-bold text-[#111125]">Réservations à venir</h3>
                  <span className="text-[13px] text-[#111125]/40">{upcomingBookings.length} réservation{upcomingBookings.length > 1 ? 's' : ''}</span>
                </div>
                {upcomingBookings.length === 0 ? (
                  <div className="bg-white rounded-[20px] border border-[#e0e2ef] p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-[#c1a0fd]/10 rounded-full flex items-center justify-center mb-4">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3.5" y="4.66663" width="21" height="21" rx="3" stroke="#c1a0fd" strokeWidth="1.5"/>
                        <path d="M3.5 11.6666H24.5" stroke="#c1a0fd" strokeWidth="1.5"/>
                        <path d="M9.33333 2.33337V7.00004" stroke="#c1a0fd" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M18.6667 2.33337V7.00004" stroke="#c1a0fd" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h4 className="text-[16px] font-semibold text-[#111125] mb-2">Aucune réservation à venir</h4>
                    <p className="text-[13px] text-[#111125]/50 mb-6">Explorez nos kookers et réservez votre prochain repas fait maison.</p>
                    <button
                      onClick={() => navigate('/recherche')}
                      className="px-6 py-2.5 bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[13px] font-semibold rounded-[12px] transition-all"
                    >
                      Trouver un Kooker
                    </button>
                  </div>
                ) : (
                  upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} showActions onCancel={handleCancelBooking} />
                  ))
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[16px] font-bold text-[#111125]">Historique des réservations</h3>
                  <span className="text-[13px] text-[#111125]/40">{historyBookings.length} réservation{historyBookings.length > 1 ? 's' : ''}</span>
                </div>
                {historyBookings.length === 0 ? (
                  <div className="bg-white rounded-[20px] border border-[#e0e2ef] p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-[#c1a0fd]/10 rounded-full flex items-center justify-center mb-4">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="14" cy="14" r="10.5" stroke="#c1a0fd" strokeWidth="1.5"/>
                        <path d="M14 8.16663V14L17.5 17.5" stroke="#c1a0fd" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h4 className="text-[16px] font-semibold text-[#111125] mb-2">Aucun historique</h4>
                    <p className="text-[13px] text-[#111125]/50">Vos réservations passées apparaîtront ici.</p>
                  </div>
                ) : (
                  historyBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold text-[#111125]">Mes Kookers favoris</h3>
                  <span className="text-[13px] text-[#111125]/40">{favorites.length} favori{favorites.length > 1 ? 's' : ''}</span>
                </div>
                {favorites.length === 0 ? (
                  <div className="bg-white rounded-[20px] border border-[#e0e2ef] p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-[#c1a0fd]/10 rounded-full flex items-center justify-center mb-4">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 25.6667C14 25.6667 2.33333 18.6667 2.33333 10.0833C2.33333 8.24854 3.06786 6.48879 4.36185 5.19479C5.65585 3.9008 7.41559 3.16626 9.25033 3.16626C11.6733 3.16626 14 4.57293 14 4.57293C14 4.57293 16.3267 3.16626 18.7497 3.16626C20.5844 3.16626 22.3442 3.9008 23.6382 5.19479C24.9321 6.48879 25.6667 8.24854 25.6667 10.0833C25.6667 18.6667 14 25.6667 14 25.6667Z" stroke="#c1a0fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h4 className="text-[16px] font-semibold text-[#111125] mb-2">Aucun favori</h4>
                    <p className="text-[13px] text-[#111125]/50 mb-6">Ajoutez des kookers à vos favoris pour les retrouver facilement.</p>
                    <button
                      onClick={() => navigate('/recherche')}
                      className="px-6 py-2.5 bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[13px] font-semibold rounded-[12px] transition-all"
                    >
                      Découvrir les Kookers
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {favorites.map(kooker => (
                      <FavoriteKookerCard key={kooker.id} kooker={kooker} onRemove={handleRemoveFavorite} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
