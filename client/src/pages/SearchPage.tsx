import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import KookerCard from '@/components/common/KookerCard';
import { api } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────────
type ServiceType = 'KOOK' | 'KOURS' | '';
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

const PRICE_RANGES = [
  { label: 'Tous les prix', min: 0, max: 99999 },
  { label: 'Moins de 30€', min: 0, max: 29 },
  { label: '30€ - 40€', min: 30, max: 40 },
  { label: '40€ - 50€', min: 40, max: 50 },
  { label: 'Plus de 50€', min: 50, max: 99999 },
];

// ─── Component ──────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') || '') as ServiceType;
  const initialSpecialty = searchParams.get('specialty') || 'Toutes';
  const initialCity = searchParams.get('city') || 'Toutes';
  const initialPriceIndex = parseInt(searchParams.get('price') || '0', 10);
  const initialSort = (searchParams.get('sort') || 'pertinence') as SortOption;

  // State
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<ServiceType>(initialType);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity);
  const [priceRangeIndex, setPriceRangeIndex] = useState(initialPriceIndex);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Kooker[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Map API kooker to local Kooker format
  const mapKooker = (k: ApiKooker): Kooker => {
    const specialties = (() => {
      try { return JSON.parse(k.specialties); } catch { return []; }
    })();
    const typeArr = (() => {
      try { return JSON.parse(k.type); } catch { return []; }
    })();
    const lowestPrice = k.services.length > 0
      ? Math.min(...k.services.map((s) => s.priceInCents)) / 100
      : 0;
    const avatarUrl = k.user.avatar
      ? (k.user.avatar.startsWith('http') ? k.user.avatar : `/uploads/${k.user.avatar}`)
      : '';

    return {
      id: k.id,
      name: `${k.user.firstName} ${k.user.lastName}`,
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop',
      avatarUrl,
      city: k.city || '',
      specialties,
      price: lowestPrice,
      rating: k.rating ?? 0,
      reviewCount: k.reviewCount ?? 0,
      type: typeArr[0] || '',
    };
  };

  // Fetch kookers from API
  const fetchKookers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (type) params.set('type', type);
      if (specialty !== 'Toutes') params.set('specialty', specialty);
      if (city !== 'Toutes') params.set('city', city);

      const range = PRICE_RANGES[priceRangeIndex];
      if (range && priceRangeIndex > 0) {
        params.set('minPrice', String(range.min * 100));
        if (range.max < 99999) {
          params.set('maxPrice', String(range.max * 100));
        }
      }

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
  }, [query, type, specialty, city, priceRangeIndex, sort]);

  // Debounce API calls (300ms for text input, immediate for filter changes)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchKookers();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchKookers]);

  // Sync filters to URL
  const syncParams = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (type) params.set('type', type);
    if (specialty !== 'Toutes') params.set('specialty', specialty);
    if (city !== 'Toutes') params.set('city', city);
    if (priceRangeIndex > 0) params.set('price', String(priceRangeIndex));
    if (sort !== 'pertinence') params.set('sort', sort);
    setSearchParams(params, { replace: true });
  }, [query, type, specialty, city, priceRangeIndex, sort, setSearchParams]);

  useEffect(() => {
    syncParams();
  }, [syncParams]);

  const resetFilters = () => {
    setQuery('');
    setType('');
    setSpecialty('Toutes');
    setCity('Toutes');
    setPriceRangeIndex(0);
    setSort('pertinence');
  };

  const hasActiveFilters =
    query !== '' ||
    type !== '' ||
    specialty !== 'Toutes' ||
    city !== 'Toutes' ||
    priceRangeIndex !== 0;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f2f4fc]">
      {/* Hero Search Bar */}
      <section className="bg-[#f2f4fc]">
        <div className="px-4 md:px-8 lg:px-[96px] py-6 md:py-8">
          {/* Section Label */}
          <p className="text-[#cdb3fd] text-[16px] font-semibold tracking-[2.56px] uppercase leading-[1.5] mb-4">RÉSULTATS DE RECHERCHE</p>
          {/* Title */}
          <h1 className="text-[32px] md:text-[40px] tracking-[-0.8px] font-bold text-[#111125] mb-6">
            Trouvez votre Kooker
          </h1>
          <p className="text-[16px] text-[#5c5c6f] tracking-[-0.32px] mt-2 mb-6">Découvrez nos talents culinaires disponibles</p>

          {/* Search Input */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-[#9ca3af]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, ville ou spécialité..."
              className="w-full h-[52px] pl-12 pr-4 bg-white border-2 border-[#c1a0fd] rounded-[12px] text-[15px] text-[#111125] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-[#9ca3af] hover:text-[#111125] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Type Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[14px] font-medium text-[#6b7280]">
              Type :
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setType(type === 'KOOK' ? '' : 'KOOK')}
                className={`px-4 py-2 rounded-[12px] text-[14px] font-medium transition-all duration-200 ${
                  type === 'KOOK'
                    ? 'bg-[#c1a0fd] text-white shadow-sm'
                    : 'bg-[#f8f9fc] text-[#6b7280] border border-[#e5e7eb] hover:border-[#c1a0fd] hover:text-[#c1a0fd]'
                }`}
              >
                Kook
              </button>
              <button
                onClick={() => setType(type === 'KOURS' ? '' : 'KOURS')}
                className={`px-4 py-2 rounded-[12px] text-[14px] font-medium transition-all duration-200 ${
                  type === 'KOURS'
                    ? 'bg-[#c1a0fd] text-white shadow-sm'
                    : 'bg-[#f8f9fc] text-[#6b7280] border border-[#e5e7eb] hover:border-[#c1a0fd] hover:text-[#c1a0fd]'
                }`}
              >
                Kours
              </button>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:block">
            <div className="bg-white rounded-[20px] p-6 shadow-sm mt-6">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Specialty Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#303044] mb-2 block">
                    Spécialité
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="h-[48px] px-3 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent cursor-pointer min-w-[180px]"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#303044] mb-2 block">
                    Ville
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-[48px] px-3 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent cursor-pointer min-w-[180px]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#303044] mb-2 block">
                    Prix
                  </label>
                  <select
                    value={priceRangeIndex}
                    onChange={(e) => setPriceRangeIndex(Number(e.target.value))}
                    className="h-[48px] px-3 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent cursor-pointer min-w-[180px]"
                  >
                    {PRICE_RANGES.map((r, i) => (
                      <option key={i} value={i}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#303044] mb-2 block">
                    Trier par
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="h-[48px] px-3 bg-white border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] focus:border-transparent cursor-pointer min-w-[160px]"
                  >
                    <option value="pertinence">Pertinence</option>
                    <option value="prix-asc">Prix croissant</option>
                    <option value="prix-desc">Prix décroissant</option>
                    <option value="note">Meilleures notes</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-medium text-transparent mb-2 block">
                      &nbsp;
                    </label>
                    <button
                      onClick={resetFilters}
                      className="h-[48px] px-4 text-[14px] font-medium text-[#ef4444] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-[12px] transition-all"
                    >
                      Réinitialiser
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#f8f9fc] border border-[#e5e7eb] rounded-[12px] text-[14px] font-medium text-[#111125] hover:border-[#c1a0fd] transition-all w-full justify-center"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtres
              {hasActiveFilters && (
                <span className="w-5 h-5 flex items-center justify-center bg-[#c1a0fd] text-white text-[11px] font-bold rounded-full">
                  {[
                    type !== '',
                    specialty !== 'Toutes',
                    city !== 'Toutes',
                    priceRangeIndex !== 0,
                  ].filter(Boolean).length}
                </span>
              )}
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="md:hidden mt-4 p-4 bg-white rounded-[20px] shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* Mobile Specialty */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#6b7280] uppercase tracking-wide">
                  Spécialité
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="h-[48px] px-3 border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd]"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#6b7280] uppercase tracking-wide">
                  Ville
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-[48px] px-3 border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd]"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#6b7280] uppercase tracking-wide">
                  Prix
                </label>
                <select
                  value={priceRangeIndex}
                  onChange={(e) => setPriceRangeIndex(Number(e.target.value))}
                  className="h-[48px] px-3 border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd]"
                >
                  {PRICE_RANGES.map((r, i) => (
                    <option key={i} value={i}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Sort */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#6b7280] uppercase tracking-wide">
                  Trier par
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="h-[48px] px-3 border-2 border-[#e0e0e6] hover:border-[#c1a0fd] rounded-[12px] text-[14px] text-[#111125] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd]"
                >
                  <option value="pertinence">Pertinence</option>
                  <option value="prix-asc">Prix croissant</option>
                  <option value="prix-desc">Prix décroissant</option>
                  <option value="note">Meilleures notes</option>
                </select>
              </div>

              {/* Mobile Reset + Apply */}
              <div className="flex gap-3 pt-2">
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex-1 h-[48px] text-[14px] font-medium text-[#ef4444] border border-[#fecaca] rounded-[12px] hover:bg-[#fef2f2] transition-all"
                  >
                    Réinitialiser
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 h-[48px] text-[14px] font-semibold text-white bg-[#c1a0fd] rounded-[12px] hover:bg-[#b090ed] transition-all"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 md:px-8 lg:px-[96px] py-8 md:py-12">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[15px] text-[#6b7280]">
            {isLoading ? (
              <span className="inline-block w-32 h-4 bg-[#e5e7eb] rounded animate-pulse" />
            ) : (
              <>
                <span className="font-semibold text-[18px] text-[#111125]">
                  {results.length}
                </span>{' '}
                {results.length === 1 ? 'résultat' : 'résultats'} trouvés
              </>
            )}
          </p>

          {/* Active Filter Tags (desktop) */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {type && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                {type === 'KOOK' ? 'Kook' : 'Kours'}
                <button
                  onClick={() => setType('')}
                  className="hover:text-[#111125] transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {specialty !== 'Toutes' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                {specialty}
                <button
                  onClick={() => setSpecialty('Toutes')}
                  className="hover:text-[#111125] transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {city !== 'Toutes' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                {city}
                <button
                  onClick={() => setCity('Toutes')}
                  className="hover:text-[#111125] transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {priceRangeIndex > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f3ecff] border border-[#c1a0fd] text-[#c1a0fd] rounded-[8px] text-[12px] font-medium">
                {PRICE_RANGES[priceRangeIndex].label}
                <button
                  onClick={() => setPriceRangeIndex(0)}
                  className="hover:text-[#111125] transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-full max-w-[286px] h-[429px] bg-white rounded-[20px] overflow-hidden animate-pulse"
              >
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
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="w-[80px] h-[80px] mb-6 rounded-full bg-[#f8f9fc] flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[#c1a0fd]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-[#111125] mb-2">
              Aucun résultat
            </h3>
            <p className="text-[15px] text-[#6b7280] text-center max-w-[400px] mb-6">
              Nous n'avons trouvé aucun kooker correspondant à vos critères.
              Essayez de modifier vos filtres.
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
