import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const KOOKER_PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1496952286950-c36951138af4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1729774092918-f1b7c595cce1?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1760445528879-010bd4b7660b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1617307744152-60bf7d1da3f8?w=600&h=400&fit=crop',
];

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
  types: string[];
  specialties: string[];
  allergens: string[];
  maxGuests: number;
  images: ServiceImage[];
  isActive: boolean;
  koursDifficulty?: string | null;
  koursLocation?: string | null;
  equipmentProvided?: boolean;
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

interface ConfirmedSlot {
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:MM
  status: string;    // pending | confirmed | completed
}

interface KookerProfile {
  id: number;
  userId: number;
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
  confirmedSlots: ConfirmedSlot[];
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
    userId: data.user?.id || 0,
    name: `${data.user?.firstName || ''} ${data.user?.lastName || ''}`.trim() || 'Kooker',
    avatarUrl: data.user?.avatar
      ? (data.user.avatar.startsWith('http') ? data.user.avatar : `/uploads/${data.user.avatar}`)
      : KOOKER_PLACEHOLDER_IMAGES[data.id % KOOKER_PLACEHOLDER_IMAGES.length],
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
        types: safeJsonParse<string[]>(s.type, []),
        specialties: safeJsonParse<string[]>(s.specialties, []),
        allergens: safeJsonParse<string[]>(s.allergens, []),
        maxGuests: s.maxGuests || 0,
        images: (s.images || []).map((img: any) => ({
          id: img.id,
          url: img.url || '',
          alt: img.alt || '',
        })),
        isActive: s.active,
        koursDifficulty: s.koursDifficulty || null,
        koursLocation: s.koursLocation || null,
        equipmentProvided: s.equipmentProvided || false,
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
        date: a.date ? String(a.date).slice(0, 10) : a.date,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    confirmedSlots: (data.confirmedSlots || []).map((s: any) => ({
      date: String(s.date).slice(0, 10),
      startTime: String(s.startTime).slice(0, 5), // normalize to HH:MM
      status: s.status || 'pending',
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
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAY_SHORT_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekStartLabel(weekStart: Date): string {
  const d = String(weekStart.getDate()).padStart(2, '0');
  const m = String(weekStart.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

function buildCalendarWeeks(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const dow = firstOfMonth.getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const weekStart = new Date(firstOfMonth);
  weekStart.setDate(firstOfMonth.getDate() - offset);
  const weeks: Date[][] = [];
  const cursor = new Date(weekStart);
  while (cursor <= lastOfMonth) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function getSlotLabel(startTime: string): string {
  const h = parseInt(startTime.slice(0, 2));
  if (h === 8) return 'Matin (8h-12h)';
  if (h === 12) return 'Après-midi (12h-18h)';
  if (h === 14) return 'Après-midi (14h-18h)';
  if (h === 18) return 'Soir (18h-23h)';
  return startTime;
}

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

  // Message modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageSending, setMessageSending] = useState(false);

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

  // Booked slots map (date → Map<startTime, status>)
  const confirmedSlotsMap = useMemo(() => {
    if (!profile) return new Map<string, Map<string, string>>();
    const map = new Map<string, Map<string, string>>();
    for (const s of profile.confirmedSlots) {
      if (!map.has(s.date)) map.set(s.date, new Map());
      map.get(s.date)!.set(s.startTime, s.status);
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
        <div className="px-4 md:px-8 lg:px-[96px] mt-4">
          <div className="h-5 w-40 bg-[#e5e7eb] rounded animate-pulse mb-4" />
          <div className="bg-white rounded-[20px] p-6 flex gap-5 border border-[#e0e0e0]">
            <div className="w-[120px] h-[120px] rounded-[16px] bg-[#e5e7eb] animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-48 bg-[#e5e7eb] rounded animate-pulse" />
              <div className="h-4 w-32 bg-[#e5e7eb] rounded animate-pulse" />
              <div className="h-16 w-full max-w-[500px] bg-[#e5e7eb] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Send message ────────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!messageContent.trim() || !profile) return;
    setMessageSending(true);
    try {
      await api.post('/messages', {
        receiverId: profile.userId,
        content: messageContent.trim(),
        kookerRecipientId: profile.id,
      });
      toast.success(`Message envoyé à ${profile.name}`);
      setMessageContent('');
      setShowMessageModal(false);
    } catch (err: any) {
      toast.error(err?.error || 'Erreur lors de l\'envoi');
    } finally {
      setMessageSending(false);
    }
  };

  // ─── Calendar Rendering ─────────────────────────────────────────────────────
  const calendarWeeks = buildCalendarWeeks(calendarYear, calendarMonth);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f2f4fc]">
      {/* ============================================================= */}
      {/* PROFILE HEADER                                                 */}
      {/* ============================================================= */}
      <div className="px-4 md:px-8 lg:px-[96px]">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[14px] font-medium text-[#c1a0fd] hover:text-[#b090ed] transition-colors mt-4 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux résultats
        </button>

        <div className="bg-white rounded-[20px] p-5 md:p-6 mb-6 border border-[#e0e0e0] shadow-sm">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="w-[110px] h-[110px] md:w-[130px] md:h-[130px] rounded-[16px] bg-[#f3ecff] overflow-hidden flex-shrink-0 self-start">
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-[24px] md:text-[28px] font-semibold text-[#111125] tracking-[-0.5px]">
                      {profile.name}
                    </h1>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#059669] text-[11px] font-semibold border border-[#a7f3d0]">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      PROFIL VÉRIFIÉ
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[14px] text-[#6b7280]">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-[#facc15]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="font-semibold text-[#111125]">{profile.rating.toFixed(1)}</span>
                      <span>({profile.reviewCount} avis)</span>
                    </span>
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile.city}
                      </span>
                    )}
                    {profile.yearsExperience > 0 && (
                      <span>{profile.yearsExperience} ans d'expérience</span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => { if (!user) { navigate('/login'); return; } setShowMessageModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#c1a0fd] text-white rounded-[12px] text-[14px] font-semibold hover:bg-[#b090ed] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contacter
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[14px] font-semibold border transition-all ${
                      isFavorite
                        ? 'bg-[#fdf4ff] border-[#c1a0fd] text-[#c1a0fd]'
                        : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:border-[#c1a0fd] hover:text-[#c1a0fd]'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isFavorite ? 'Favori' : 'Favoris'}
                  </button>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-3 pt-3 border-t border-[#f0f0f0]">
                <p className="text-[14px] text-[#4b5563] leading-relaxed">{profile.bio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2-COLUMN LAYOUT                                                */}
      {/* ============================================================= */}
      <div className="px-4 md:px-8 lg:px-[96px] pb-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ─── Main Column ─── */}
          <div className="flex-1 min-w-0">
            {/* ============================================================= */}
            {/* SERVICES                                                       */}
            {/* ============================================================= */}
            <section className="mb-10">
              <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111125] tracking-[-0.5px] mb-5">
                Services proposés
              </h2>

              {profile.services.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-[16px] border border-[#e0e0e0]">
                  <p className="text-[15px] text-[#6b7280]">Ce kooker n'a pas encore publié de service.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.services.map((service) => {
                    const isOpen = openServiceId === service.id;
                    const firstImage = service.images[0]?.url;
                    return (
                      <div
                        key={service.id}
                        className="bg-white rounded-[20px] overflow-hidden border border-[#e0e0e0] shadow-sm"
                      >
                        {/* ── Card row: image + info ── */}
                        <div className="flex">
                          {/* Image column */}
                          <div className="w-[140px] md:w-[170px] flex-shrink-0 flex flex-col">
                            <div className="relative flex-1 min-h-[145px]">
                              {firstImage ? (
                                <img
                                  src={firstImage}
                                  alt={service.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#f3ecff] to-[#e8d8ff] flex items-center justify-center">
                                  <svg className="w-10 h-10 text-[#c1a0fd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              {/* Type badges */}
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {service.types.includes('KOURS') && (
                                  <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-[#c1a0fd] text-white">KOURS</span>
                                )}
                                {service.types.includes('KOOK') && (
                                  <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-[#7c5cbf] text-white">KOOK</span>
                                )}
                              </div>
                              {/* Allergen tags overlay */}
                              {service.allergens.length > 0 && (
                                <div className="absolute top-2 right-1 flex flex-col gap-1 items-end">
                                  {service.allergens.slice(0, 2).map((a, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-white/90 text-[#374151] font-medium leading-tight">{a}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Thumbnails when expanded */}
                            {isOpen && service.images.length > 1 && (
                              <div className="flex gap-1 p-1.5 bg-[#f8f9fc]">
                                {service.images.slice(1, 4).map((img, i) => (
                                  <button
                                    key={i}
                                    onClick={() => openImageViewer(service.images, i + 1)}
                                    className="flex-1 aspect-square rounded-[6px] overflow-hidden group"
                                  >
                                    <img
                                      src={img.url}
                                      alt={`${service.title} ${i + 2}`}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Info column */}
                          <div className="flex-1 p-4 flex flex-col min-w-0">
                            {/* Title + chevron */}
                            <div className="flex items-start gap-2 mb-2">
                              <button
                                onClick={() => setOpenServiceId(isOpen ? null : service.id)}
                                className="flex-1 text-left"
                              >
                                <h3 className="text-[15px] md:text-[17px] font-semibold text-[#111125] leading-tight">
                                  {service.title}
                                </h3>
                              </button>
                              <button
                                onClick={() => setOpenServiceId(isOpen ? null : service.id)}
                                className="flex-shrink-0 p-1 rounded-full hover:bg-[#f3f4f6] transition-colors"
                              >
                                <svg
                                  className={`w-5 h-5 text-[#6b7280] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* Specialty + allergens pills when expanded */}
                            {isOpen ? (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {service.specialties[0] && (
                                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#f59e0b] text-[#d97706] text-[12px] font-medium">
                                    📍 {service.specialties[0]}
                                  </span>
                                )}
                                {service.allergens.slice(0, 3).map((a, i) => (
                                  <span key={i} className="px-2.5 py-1 rounded-full border border-[#e5e7eb] text-[#4b5563] text-[12px] font-medium">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            ) : service.specialties[0] ? (
                              <div className="mb-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#f59e0b] text-[#d97706] text-[12px] font-medium">
                                  📍 {service.specialties[0]}
                                </span>
                              </div>
                            ) : null}

                            {/* Price + Réserver */}
                            <div className="flex items-center justify-between mt-auto gap-2 pt-1">
                              <span className="text-[14px] md:text-[15px] font-semibold text-[#111125]">
                                À partir de {service.price}€
                              </span>
                              <button
                                onClick={() => navigate(`/reservation?service=${service.id}&kooker=${profile.id}`)}
                                className="px-4 py-2 bg-[#c1a0fd] text-white text-[13px] font-semibold rounded-[10px] hover:bg-[#b090ed] transition-all whitespace-nowrap flex-shrink-0"
                              >
                                {service.types.includes('KOURS') ? 'Réserver ce cours' : 'Réserver'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded detail section */}
                        {isOpen && (
                          <div className="px-5 pb-5 pt-4 border-t border-[#f0f0f0]">
                            <h4 className="text-[13px] font-semibold text-[#111125] mb-1.5">Description</h4>
                            <p className="text-[13px] text-[#4b5563] leading-relaxed mb-4">
                              {service.description}
                            </p>
                            {/* KOURS-specific badges */}
                            {service.types.includes('KOURS') && (service.koursDifficulty || service.koursLocation || service.equipmentProvided) && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {service.koursDifficulty && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] text-[#7c5cbf] text-[12px] font-semibold rounded-[8px]">
                                    🎓 {service.koursDifficulty}
                                  </span>
                                )}
                                {service.koursLocation && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] text-[#7c5cbf] text-[12px] font-semibold rounded-[8px]">
                                    📍 {service.koursLocation}
                                  </span>
                                )}
                                {service.equipmentProvided && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] text-[#7c5cbf] text-[12px] font-semibold rounded-[8px]">
                                    🎒 Matériel fourni
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <span className="block text-[11px] font-semibold text-[#9ca3af] uppercase mb-0.5">Durée</span>
                                <span className="text-[14px] text-[#111125]">{formatDuration(service.duration)}</span>
                              </div>
                              <div>
                                <span className="block text-[11px] font-semibold text-[#9ca3af] uppercase mb-0.5">Participants max</span>
                                <span className="text-[14px] text-[#111125]">{service.maxGuests} pers.</span>
                              </div>
                            </div>
                            <p className="text-[12px] text-[#9ca3af]">
                              Type : {service.types.join(' + ')}
                              {service.allergens.length > 0 && <> • Contraintes : {service.allergens.join(', ')}</>}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ============================================================= */}
            {/* MESSAGERIE                                                     */}
            {/* ============================================================= */}
            <section className="mb-10 bg-white rounded-[20px] border border-[#c1a0fd]/40 p-5 md:p-6">
              <h2 className="text-[18px] font-semibold text-[#111125] mb-2">Messagerie</h2>
              <p className="text-[14px] text-[#6b7280] mb-4">
                Vous pouvez envoyer un message à ce Kooker pour poser vos questions ou discuter de votre projet.
              </p>
              <button
                onClick={() => { if (!user) { navigate('/login'); return; } setShowMessageModal(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#c1a0fd] text-white text-[14px] font-semibold rounded-[12px] hover:bg-[#b090ed] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Envoyer un message
              </button>
            </section>

            {/* ============================================================= */}
            {/* AVIS                                                           */}
            {/* ============================================================= */}
            <section className="pb-12">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111125] tracking-[-0.5px]">
                  Avis
                </h2>
                <div className="flex items-center gap-3 text-[15px]">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-[#facc15]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="font-bold text-[#111125]">{profile.rating.toFixed(1)}</span>
                    <span className="text-[#6b7280]">/ 5</span>
                  </span>
                  <div className="w-px h-5 bg-[#e0e0e0]" />
                  <span className="text-[#6b7280]">{profile.reviewCount} avis</span>
                </div>
              </div>

              {profile.reviews.length === 0 ? (
                <p className="text-[14px] text-[#6b7280] py-8 text-center">Aucun avis pour le moment.</p>
              ) : (
                <>
                <div className="space-y-4">
                  {profile.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="bg-[#f8f9fc] rounded-[16px] p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-[42px] h-[42px] rounded-full bg-[#ece2fe] flex-shrink-0 overflow-hidden">
                            {review.userAvatar ? (
                              <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#7c5cbf] font-semibold text-[15px]">
                                {review.userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-[14px] font-semibold text-[#111125]">{review.userName}</div>
                            <div className="text-[12px] text-[#9ca3af]">{formatDate(review.date)}</div>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      <p className="text-[13px] text-[#4b5563] leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
                {profile.reviewCount > 5 && (
                  <div className="text-center mt-6">
                    <button className="px-6 py-2.5 border border-[#c1a0fd] text-[#c1a0fd] text-[14px] font-semibold rounded-[12px] hover:bg-[#fdf4ff] transition-all">
                      Voir tous les avis
                    </button>
                  </div>
                )}
                </>
              )}
            </section>
          </div>

          {/* ─── Calendar Sidebar ─── */}
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <section>
                <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111125] tracking-[-0.5px] mb-5">
                  Planning
                </h2>

                <div className="bg-[#f8f9fc] rounded-[16px] border border-[#e0e0e0] p-5">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
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

                  {/* Column Headers */}
                  <div className="flex items-center mb-2">
                    <div className="w-[62px] shrink-0" />
                    {DAY_SHORT_FR.map((day, i) => (
                      <div key={i} className="flex-1 text-center text-[11px] font-medium text-[#9ca3af]">
                        {day.charAt(0)}
                      </div>
                    ))}
                  </div>

                  {/* Week Rows */}
                  <div className="space-y-1.5">
                    {calendarWeeks.map((week, wi) => (
                      <div key={wi} className="flex items-center">
                        <div className="w-[62px] shrink-0 flex items-center gap-0.5">
                          <span className="text-[10px] text-[#9ca3af]">Sem.</span>
                          <span className="text-[11px] font-medium text-[#6b7280]">{getWeekStartLabel(week[0])}</span>
                        </div>
                        {week.map((dayDate, di) => {
                          const dateStr = toDateStr(dayDate);
                          const slots = availableDatesMap.get(dateStr);
                          const confirmedOnDay = confirmedSlotsMap.get(dateStr); // Map<startTime, status>
                          const isCurrentMonth = dayDate.getMonth() === calendarMonth;
                          const dayName = DAY_SHORT_FR[di];
                          const dayDisplay = `${String(dayDate.getDate()).padStart(2, '0')}/${String(dayDate.getMonth() + 1).padStart(2, '0')}`;
                          // Disponible = has slots AND at least one is not booked
                          const freeSlots = slots?.filter(s => !confirmedOnDay?.has(s.startTime));
                          const isAvailable = !!freeSlots && freeSlots.length > 0;
                          const isFullyBooked = !!slots && slots.length > 0 && (!freeSlots || freeSlots.length === 0);
                          const bookedStatuses = confirmedOnDay ? [...confirmedOnDay.values()] : [];
                          const hasConfirmedBooking = bookedStatuses.some(st => st === 'confirmed' || st === 'completed');
                          const hasPendingBooking = bookedStatuses.some(st => st === 'pending');

                          return (
                            <div
                              key={di}
                              className="flex-1 flex flex-col items-center justify-center relative py-0.5"
                              onMouseEnter={() => isCurrentMonth ? setTooltipDate(dateStr) : undefined}
                              onMouseLeave={() => setTooltipDate(null)}
                            >
                              {isCurrentMonth && (
                                <span className="text-[10px] text-[#9ca3af] leading-none mb-0.5">
                                  {String(dayDate.getDate()).padStart(2, '0')}
                                </span>
                              )}
                              <div
                                className={`w-3 h-3 rounded-full transition-all ${
                                  !isCurrentMonth
                                    ? 'bg-[#f0f0f0]'
                                    : isAvailable
                                      ? 'bg-green-500 cursor-pointer hover:scale-125'
                                      : isFullyBooked
                                        ? hasConfirmedBooking
                                          ? 'bg-[#fca5a5]'
                                          : hasPendingBooking
                                            ? 'bg-orange-400'
                                            : 'bg-[#fca5a5]'
                                        : 'bg-[#e5e7eb]'
                                }`}
                              />

                              {/* Tooltip */}
                              {isCurrentMonth && tooltipDate === dateStr && (
                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
                                  <div className="bg-white border border-[#e5e7eb] rounded-[10px] px-4 py-3 text-[13px] whitespace-nowrap shadow-lg text-[#111125] min-w-[160px]">
                                    <div className="font-bold mb-2">{dayName} {dayDisplay}</div>
                                    {slots && slots.length > 0 ? (
                                      slots.map((s, si) => {
                                        const slotStatus = confirmedOnDay?.get(s.startTime);
                                        const isBooked = !!slotStatus;
                                        const isConfirmed = slotStatus === 'confirmed' || slotStatus === 'completed';
                                        const iconColor = isBooked ? (isConfirmed ? 'text-red-400' : 'text-orange-400') : 'text-green-500';
                                        const badgeColor = isConfirmed ? 'text-red-400' : 'text-orange-400';
                                        const badgeLabel = isConfirmed ? 'Complet' : 'En attente';
                                        return (
                                          <div key={si} className="flex items-center gap-2">
                                            <span className={iconColor}>
                                              {isBooked ? '✗' : '✓'}
                                            </span>
                                            <span className={isBooked ? 'text-[#9ca3af] line-through' : 'text-[#374151]'}>
                                              {getSlotLabel(s.startTime)}
                                            </span>
                                            {isBooked && <span className={`text-[11px] font-medium ${badgeColor}`}>{badgeLabel}</span>}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <span className="text-[#9ca3af]">Aucun créneau disponible</span>
                                    )}
                                  </div>
                                  <div className="w-2.5 h-2.5 bg-[#111125] rotate-45 -mt-[5px]" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center flex-wrap gap-3 mt-4 pt-4 border-t border-[#f0f0f0]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-[12px] text-[#6b7280]">Disponible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-orange-400" />
                      <span className="text-[12px] text-[#6b7280]">En attente</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#fca5a5]" />
                      <span className="text-[12px] text-[#6b7280]">Complet</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#e5e7eb]" />
                      <span className="text-[12px] text-[#6b7280]">Occupé</span>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="mt-3 bg-[#f0ebff] rounded-[10px] px-3 py-2.5">
                    <p className="text-[11px] text-[#7c5cbf] leading-relaxed">
                      📅 Planning compact : Hover sur une pastille pour voir les créneaux disponibles
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

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

      {/* ============================================================= */}
      {/* MODAL ENVOYER UN MESSAGE                                       */}
      {/* ============================================================= */}
      {showMessageModal && profile && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => { setShowMessageModal(false); setMessageContent(''); }}
        >
          <div
            className="bg-white rounded-[20px] w-full max-w-[520px] shadow-xl p-6 md:p-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c1a0fd] to-[#8b6fce] flex items-center justify-center text-white font-bold text-[16px] flex-shrink-0">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#111125]">Contacter {profile.name}</h2>
                  <p className="text-[12px] text-[#6b7280]">Kooker à {profile.city || 'votre service'}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowMessageModal(false); setMessageContent(''); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f3f4f6] transition-colors flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111125" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendMessage(); }}
              placeholder={`Bonjour ${profile.name}, je suis intéressé(e) par vos services...`}
              rows={5}
              autoFocus
              className="w-full bg-[#f3f4f6] rounded-[12px] px-4 py-3 text-[14px] text-[#111125] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] resize-none mb-2"
            />
            <p className="text-[11px] text-[#9ca3af] mb-5">Cmd/Ctrl + Entrée pour envoyer</p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowMessageModal(false); setMessageContent(''); }}
                className="flex-1 h-[48px] border-2 border-[#e0e2ef] text-[#111125] font-semibold rounded-[12px] hover:bg-[#f3f4f6] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || messageSending}
                className="flex-1 h-[48px] bg-[#c1a0fd] hover:bg-[#b090ed] disabled:opacity-40 text-white font-semibold rounded-[12px] transition-all flex items-center justify-center gap-2"
              >
                {messageSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
