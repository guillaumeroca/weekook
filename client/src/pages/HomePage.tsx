import { useState, useEffect, useCallback, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import KookerCard from '@/components/common/KookerCard';
import { api } from '@/lib/api';
import heroImage from '@/assets/d44ea553455097a6377797d27e1f725103cf1bcf.png';
import kookerImage from '@/assets/daf59a7b2f5cb369dff77dcdb101b9bb2386564d.png';

// ─── Placeholder images for kooker cards ────────────────────────────────────

const KOOKER_PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1496952286950-c36951138af4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1729774092918-f1b7c595cce1?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1760445528879-010bd4b7660b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1617307744152-60bf7d1da3f8?w=600&h=400&fit=crop',
];

// ─── API response types ─────────────────────────────────────────────────────

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

interface ApiTestimonial {
  id: number;
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
  kookerProfile?: { user: { firstName: string; lastName: string } };
}

// ─── Display types ──────────────────────────────────────────────────────────

interface DisplayKooker {
  id: number;
  name: string;
  imageUrl: string;
  city: string;
  specialties: string[];
  price: number;
  rating?: number;
  reviewCount?: number;
}

interface DisplayTestimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  quote: string;
  rating: number;
}

const TYPEWRITER_WORDS = ['Couscous', 'cuisine vietnamienne', 'Marseille Paella géante'];

const FAQ_ITEMS = [
  {
    question: 'Comment fonctionne Weekook ?',
    answer:
      "Weekook met en relation des passionnés de cuisine (les Kookers) avec des particuliers et des entreprises. Parcourez les profils de nos Kookers, découvrez leurs spécialités et leurs offres, puis réservez directement en ligne. Le Kooker se déplace chez vous ou dans le lieu de votre choix pour préparer un repas sur mesure. C'est simple, convivial et délicieux !",
  },
  {
    question: 'Quels types d\'offres sont disponibles sur la plateforme ?',
    answer:
      "Nos Kookers proposent une grande variété d'offres : des repas à domicile pour des événements (anniversaires, mariages, team building), des cours de cuisine personnalisés, des préparations de batch cooking pour la semaine, et même des ateliers thématiques. Chaque Kooker définit ses propres offres avec ses tarifs et ses spécialités.",
  },
  {
    question: 'Comment devenir kooker sur Weekook ?',
    answer:
      "Devenir Kooker est simple et gratuit ! Créez votre compte sur la plateforme, puis remplissez le formulaire \"Devenir Kooker\" en renseignant vos spécialités, votre expérience et votre zone géographique. Une fois votre profil validé, vous pouvez créer vos offres et commencer à recevoir des réservations. Aucun diplôme de cuisine n'est requis, seule la passion compte !",
  },
  {
    question: 'Comment sont garanties la qualité et la sécurité ?',
    answer:
      "La sécurité et la qualité sont au cœur de notre plateforme. Chaque Kooker est vérifié lors de son inscription. Les avis et notes des clients sont publiés en toute transparence. Nous proposons également une assurance responsabilité civile pour chaque prestation. En cas de problème, notre service client est disponible 7j/7 pour vous accompagner.",
  },
  {
    question: 'Quels sont les tarifs et comment ça se passe pour les paiements ?',
    answer:
      "Les tarifs sont fixés librement par chaque Kooker en fonction de ses offres. Le paiement s'effectue en ligne de manière sécurisée lors de la réservation. Le montant est bloqué jusqu'à la réalisation de la prestation, puis reversé au Kooker. Weekook prélève une commission de service transparente. Aucun frais caché !",
  },
];

// ─── Typewriter Hook ────────────────────────────────────────────────────────

