import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface ServiceImage {
  id: number;
  url: string;
  alt: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;       // in euros (converted from centimes)
  duration: number;    // in minutes
  type: string;
  specialties: string[];
  maxGuests: number;
  images: ServiceImage[];
  isActive: boolean;
}

interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface Availability {
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
}

interface KookerProfile {
  id: number;
  name: string;
  avatarUrl: string;
  coverUrl: string;
  city: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  services: Service[];
  reviews: Review[];
  availabilities: Availability[];
}

// ─── Helper: Parse JSON string safely ───────────────────────────────────────────
function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as unknown as T;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// ─── Helper: Map API response to KookerProfile ─────────────────────────────────
function mapApiToProfile(data: any): KookerProfile {
  return {
    id: data.id,
    name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || 'Kooker',
    avatarUrl: data.user?.avatar || '',
    coverUrl: '',
    city: data.city || '',
    bio: data.bio || '',
    specialties: safeJsonParse<string[]>(data.specialties, []),
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    yearsExperience: data.experience ? parseInt(data.experience, 10) || 0 : 0,
    services: (data.services || [])
      .filter((s: any) => s.active)
      .map((s: any) => ({
        id: s.id,
        title: s.title || '',
        description: s.description || '',
        price: (s.priceInCents || 0) / 100,
        duration: s.durationMinutes || 0,
        type: safeJsonParse<string[]>(s.type, []).join(', '),
        specialties: safeJsonParse<string[]>(s.specialties, []),
        maxGuests: s.maxGuests || 0,
        images: (s.images || []).map((img: any) => ({
          id: img.id,
          url: img.url || '',
          alt: img.alt || '',
        })),
        isActive: s.active,
      })),
    reviews: (data.reviews || []).map((r: any) => ({
      id: r.id,
      userName: `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() || 'Anonyme',
      userAvatar: r.user?.avatar || '',
      rating: r.rating || 0,
      comment: r.comment || '',
      date: r.createdAt || '',
    })),
    availabilities: (data.availabilities || [])
      .filter((a: any) => a.isAvailable)
      .map((a: any) => ({
        date: a.date,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
  };
}

// ─── Helper: Star Rating ────────────────────────────────────────────────────────
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
        return (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
          >
            <defs>
              <linearGradient id={`star-grad-${star}-${rating}`}>
                <stop offset={`${fill * 100}%`} stopColor="#facc15" />
                <stop offset={`${fill * 100}%`} stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#star-grad-${star}-${rating})`}
            />
          </svg>
        );
      })}
    </div>
  );
}

// ─── Helper: Format Duration ────────────────────────────────────────────────────
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

