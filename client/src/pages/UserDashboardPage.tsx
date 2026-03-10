import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import KookerDashboardPage from './KookerDashboardPage';

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
    confirmed: { label: 'confirmé', bg: 'bg-[#e8f5e9]', text: 'text-green-600' },
    pending: { label: 'en attente', bg: 'bg-[#fff3e0]', text: 'text-orange-600' },
    cancelled: { label: 'annulé', bg: 'bg-red-50', text: 'text-red-600' },
    completed: { label: 'terminé', bg: 'bg-[#f5f5f5]', text: 'text-[#828294]' },
  };
  const s = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[14px] font-medium ${s.bg} ${s.text}`}>
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
  <div className="bg-white rounded-[20px] p-6 shadow-sm">
    {/* Top row: service name + kooker + status badge */}
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
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
          <h4 className="text-[20px] font-semibold text-[#111125] truncate mb-0.5">{booking.serviceName}</h4>
          <p className="text-[16px] text-[#5c5c6f]">par {booking.kookerName}</p>
        </div>
      </div>
      <StatusBadge status={booking.status} />
    </div>

    {/* Info grid: date / time / guests */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="flex items-center gap-2 text-[14px] text-[#5c5c6f]">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
          <rect x="1.75" y="2.33337" width="10.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
          <path d="M1.75 5.83337H12.25" stroke="currentColor" strokeWidth="1.1"/>
          <path d="M4.66667 1.16663V3.49996" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          <path d="M9.33333 1.16663V3.49996" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
        <span className="truncate">{formatDate(booking.date)}</span>
      </div>
      <div className="flex items-center gap-2 text-[14px] text-[#5c5c6f]">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
          <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.1"/>
          <path d="M7 4.08337V7.00004L8.75 8.75004" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
        <span>{booking.time}</span>
      </div>
      <div className="flex items-center gap-2 text-[14px] text-[#5c5c6f]">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
          <path d="M9.91667 12.25V11.0833C9.91667 10.4645 9.67083 9.871 9.23325 9.43342C8.79567 8.99583 8.20217 8.75 7.58333 8.75H3.5C2.88116 8.75 2.28767 8.99583 1.85008 9.43342C1.4125 9.871 1.16667 10.4645 1.16667 11.0833V12.25" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          <circle cx="5.54167" cy="4.08333" r="2.33333" stroke="currentColor" strokeWidth="1.1"/>
          <path d="M12.8333 12.25V11.0833C12.8333 10.0833 12.1667 9.25 11.375 8.91667" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          <path d="M9.625 1.91663C10.4167 2.24996 11.0833 3.08329 11.0833 4.08329C11.0833 5.08329 10.4167 5.91663 9.625 6.24996" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
        <span>{booking.guests} convive{booking.guests > 1 ? 's' : ''}</span>
      </div>
    </div>

    {/* Bottom separator: price left, actions right */}
    <div className="border-t border-[#e0e2ef] pt-4 flex flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#111125" strokeWidth="1.2"/>
          <path d="M1.5 6.5H14.5" stroke="#111125" strokeWidth="1.2"/>
        </svg>
        <p className="text-[18px] font-bold text-[#111125]">{formatPrice(booking.totalPrice)}</p>
      </div>
      <div className="flex gap-2">
        {showActions && booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <>
            <button className="px-4 py-2 bg-[#c1a0fd] hover:bg-[#b090ed] text-[#111125] text-[14px] font-medium rounded-[8px] transition-all">
              Voir les détails
            </button>
            <button
              onClick={() => onCancel?.(booking.id)}
              className="px-4 py-2 border border-[#c1a0fd] text-[#c1a0fd] text-[14px] font-medium rounded-[8px] hover:bg-[#f3ecff] transition-all"
            >
              Annuler
            </button>
          </>
        )}
        {booking.status === 'completed' && (
          <button className="px-4 py-2 bg-[#c1a0fd] hover:bg-[#b090ed] text-[#111125] text-[14px] font-medium rounded-[8px] transition-all">
            Laisser un avis
          </button>
        )}
      </div>
    </div>
  </div>
);

// ────────────────────────── Favorite Card ──────────────────────────

const FavoriteKookerCard = ({ kooker, onRemove }: { kooker: FavoriteKooker; onRemove: (id: number) => void }) => (
  <Link to={`/kooker/${kooker.id}`} className="bg-white rounded-[20px] p-6 shadow-sm block hover:shadow-md transition-shadow">
    {/* Top row: avatar + heart */}
    <div className="flex items-start justify-between mb-4">
      <div className="bg-[#ece2fe] w-[60px] h-[60px] rounded-full flex items-center justify-center">
        {kooker.avatar ? (
          <img src={kooker.avatar} alt={kooker.name} className="w-[60px] h-[60px] rounded-full object-cover" />
        ) : (
          <span className="text-[#303044] font-bold text-[24px]">
            {kooker.name.split(' ').map(n => n[0]).join('')}
          </span>
        )}
      </div>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(kooker.id); }}
        className="text-[#c1a0fd] hover:text-red-500 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
        </svg>
      </button>
    </div>
    {/* Name */}
    <h3 className="text-[18px] font-semibold text-[#111125] mb-2">{kooker.name}</h3>
    {/* Specialty */}
    <p className="text-[14px] text-[#5c5c6f] mb-1">Spécialité : {kooker.specialty}</p>
    {/* City */}
    <p className="text-[14px] text-[#828294] flex items-center gap-1 mb-4">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6.5C7.38071 6.5 8.5 5.38071 8.5 4C8.5 2.61929 7.38071 1.5 6 1.5C4.61929 1.5 3.5 2.61929 3.5 4C3.5 5.38071 4.61929 6.5 6 6.5Z" stroke="currentColor" strokeWidth="1"/>
        <path d="M6 6.5C3.5 6.5 1 8 1 10.5H11C11 8 8.5 6.5 6 6.5Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
      {kooker.city}
    </p>
    {/* CTA Button */}
    <button className="w-full h-[44px] bg-[#c1a0fd] hover:bg-[#b090ed] text-[#111125] text-[14px] font-semibold rounded-[12px] transition-all">
      Voir le profil
    </button>
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
  const { user, logout, refreshUser } = useAuth(); // refreshUser used for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'favorites' | 'kooker'>('upcoming');
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
    { key: 'upcoming' as const, label: 'Réservations à venir', shortLabel: 'A venir', count: upcomingBookings.length },
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-[96px] py-8 md:py-12">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-[32px] md:text-[40px] font-semibold text-[#111125] tracking-[-0.8px] mb-2">
            Mon tableau de bord
          </h1>
          <p className="text-[16px] text-[#5c5c6f]">
            Gérez vos réservations et vos préférences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[20px] p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-[80px] h-[80px] rounded-full bg-[#ece2fe] flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[#c1a0fd] font-bold text-[28px]">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  )}
                </div>
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
              <div>
                <h2 className="text-[24px] font-semibold text-[#111125] mb-1">{user?.firstName} {user?.lastName}</h2>
                <p className="text-[16px] text-[#828294]">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {/* Modifier le profil */}
              <button
                onClick={() => navigate('/mon-profil')}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#c1a0fd] text-[#c1a0fd] hover:bg-[#c1a0fd]/5 rounded-[12px] h-[44px] text-[14px] font-medium transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Modifier le profil
              </button>

              {/* Devenir Kooker (non-kookers only) */}
              {!user?.kookerProfileId && (
                <button
                  onClick={() => navigate('/devenir-kooker')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#c1a0fd] hover:bg-[#b090ed] text-white rounded-[12px] h-[44px] text-[14px] font-medium transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                    <line x1="6" y1="17" x2="18" y2="17"/>
                    <line x1="6" y1="21" x2="18" y2="21"/>
                  </svg>
                  Devenir Kooker
                </button>
              )}

              {/* Se déconnecter */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 border border-red-400 text-red-500 hover:bg-red-50 rounded-[12px] h-[44px] text-[14px] font-medium transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-white rounded-[12px] p-2 mb-6 h-[72px] gap-2">
          <div className="grid grid-cols-3 flex-1 h-full">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-[8px] text-[16px] md:text-[18px] font-normal transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-[#c1a0fd] font-bold text-white shadow-sm'
                    : 'text-[#111125]/60 hover:text-[#111125]'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
          {user?.kookerProfileId && (
            <>
              <div className="w-px h-10 bg-[#e0e2ef] flex-shrink-0" />
              <button
                onClick={() => setActiveTab('kooker')}
                className={`h-full px-3 md:px-5 rounded-[8px] flex items-center gap-2 text-[13px] md:text-[15px] font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'kooker'
                    ? 'bg-[#c1a0fd] text-white shadow-sm font-bold'
                    : 'text-[#c1a0fd] hover:bg-[#f3ecff]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                  <line x1="6" y1="17" x2="18" y2="17"/>
                  <line x1="6" y1="21" x2="18" y2="21"/>
                </svg>
                <span className="hidden sm:inline">Espace Kooker</span>
                <span className="sm:hidden">Kooker</span>
              </button>
            </>
          )}
        </div>

        {/* Upcoming Bookings Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[20px] font-semibold text-[#111125]">Réservations à venir</h3>
              <span className="text-[13px] text-[#111125]/40">{upcomingBookings.length} réservation{upcomingBookings.length > 1 ? 's' : ''}</span>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-[20px] shadow-sm p-12 text-center">
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
                  className="px-6 py-2.5 bg-[#c1a0fd] hover:bg-[#b090ed] text-[#111125] text-[13px] font-semibold rounded-[8px] transition-all"
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
              <h3 className="text-[20px] font-semibold text-[#111125]">Historique des réservations</h3>
              <span className="text-[13px] text-[#111125]/40">{historyBookings.length} réservation{historyBookings.length > 1 ? 's' : ''}</span>
            </div>
            {historyBookings.length === 0 ? (
              <div className="bg-white rounded-[20px] shadow-sm p-12 text-center">
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
              <h3 className="text-[20px] font-semibold text-[#111125]">Mes Kookers favoris</h3>
              <span className="text-[13px] text-[#111125]/40">{favorites.length} favori{favorites.length > 1 ? 's' : ''}</span>
            </div>
            {favorites.length === 0 ? (
              <div className="bg-white rounded-[20px] shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-[#c1a0fd]/10 rounded-full flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 25.6667C14 25.6667 2.33333 18.6667 2.33333 10.0833C2.33333 8.24854 3.06786 6.48879 4.36185 5.19479C5.65585 3.9008 7.41559 3.16626 9.25033 3.16626C11.6733 3.16626 14 4.57293 14 4.57293C14 4.57293 16.3267 3.16626 18.7497 3.16626C20.5844 3.16626 22.3442 3.9008 23.6382 5.19479C24.9321 6.48879 25.6667 8.24854 25.6667 10.0833C25.6667 18.6667 14 25.6667 14 25.6667Z" stroke="#c1a0fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 className="text-[16px] font-semibold text-[#111125] mb-2">Aucun favori</h4>
                <p className="text-[13px] text-[#111125]/50 mb-6">Ajoutez des kookers à vos favoris pour les retrouver facilement.</p>
                <button
                  onClick={() => navigate('/recherche')}
                  className="px-6 py-2.5 bg-[#c1a0fd] hover:bg-[#b090ed] text-[#111125] text-[13px] font-semibold rounded-[8px] transition-all"
                >
                  Découvrir les Kookers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(kooker => (
                  <FavoriteKookerCard key={kooker.id} kooker={kooker} onRemove={handleRemoveFavorite} />
                ))}
              </div>
            )}
          </div>
        )}
        {/* Kooker Tab */}
        {activeTab === 'kooker' && (
          <KookerDashboardPage embedded={true} />
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