function useTypewriter(words: string[], typingSpeed = 100, deletingSpeed = 60, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
          if (displayText.length + 1 === currentWord.length) {
            setTimeout(() => setIsDeleting(true), pauseTime);
          }
        } else {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
          if (displayText.length === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return displayText;
}

// ─── HomePage Component ─────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [kookers, setKookers] = useState<DisplayKooker[]>([]);
  const [testimonials, setTestimonials] = useState<DisplayTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const typewriterText = useTypewriter(TYPEWRITER_WORDS, 80, 50, 1800);

  // Fetch kookers and testimonials on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [kookersRes, testimonialsRes] = await Promise.all([
          api.get<KookersResponse>('/kookers?featured=true&limit=4'),
          api.get<ApiTestimonial[]>('/testimonials'),
        ]);

        if (kookersRes.success && kookersRes.data) {
          const mapped: DisplayKooker[] = kookersRes.data.kookers.map((k, index) => {
            const specialties: string[] = (() => {
              try { return JSON.parse(k.specialties); } catch { return []; }
            })();
            const lowestPrice = k.services.length > 0
              ? Math.min(...k.services.map((s) => s.priceInCents)) / 100
              : 0;
            return {
              id: k.id,
              name: `${k.user.firstName} ${k.user.lastName}`,
              imageUrl: KOOKER_PLACEHOLDER_IMAGES[index % KOOKER_PLACEHOLDER_IMAGES.length],
              city: k.city,
              specialties,
              price: lowestPrice,
              rating: k.rating,
              reviewCount: k.reviewCount,
            };
          });
          setKookers(mapped);
        }

        if (testimonialsRes.success && testimonialsRes.data) {
          const mapped: DisplayTestimonial[] = testimonialsRes.data.map((t, index) => ({
            id: t.id,
            name: t.authorName,
            location: t.authorRole || '',
            avatar: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&sig=${index}`,
            quote: t.content,
            rating: t.rating,
          }));
          setTestimonials(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Number of visible testimonials based on screen (we always render 3 for desktop)
  const visibleCount = 3;
  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const handlePrevTestimonial = useCallback(() => {
    setTestimonialIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextTestimonial = useCallback(() => {
    setTestimonialIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/recherche?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/recherche');
    }
  };

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f2f4fc]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section className="relative w-full h-[280px] md:h-[340px] lg:h-[520px] overflow-hidden">
        {/* Background Image */}
        <img
          src={heroImage}
          alt="Weekook hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8 lg:px-[96px] text-center">
          <h1 className="font-black text-[28px] md:text-[36px] lg:text-[40px] text-white mb-4 leading-tight">
            WEEKOOK
          </h1>
          <p className="text-white/90 text-[14px] md:text-[16px] lg:text-[18px] max-w-[640px] leading-relaxed mb-8">
            Vous cherchez un passionné talentueux pour préparer une paella géante,
            un couscous familial ou un cours de pâtisserie ? Trouvez votre Kooker
            près de chez vous !
          </p>

          {/* Desktop Search Bar (positioned inside hero) */}
          <div className="hidden md:block w-full max-w-[648px]">
            <form onSubmit={handleSearch} className="relative">
              <div className="bg-[#f3f3f3] rounded-full h-[60px] md:h-[70px] lg:h-[83px] shadow-[0px_6.539px_6.539px_3.269px_rgba(0,0,0,0.25)] flex items-center px-6 lg:px-8">
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-[#111125] text-[16px] lg:text-[18px] font-medium outline-none placeholder:text-[#9ca3af]"
                    placeholder=""
                  />
                  {/* Typewriter placeholder (only visible when input is empty) */}
                  {!searchQuery && (
                    <div className="absolute inset-0 flex items-center pointer-events-none">
                      <span className="text-[#9ca3af] text-[16px] lg:text-[18px] font-medium">
                        {typewriterText}
                        <span className="animate-pulse">|</span>
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-[#c1a0fd] hover:bg-[#b090ed] rounded-full size-[48px] md:size-[56px] lg:size-[60px] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ml-4"
                  aria-label="Rechercher"
                >
                  <Search className="w-[22px] h-[22px] lg:w-[26px] lg:h-[26px] text-white" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Mobile Search Bar (below hero) */}
      <div className="md:hidden px-4 -mt-[30px] relative z-20 mb-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="bg-[#f3f3f3] rounded-full h-[60px] shadow-[0px_6.539px_6.539px_3.269px_rgba(0,0,0,0.25)] flex items-center px-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[#111125] text-[15px] font-medium outline-none placeholder:text-[#9ca3af]"
                placeholder=""
              />
              {!searchQuery && (
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <span className="text-[#9ca3af] text-[15px] font-medium">
                    {typewriterText}
                    <span className="animate-pulse">|</span>
                  </span>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#c1a0fd] hover:bg-[#b090ed] rounded-full size-[48px] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ml-3"
              aria-label="Rechercher"
            >
              <Search className="w-[22px] h-[22px] text-white" />
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════════════════ KOOKERS SECTION ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] py-[48px] md:py-[64px] lg:py-[80px]">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[#cdb3fd] text-[14px] md:text-[16px] tracking-[2.56px] uppercase font-semibold mb-3">
            LES PERSONNES
          </p>
          <h2 className="text-[#111125] text-[28px] md:text-[36px] lg:text-[40px] font-semibold leading-tight mb-4">
            Découvrez nos Kookers
          </h2>
          <p className="text-[#5c5c6f] text-[15px] md:text-[16px] max-w-[520px] mx-auto">
            Des passionnés de cuisine près de chez vous
          </p>
        </div>

        {/* Kooker Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center mb-10 md:mb-14">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[429px] w-full max-w-[286px] bg-[#f8f9fc] rounded-[20px] animate-pulse"
              >
                <div className="w-full h-[220px] p-3">
                  <div className="w-full h-full rounded-[24px] bg-[#e6d9fe]/40" />
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#e6d9fe]/40" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-[#e6d9fe]/40 rounded w-3/4" />
                      <div className="h-3 bg-[#e6d9fe]/40 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-6 bg-[#e6d9fe]/40 rounded-full w-16" />
                    <div className="h-6 bg-[#e6d9fe]/40 rounded-full w-14" />
                    <div className="h-6 bg-[#e6d9fe]/40 rounded-full w-12" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            kookers.map((kooker) => (
              <KookerCard
                key={kooker.id}
                id={kooker.id}
                name={kooker.name}
                imageUrl={kooker.imageUrl}
                city={kooker.city}
                specialties={kooker.specialties}
                price={kooker.price}
              />
            ))
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/recherche')}
            className="h-[52px] px-8 rounded-[12px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-semibold text-[16px] transition-colors cursor-pointer"
          >
            Voir tous les Kookers
          </button>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS SECTION ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] py-[48px] md:py-[64px] lg:py-[80px]">
        <div className="bg-[#f8f9fc] rounded-[24px] px-6 md:px-10 lg:px-14 py-10 md:py-14 lg:py-16">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[#cdb3fd] text-[14px] md:text-[16px] tracking-[2.56px] uppercase font-semibold mb-3">
              ON EN PARLE
            </p>
            <h2 className="text-[#111125] text-[28px] md:text-[36px] lg:text-[40px] font-semibold leading-tight mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-[#5c5c6f] text-[15px] md:text-[16px] max-w-[560px] mx-auto">
              Découvrez les avis et les expériences de notre communauté WEEKOOK !
            </p>
          </div>

          {/* Carousel */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {testimonials.slice(testimonialIndex, testimonialIndex + visibleCount).map(
                  (testimonial) => (
                    <div
                      key={testimonial.id}
                      className="bg-white rounded-[12px] p-6 md:p-8 flex flex-col gap-4 shadow-sm"
                    >
                      {/* Quote Icon */}
                      <div className="flex items-center gap-1 mb-1">
                        <Quote className="w-[28px] h-[28px] text-[#c1a0fd] fill-[#c1a0fd] opacity-30" />
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-[16px] h-[16px] text-[#fbbf24] fill-[#fbbf24]"
                          />
                        ))}
                      </div>

                      {/* Quote Text */}
                      <p className="text-[#5c5c6f] text-[14px] md:text-[15px] leading-relaxed flex-1">
                        "{testimonial.quote}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3 mt-2 pt-4 border-t border-[#f0f0f0]">
                        <div className="w-[44px] h-[44px] rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[14px] text-[#111125]">
                            {testimonial.name}
                          </span>
                          <span className="text-[12px] text-[#9ca3af]">
                            {testimonial.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={handlePrevTestimonial}
              disabled={testimonialIndex === 0}
              className="w-[48px] h-[48px] rounded-full bg-[#f3ecff] hover:bg-[#e6d9fe] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="w-[22px] h-[22px] text-[#c1a0fd]" />
            </button>
            <button
              onClick={handleNextTestimonial}
              disabled={testimonialIndex >= maxIndex}
              className="w-[48px] h-[48px] rounded-full bg-[#c1a0fd] hover:bg-[#b090ed] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="w-[22px] h-[22px] text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA KOOKER SECTION ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] py-[48px] md:py-[64px] lg:py-[80px]">
        <div className="relative w-full rounded-[24px] overflow-hidden min-h-[400px] md:min-h-[460px] lg:min-h-[520px]">
          {/* Background Image */}
          <img
            src={kookerImage}
            alt="Devenir Kooker"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full min-h-[400px] md:min-h-[460px] lg:min-h-[520px] px-6 md:px-10 lg:px-16 py-10 max-w-[640px]">
            <p className="text-[#cdb3fd] text-[14px] md:text-[16px] tracking-[2.56px] uppercase font-semibold mb-3">
              JE SUIS UN KOOKER !
            </p>
            <h2 className="text-[#111125] text-[28px] md:text-[36px] lg:text-[40px] font-semibold leading-tight mb-5">
              Envie de partager votre savoir-faire ? Rejoignez Weekook !
            </h2>
            <p className="text-[#5c5c6f] text-[14px] md:text-[15px] leading-relaxed mb-8">
              Vous êtes passionné de cuisine et souhaitez partager vos talents ?
              Inscrivez-vous gratuitement sur Weekook et proposez vos services
              culinaires à une communauté de gourmands. Définissez vos offres, vos
              tarifs et vos disponibilités. Nous nous occupons du reste : mise en
              relation, paiement sécurisé et visibilité auprès de milliers
              d'utilisateurs.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/connexion')}
                className="h-[52px] px-8 rounded-[12px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-semibold text-[15px] transition-colors cursor-pointer"
              >
                S'inscrire gratuitement
              </button>
              <button
                onClick={() => navigate('/connexion')}
                className="h-[52px] px-8 rounded-[12px] border-2 border-[#c1a0fd] text-[#c1a0fd] hover:bg-[#c1a0fd] hover:text-white font-semibold text-[15px] transition-colors cursor-pointer"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ SECTION ═══════════════════════ */}
      <section className="px-4 md:px-8 lg:px-[96px] py-[48px] md:py-[64px] lg:py-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column - Text + CTA */}
          <div className="flex flex-col justify-start">
            <p className="text-[#cdb3fd] text-[14px] md:text-[16px] tracking-[2.56px] uppercase font-semibold mb-3">
              DES INFOS ?
            </p>
            <h2 className="text-[#111125] text-[28px] md:text-[36px] lg:text-[40px] font-semibold leading-tight mb-5">
              Vous avez des questions ? On peut certainement y répondre :)
            </h2>
            <p className="text-[#5c5c6f] text-[14px] md:text-[15px] leading-relaxed mb-8">
              Consultez notre FAQ pour trouver des réponses aux questions les plus
              fréquentes. Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas
              à nous contacter directement. Notre équipe est là pour vous aider !
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/connexion')}
                className="h-[52px] px-8 rounded-[12px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-semibold text-[15px] transition-colors cursor-pointer"
              >
                Je m'inscris
              </button>
              <button
                onClick={() => navigate('/a-propos')}
                className="h-[52px] px-8 rounded-[12px] border-2 border-[#c1a0fd] text-[#c1a0fd] hover:bg-[#c1a0fd] hover:text-white font-semibold text-[15px] transition-colors cursor-pointer"
              >
                En savoir plus
              </button>
            </div>
          </div>

          {/* Right Column - Accordion */}
          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-[16px] border-2 transition-all duration-300 ${
                    isOpen
                      ? 'bg-[#f2f4fc] border-[#c1a0fd]'
                      : 'bg-[#f8f9fc] border-[#e6d9fe]'
                  }`}
                >
                  {/* Question */}
                  <button
                    onClick={() => handleFaqToggle(index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 cursor-pointer text-left"
                  >
                    <span
                      className={`font-semibold text-[15px] md:text-[16px] pr-4 transition-colors ${
                        isOpen ? 'text-[#111125]' : 'text-[#303044]'
                      }`}
                    >
                      {item.question}
                    </span>
                    {/* Plus / Close Icon */}
                    <div
                      className={`flex-shrink-0 w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-full flex items-center justify-center transition-colors ${
                        isOpen ? 'bg-[#c1a0fd]' : 'bg-[#e6d9fe]'
                      }`}
                    >
                      {isOpen ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 4L4 12M4 4L12 12"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 3V13M3 8H13"
                            stroke="#c1a0fd"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Answer with smooth transition */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 md:px-6 pb-5 md:pb-6">
                      <p className="text-[#5c5c6f] text-[14px] md:text-[15px] leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