// ─── Helper: Format Date ────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Helper: Calendar ───────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-start: Mon=0, Tue=1, ... Sun=6
  return day === 0 ? 6 : day - 1;
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// ─── Component ──────────────────────────────────────────────────────────────────
export default function KookerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<KookerProfile | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Accordion state for services
  const [openServiceId, setOpenServiceId] = useState<number | null>(null);

  // Image viewer dialog
  const [viewerImages, setViewerImages] = useState<ServiceImage[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Calendar state
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());

  // Tooltip state for availability
  const [tooltipDate, setTooltipDate] = useState<string | null>(null);

  // Not found state
  const [notFound, setNotFound] = useState(false);

  // Load profile from API
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);
    api
      .get<any>(`/kookers/${id}`)
      .then((res) => {
        if (res.success && res.data) {
          const mapped = mapApiToProfile(res.data);
          setProfile(mapped);
          // Auto-open first service
          if (mapped.services.length > 0) {
            setOpenServiceId(mapped.services[0].id);
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Check if kooker is in favorites (only if logged in)
    if (user) {
      api
        .get<{ id: number; kookerProfile: { id: number } }[]>('/favorites')
        .then((res) => {
          if (res.success && res.data) {
            const found = res.data.some(
              (f) => f.kookerProfile.id === Number(id)
            );
            setIsFavorite(found);
          }
        })
        .catch(() => {
          // Silently fail
        });
    }
  }, [id, user]);

  // Available dates set for calendar
  const availableDatesMap = useMemo(() => {
    if (!profile) return new Map<string, Availability[]>();
    const map = new Map<string, Availability[]>();
    for (const av of profile.availabilities) {
      const existing = map.get(av.date) || [];
      existing.push(av);
      map.set(av.date, existing);
    }
    return map;
  }, [profile]);

  // Calendar navigation
  const goToPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Image viewer controls
  const openImageViewer = (images: ServiceImage[], index: number) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeImageViewer = () => {
    setViewerOpen(false);
    setViewerImages([]);
    setViewerIndex(0);
  };

  const viewerPrev = () => {
    setViewerIndex((prev) =>
      prev === 0 ? viewerImages.length - 1 : prev - 1
    );
  };

  const viewerNext = () => {
    setViewerIndex((prev) =>
      prev === viewerImages.length - 1 ? 0 : prev + 1
    );
  };

  // ─── Toggle Favorite ──────────────────────────────────────────────────────
  const handleToggleFavorite = async () => {
    if (!profile) return;
    if (!user) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }
    try {
      if (isFavorite) {
        await api.delete('/favorites/' + profile.id);
        setIsFavorite(false);
        toast.success('Retiré des favoris');
      } else {
        await api.post('/favorites/' + profile.id);
        setIsFavorite(true);
        toast.success('Ajouté aux favoris');
      }
    } catch {
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  };

  // ─── Not Found State ────────────────────────────────────────────────────────
  if (!isLoading && notFound) {
    return (
      <div className="min-h-screen bg-[#f2f4fc] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-[48px] font-bold text-[#c1a0fd]">404</h1>
          <p className="mt-2 text-[18px] font-semibold text-[#111125]">
            Kooker introuvable
          </p>
          <p className="mt-1 text-[15px] text-[#6b7280]">
            Ce profil n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => navigate('/recherche')}
            className="mt-6 px-6 py-2.5 bg-[#c1a0fd] text-white font-semibold rounded-[12px] hover:bg-[#b090ed] transition-all"
          >
            Rechercher un kooker
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#f2f4fc]">
        {/* Cover Skeleton */}
        <div className="w-full h-[200px] md:h-[280px] bg-[#e5e7eb] animate-pulse" />
        <div className="px-4 md:px-8 lg:px-[96px] -mt-16 md:-mt-20">
          {/* Avatar Skeleton */}
          <div className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full bg-[#d1d5db] border-4 border-white animate-pulse" />
          <div className="mt-4 space-y-3">
            <div className="h-8 w-48 bg-[#e5e7eb] rounded animate-pulse" />
            <div className="h-4 w-32 bg-[#e5e7eb] rounded animate-pulse" />
            <div className="h-4 w-64 bg-[#e5e7eb] rounded animate-pulse" />
            <div className="h-20 w-full max-w-[600px] bg-[#e5e7eb] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Calendar Rendering ─────────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  // Pad to complete last row
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f2f4fc]">
      {/* ============================================================= */}
      {/* COVER IMAGE                                                    */}
      {/* ============================================================= */}
      <div className="relative w-full h-[200px] md:h-[280px] overflow-hidden">
        {profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt={`Couverture de ${profile.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#c1a0fd] to-[#8b6fce]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-8 lg:left-[96px] flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-[12px] text-[14px] font-medium text-[#111125] hover:bg-white transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>

      {/* ============================================================= */}
      {/* PROFILE HEADER                                                 */}
      {/* ============================================================= */}
      <div className="px-4 md:px-8 lg:px-[96px] -mt-16 md:-mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:gap-6">
          {/* Avatar */}
          <div className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full border-4 border-white overflow-hidden bg-[#e0e0e0] flex-shrink-0 shadow-lg">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#c1a0fd] to-[#8b6fce] flex items-center justify-center text-white font-bold text-[36px] md:text-[48px]">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + Info */}
          <div className="mt-3 md:mt-0 md:pb-1 flex-1">
            <h1 className="text-[24px] md:text-[32px] font-bold text-[#111125]">
              {profile.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {/* City */}
              <span className="flex items-center gap-1 text-[14px] text-[#6b7280]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.city}
              </span>
              {/* Rating */}
              <span className="flex items-center gap-1.5">
                <StarRating rating={profile.rating} size={16} />
                <span className="text-[14px] font-semibold text-[#111125]">
                  {profile.rating.toFixed(1)}
                </span>
                <span className="text-[13px] text-[#6b7280]">
                  ({profile.reviewCount} avis)
                </span>
              </span>
              {/* Experience */}
              {profile.yearsExperience > 0 && (
                <span className="text-[13px] text-[#6b7280]">
                  {profile.yearsExperience} ans d'expérience
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 md:mt-0 md:pb-1">
            <button
              onClick={() => navigate(`/messages?kooker=${profile.id}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e5e7eb] rounded-[12px] text-[14px] font-medium text-[#111125] hover:border-[#c1a0fd] hover:text-[#c1a0fd] transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contacter
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[14px] font-semibold transition-all shadow-sm ${
                isFavorite
                  ? 'bg-[#c1a0fd]/10 border border-[#c1a0fd] text-[#c1a0fd] hover:bg-[#c1a0fd]/20'
                  : 'bg-[#c1a0fd] text-white hover:bg-[#b090ed]'
              }`}
            >
              <svg className="w-4 h-4" fill={isFavorite ? '#c1a0fd' : 'none'} stroke={isFavorite ? '#c1a0fd' : 'currentColor'} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isFavorite ? 'Favori' : 'Favoris'}
            </button>
          </div>
        </div>

        {/* Specialty Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {profile.specialties.map((spec, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-[#ede7fb] text-[#7c5cbf]"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="mt-4 text-[15px] text-[#4b5563] leading-relaxed max-w-[800px]">
          {profile.bio}
        </p>
      </div>

      {/* ============================================================= */}
      {/* SERVICES ACCORDION                                             */}
      {/* ============================================================= */}
      <section className="px-4 md:px-8 lg:px-[96px] mt-10 md:mt-14">
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#111125] mb-6">
          Offres & Services
        </h2>

        {profile.services.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[15px] text-[#6b7280]">
              Ce kooker n'a pas encore publié de service.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.services.map((service) => {
              const isOpen = openServiceId === service.id;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#e5e7eb]/50"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() =>
                      setOpenServiceId(isOpen ? null : service.id)
                    }
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-[#fafbfe] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-[16px] md:text-[18px] font-semibold text-[#111125]">
                          {service.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                            service.type.includes('KOOK')
                              ? 'bg-[#dbeafe] text-[#2563eb]'
                              : 'bg-[#fef3c7] text-[#d97706]'
                          }`}
                        >
                          {service.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-[13px] text-[#6b7280]">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.price}€ /pers.
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDuration(service.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {service.maxGuests} pers. max
                        </span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-[#6b7280] transition-transform duration-300 flex-shrink-0 ml-4 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="px-5 pb-5 md:px-6 md:pb-6 border-t border-[#f0f0f0]">
                      <div className="pt-5 md:pt-6">
                        {/* Description */}
                        <p className="text-[14px] text-[#4b5563] leading-relaxed mb-5">
                          {service.description}
                        </p>

                        {/* Specialty Tags */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {service.specialties.map((spec, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f3f4f6] text-[#6b7280]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>

                        {/* Image Gallery */}
                        {service.images.length > 0 && (
                          <div className="mb-5">
                            <h4 className="text-[14px] font-semibold text-[#111125] mb-3">
                              Galerie
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {service.images.map((img, imgIndex) => (
                                <button
                                  key={img.id}
                                  onClick={() =>
                                    openImageViewer(service.images, imgIndex)
                                  }
                                  className="relative aspect-[4/3] rounded-[12px] overflow-hidden group/img"
                                >
                                  <img
                                    src={img.url}
                                    alt={img.alt}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                                    <svg
                                      className="w-8 h-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Book CTA */}
                        <button
                          onClick={() =>
                            navigate(`/reservation?service=${service.id}&kooker=${profile.id}`)
                          }
                          className="w-full md:w-auto px-8 py-3 bg-[#c1a0fd] text-white font-semibold rounded-[12px] hover:bg-[#b090ed] transition-all shadow-sm text-[15px]"
                        >
                          Réserver - {service.price}€ /pers.
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================= */}
      {/* AVAILABILITY CALENDAR                                          */}
      {/* ============================================================= */}
      <section className="px-4 md:px-8 lg:px-[96px] mt-10 md:mt-14">
        <h2 className="text-[20px] md:text-[24px] font-bold text-[#111125] mb-6">
          Disponibilités
        </h2>

        <div className="bg-white rounded-[20px] shadow-sm border border-[#e5e7eb]/50 p-5 md:p-6 max-w-[500px]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={goToPrevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f3f4f6] transition-colors"
            >
              <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-[16px] font-semibold text-[#111125]">
              {MONTH_NAMES[calendarMonth]} {calendarYear}
            </h3>
            <button
              onClick={goToNextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f3f4f6] transition-colors"
            >
              <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="text-center text-[12px] font-medium text-[#9ca3af] py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-10" />;
              }

              const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const slots = availableDatesMap.get(dateStr);
              const isAvailable = !!slots && slots.length > 0;
              const isPast = dateStr < todayStr;

              return (
                <div
                  key={dateStr}
                  className="relative flex items-center justify-center h-10"
                  onMouseEnter={() => isAvailable ? setTooltipDate(dateStr) : undefined}
                  onMouseLeave={() => setTooltipDate(null)}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] transition-colors ${
                      isAvailable
                        ? 'bg-[#c1a0fd] text-white font-semibold cursor-pointer hover:bg-[#b090ed]'
                        : isToday
                          ? 'bg-[#f3f4f6] text-[#111125] font-semibold ring-2 ring-[#c1a0fd]'
                          : isPast
                            ? 'text-[#d1d5db]'
                            : 'text-[#6b7280]'
                    }`}
                  >
                    {day}
                  </div>

                  {/* Tooltip */}
                  {isAvailable && tooltipDate === dateStr && slots && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-[#111125] text-white rounded-[8px] px-3 py-2 text-[12px] whitespace-nowrap shadow-lg pointer-events-none">
                      {slots.map((s, si) => (
                        <div key={si}>
                          {s.startTime} - {s.endTime}
                        </div>
                      ))}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111125]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#f0f0f0]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#c1a0fd]" />
              <span className="text-[12px] text-[#6b7280]">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#f3f4f6] ring-1 ring-[#d1d5db]" />
              <span className="text-[12px] text-[#6b7280]">Indisponible</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* REVIEWS                                                        */}
      {/* ============================================================= */}
      <section className="px-4 md:px-8 lg:px-[96px] mt-10 md:mt-14 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#111125]">
            Avis ({profile.reviewCount})
          </h2>
          <div className="flex items-center gap-2">
            <StarRating rating={profile.rating} size={18} />
            <span className="text-[16px] font-bold text-[#111125]">
              {profile.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {profile.reviews.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[15px] text-[#6b7280]">
              Aucun avis pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-[20px] p-5 md:p-6 shadow-sm border border-[#e5e7eb]/50"
              >
                <div className="flex items-start gap-3">
                  {/* Reviewer Avatar */}
                  <div className="w-[40px] h-[40px] rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#e2d8fc] to-[#c1a0fd] flex items-center justify-center text-white font-semibold text-[14px]">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-[15px] font-semibold text-[#111125]">
                          {review.userName}
                        </span>
                        <span className="text-[13px] text-[#9ca3af] ml-2">
                          {formatDate(review.date)}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <p className="mt-2 text-[14px] text-[#4b5563] leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================= */}
      {/* IMAGE VIEWER DIALOG                                            */}
      {/* ============================================================= */}
      {viewerOpen && viewerImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeImageViewer}
        >
          <div
            className="relative w-full max-w-[calc(100vw-2rem)] md:max-w-[900px] max-h-[calc(100vh-4rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute -top-12 right-0 md:top-4 md:right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={viewerImages[viewerIndex].url}
              alt={viewerImages[viewerIndex].alt}
              className="w-full h-auto max-h-[calc(100vh-6rem)] object-contain rounded-[12px]"
            />

            {/* Navigation Arrows */}
            {viewerImages.length > 1 && (
              <>
                <button
                  onClick={viewerPrev}
                  className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={viewerNext}
                  className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 rounded-full text-white text-[13px] font-medium">
              {viewerIndex + 1} / {viewerImages.length}
            </div>

            {/* Dot Indicators */}
            {viewerImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {viewerImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setViewerIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === viewerIndex
                        ? 'bg-white scale-110'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
