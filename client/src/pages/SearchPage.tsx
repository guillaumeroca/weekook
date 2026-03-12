import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import KookerCard from '@/components/common/KookerCard';
import { api } from '@/lib/api';

const KOOKER_PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1496952286950-c36951138af4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1729774092918-f1b7c595cce1?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1760445528879-010bd4b7660b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1617307744152-60bf7d1da3f8?w=600&h=400&fit=crop',
];

// ─── Types ──────────────────────────────────────────────────────────────────────
type ServiceType = 'KOOK' | 'KOURS' | 'BOTH' | '';
type SortOption = 'pertinence' | 'prix-asc' | 'prix-desc' | 'note';

interface Kooker {
  id: number;
  name: string;
  imageUrl: string;
  avatarUrl: string;
  city: string;
  specialties: string[];
  price: number;
  rating: number;
  reviewCount: number;
  type: ServiceType | string;
  types: string[];
}

// ─── API Response Types ─────────────────────────────────────────────────────────
interface ApiKooker {
  id: number;
  userId: number;
  specialties: string;
  type: string;
  city: string;
  rating: number;
  reviewCount: number;
  user: { id: number; firstName: string; lastName: string; avatar: string | null };
  services: { id: number; priceInCents: number; type: string }[];
}

interface KookersResponse {
  kookers: ApiKooker[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const SPECIALTIES = [
  'Toutes',
  'Provençale',
  'Méditerranéenne',
  'Pâtisserie',
  'Française',
  'Orientale',
  'Libanaise',
  'Végétarienne',
  'Italienne',
  'Japonaise',
  'Couscous',
  'Brunch',
  'Healthy',
  'BBQ',
  'Fruits de mer',
  'Gastronomique',
];

const CITIES = [
  'Toutes',
  'Marseille',
  'Aix-en-Provence',
  'Cassis',
  'Aubagne',
  'La Ciotat',
];

// ─── Component ──────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') || '') as ServiceType;
  const initialSpecialty = searchParams.get('specialty') || 'Toutes';
  const initialCity = searchParams.get('city') || 'Toutes';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialDifficulty = searchParams.get('difficulty') || '';
  const initialSort = (searchParams.get('sort') || 'pertinence') as SortOption;

  // Immediate state
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(true);
  const [sort] = useState<SortOption>(initialSort);

  // Pending filter state (inside the filter panel, not yet applied)
  const [pendingType, setPendingType] = useState<ServiceType>(initialType);
  const [pendingSpecialty, setPendingSpecialty] = useState(initialSpecialty);
  const [pendingCity, setPendingCity] = useState(initialCity);
  const [pendingMinPrice, setPendingMinPrice] = useState(initialMinPrice);
  const [pendingMaxPrice, setPendingMaxPrice] = useState(initialMaxPrice);
  const [pendingDifficulty, setPendingDifficulty] = useState(initialDifficulty);

  // Applied filter state (sent to API)
  const [type, setType] = useState<ServiceType>(initialType);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Kooker[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Map API kooker to local Kooker format
  const mapKooker = (k: ApiKooker): Kooker => {
    const specialties = (() => {
      try { return JSON.parse(k.specialties); } catch { return []; }
    })();
    const typeArr: string[] = (() => {
      try { return JSON.parse(k.type); } catch { return []; }
    })();
    // Collect all service types across all services
    const allServiceTypes = Array.from(new Set(
      k.services.flatMap((s) => {
        try { return JSON.parse(s.type); } catch { return []; }
      })
    )) as string[];
    const lowestPrice = k.services.length > 0
      ? Math.min(...k.services.map((s) => s.priceInCents)) / 100
      : 0;
    const avatarUrl = k.user.avatar
      ? (k.user.avatar.startsWith('http') ? k.user.avatar : `/uploads/${k.user.avatar}`)
      : '';

    const imageUrl = avatarUrl || KOOKER_PLACEHOLDER_IMAGES[k.id % KOOKER_PLACEHOLDER_IMAGES.length];
    return {
      id: k.id,
      name: `${k.user.firstName} ${k.user.lastName}`,
      imageUrl,
      avatarUrl,
      city: k.city || '',
      specialties,
      price: lowestPrice,
      rating: k.rating ?? 0,
      reviewCount: k.reviewCount ?? 0,
      type: typeArr[0] || '',
      types: allServiceTypes,
    };
  };

  // Fetch kookers from API
  const fetchKookers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      // BOTH means no type filter (all types)
      if (type && type !== 'BOTH') params.set('type', type);
      if (specialty !== 'Toutes') params.set('specialty', specialty);
      if (city !== 'Toutes') params.set('city', city);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (difficulty && type === 'KOURS') params.set('difficulty', difficulty);
      if (sort !== 'pertinence') params.set('sort', sort);
      params.set('limit', '12');

      const queryString = params.toString();
      const path = `/kookers${queryString ? `?${queryString}` : ''}`;
      const res = await api.get<KookersResponse>(path);

      if (res.success && res.data) {
        setResults(res.data.kookers.map(mapKooker));
        setTotalResults(res.data.total);
      } else {
        setResults([]);
        setTotalResults(0);
      }
    } catch {
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [query, type, specialty, city, minPrice, maxPrice, difficulty, sort]);

  // Debounce API calls
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchKookers();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchKookers]);

  // Sync applied filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (type) params.set('type', type);
    if (specialty !== 'Toutes') params.set('specialty', specialty);
    if (city !== 'Toutes') params.set('city', city);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (difficulty && type === 'KOURS') params.set('difficulty', difficulty);
    setSearchParams(params, { replace: true });
  }, [query, type, specialty, city, minPrice, maxPrice, difficulty, setSearchParams]);

  const applyFilters = () => {
    setType(pendingType);
    setSpecialty(pendingSpecialty);
    setCity(pendingCity);
    setMinPrice(pendingMinPrice);
    setMaxPrice(pendingMaxPrice);
    setDifficulty(pendingType === 'KOURS' ? pendingDifficulty : '');
  };

  const resetFilters = () => {
    setPendingType('');
    setPendingSpecialty('Toutes');
    setPendingCity('Toutes');
    setPendingMinPrice('');
    setPendingMaxPrice('');
    setPendingDifficulty('');
    setType('');
    setSpecialty('Toutes');
    setCity('Toutes');
    setMinPrice('');
    setMaxPrice('');
    setDifficulty('');
    setQuery('');
  };

  const hasActiveFilters =
    query !== '' ||
    type !== '' ||
    specialty !== 'Toutes' ||
    city !== 'Toutes' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    difficulty !== '';

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f2f4fc]">
      <section className="bg-[#f2f4fc]">
        <div className="px-4 md:px-8 lg:px-[96px] py-6 md:py-8">

          {/* Search bar + Masquer les filtres */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par nom, ville ou spécialité..."
                className="w-full h-[52px] pl-12 pr-10 bg-white border-2 border-[#c1a0fd] rounded-[12px] text-[15px] text-[#111125] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-4 flex items-center text-[#9ca3af] hover:text-[#111125] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 flex items-center gap-2 h-[52px] px-4 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] font-medium text-[#303044] transition-all whitespace-nowrap"
            >
              <svg className="w-4 h-4 text-[#c1a0fd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Results count title */}
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#111125] mb-4 tracking-[-0.5px]">
            {isLoading ? (
              <span className="inline-block w-48 h-7 bg-[#e5e7eb] rounded animate-pulse" />
            ) : (
              <>{totalResults} Kooker{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}</>
            )}
          </h1>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-[20px] p-5 md:p-6 shadow-sm">
              {/* Panel header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] font-semibold text-[#111125]">Filtres</h2>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-[#6b7280] hover:text-[#ef4444] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Filter fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                {/* Type de service */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#303044]">Type de service</label>
                  <select
                    value={pendingType}
                    onChange={(e) => { setPendingType(e.target.value as ServiceType); if (e.target.value !== 'KOURS') setPendingDifficulty(''); }}
                    className="h-[48px] px-3 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent cursor-pointer"
                  >
                    <option value="">Tous les types</option>
                    <option value="KOURS">KOURS (Cours)</option>
                    <option value="KOOK">KOOK (Repas)</option>
                    <option value="BOTH">Les deux</option>
                  </select>
                </div>

                {/* Niveau (KOURS only) */}
                {pendingType === 'KOURS' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-[#303044]">Niveau</label>
                    <select
                      value={pendingDifficulty}
                      onChange={(e) => setPendingDifficulty(e.target.value)}
                      className="h-[48px] px-3 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent cursor-pointer"
                    >
                      <option value="">Tous les niveaux</option>
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                  </div>
                )}

                {/* Spécialités */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#303044]">Spécialités</label>
                  <select
                    value={pendingSpecialty}
                    onChange={(e) => setPendingSpecialty(e.target.value)}
                    className="h-[48px] px-3 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent cursor-pointer"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s === 'Toutes' ? 'Toutes les spécialités' : s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prix par personne */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#303044]">Prix par personne</label>
                  <div className="flex items-center gap-2 h-[48px]">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        value={pendingMinPrice}
                        onChange={(e) => setPendingMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full h-[48px] pl-3 pr-7 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[#6b7280] pointer-events-none">€</span>
                    </div>
                    <span className="text-[#9ca3af] text-[14px] flex-shrink-0">—</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        value={pendingMaxPrice}
                        onChange={(e) => setPendingMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full h-[48px] pl-3 pr-7 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[#6b7280] pointer-events-none">€</span>
                    </div>
                  </div>
                </div>

                {/* Ville */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#303044]">Ville</label>
                  <select
                    value={pendingCity}
                    onChange={(e) => setPendingCity(e.target.value)}
                    className="h-[48px] px-3 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'Toutes' ? 'Toutes les villes' : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active filter tags / Aucun filtre actif */}
              <div className="flex items-center gap-2 flex-wrap mt-2 mb-2 min-h-[28px]">
                {!hasActiveFilters && (
                  <span className="text-[13px] text-[#9ca3af] italic">Aucun filtre actif</span>
                )}
                {type && type !== 'BOTH' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                    {type === 'KOOK' ? 'KOOK (Repas)' : 'KOURS (Cours)'}
                    <button onClick={() => { setType(''); setPendingType(''); }} className="hover:text-[#111125] transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {type === 'BOTH' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                    Les deux
                    <button onClick={() => { setType(''); setPendingType(''); }} className="hover:text-[#111125] transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {difficulty && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                    🎓 {difficulty}
                    <button onClick={() => { setDifficulty(''); setPendingDifficulty(''); }} className="hover:text-[#111125] transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {specialty !== 'Toutes' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                    {specialty}
                    <button onClick={() => { setSpecialty('Toutes'); setPendingSpecialty('Toutes'); }} className="hover:text-[#111125] transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {city !== 'Toutes' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                    {city}
                    <button onClick={() => { setCity('Toutes'); setPendingCity('Toutes'); }} className="hover:text-[#111125] transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                    {minPrice && maxPrice ? `${minPrice}€ – ${maxPrice}€` : minPrice ? `Dès ${minPrice}€` : `Jusqu'à ${maxPrice}€`}
                    <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPendingMinPrice(''); setPendingMaxPrice(''); }} className="hover:text-[#111125] transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>

              {/* Apply button */}
              <div className="flex justify-end">
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 px-6 py-3 bg-[#c1a0fd] text-white text-[14px] font-semibold rounded-[12px] hover:bg-[#b090ed] transition-all shadow-sm"
                >
                  Appliquer les filtres
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 md:px-8 lg:px-[96px] pb-8 md:pb-12">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full max-w-[286px] h-[429px] bg-white rounded-[20px] overflow-hidden animate-pulse">
                <div className="p-3">
                  <div className="w-full h-[200px] bg-[#e5e7eb] rounded-[24px]" />
                </div>
                <div className="px-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] bg-[#e5e7eb] rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-[#e5e7eb] rounded w-3/4" />
                      <div className="h-3 bg-[#e5e7eb] rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-[#e5e7eb] rounded-full w-20" />
                    <div className="h-6 bg-[#e5e7eb] rounded-full w-16" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-[#e5e7eb] rounded w-16" />
                    <div className="h-4 bg-[#e5e7eb] rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {results.map((kooker) => (
              <KookerCard
                key={kooker.id}
                id={kooker.id}
                name={kooker.name}
                imageUrl={kooker.imageUrl}
                avatarUrl={kooker.avatarUrl}
                city={kooker.city}
                specialties={kooker.specialties}
                price={kooker.price}
                types={kooker.types}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="w-[80px] h-[80px] mb-6 rounded-full bg-[#f8f9fc] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#c1a0fd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-[#111125] mb-2">Aucun résultat</h3>
            <p className="text-[15px] text-[#6b7280] text-center max-w-[400px] mb-6">
              Nous n'avons trouvé aucun kooker correspondant à vos critères. Essayez de modifier vos filtres.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-[#c1a0fd] text-white font-semibold rounded-[12px] hover:bg-[#b090ed] transition-all shadow-sm"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
