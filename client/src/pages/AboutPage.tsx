import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  Shield,
  Accessibility,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// ─── Data ───────────────────────────────────────────────────────────────────

const MISSION_VALUES = [
  {
    icon: Heart,
    title: 'Passion',
    description:
      'Nous croyons que la cuisine est un acte d\'amour. Chaque kooker partage sa passion à travers des plats uniques.',
  },
  {
    icon: Users,
    title: 'Communauté',
    description:
      'Weekook rassemble des passionnés de cuisine et des gourmets dans une communauté bienveillante et authentique.',
  },
  {
    icon: Award,
    title: 'Qualité',
    description:
      'Nous sélectionnons soigneusement nos kookers et garantissons une expérience culinaire d\'exception.',
  },
  {
    icon: TrendingUp,
    title: 'Innovation',
    description:
      'Notre plateforme évolue constamment pour offrir les meilleurs outils à nos kookers et clients.',
  },
];

const CORE_VALUES = [
  {
    icon: Sparkles,
    title: 'Authenticité',
    description:
      'Des recettes maison, des produits frais, des kookers passionnés. Chez Weekook, tout est vrai et sincère.',
  },
  {
    icon: Shield,
    title: 'Confiance',
    description:
      'Paiements sécurisés, avis vérifiés, profils contrôlés. Nous construisons un environnement de confiance pour tous.',
  },
  {
    icon: Accessibility,
    title: 'Accessibilité',
    description:
      'La bonne cuisine pour tous. Des prix justes, une plateforme simple, une expérience accessible à chacun.',
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'À propos | Weekook';
  }, []);

  return (
    <div className="bg-[#f2f4fc] min-h-screen">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative h-[320px] md:h-[420px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&h=500&fit=crop"
          alt="Cuisine conviviale"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8 lg:px-[96px]">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold">
              L'histoire de Weekook
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl mx-auto">
              Une plateforme née de la passion de la cuisine et du partage
            </p>
          </div>
        </div>
      </section>

      {/* ── Story ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111125]">
            Tout a commencé autour d'un repas...
          </h2>
          <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
            <p>
              En 2024, un groupe d'amis marseillais partageant une passion commune
              pour la cuisine fait un constat simple : il existe des dizaines de
              cuisiniers talentueux autour de nous, mais aucun moyen facile de faire
              appel à eux pour un repas à domicile, un événement ou un atelier
              culinaire.
            </p>
            <p>
              C'est de cette frustration qu'est née l'idée de Weekook : une
              plateforme qui met en relation des passionnés de cuisine -- les
              "kookers" -- avec des particuliers et des entreprises à la recherche
              d'expériences culinaires authentiques et sur-mesure.
            </p>
            <p>
              Aujourd'hui, Weekook grandit avec une mission claire : démocratiser
              l'accès à une cuisine de qualité, valoriser le savoir-faire des
              cuisiniers indépendants et créer du lien humain autour de la table.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px] bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111125]">
            Reconnecter les gens autour de la cuisine
          </h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Notre mission s'articule autour de quatre piliers fondamentaux qui
            guident chacune de nos décisions.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {MISSION_VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="bg-[#f2f4fc] rounded-[20px] p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#c1a0fd]/15 flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6 text-[#c1a0fd]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#111125]">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Core Values ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111125] text-center">
            Nos valeurs
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {CORE_VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white rounded-[20px] p-6 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-[#c1a0fd]/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#c1a0fd]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#111125]">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Tiles ──────────────────────────────────────────────────── */}
      <section className="py-8 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/avantages')}
            className="bg-gradient-to-br from-[#c1a0fd] to-[#9574e0] rounded-[20px] p-8 text-left text-white group cursor-pointer"
          >
            <h3 className="text-xl font-semibold">Découvrir les avantages</h3>
            <p className="mt-2 text-white/80 text-sm">
              Tous les outils et bénéfices pour les kookers sur notre plateforme.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium">
              <span>En savoir plus</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate('/confiance')}
            className="bg-gradient-to-br from-[#b090ed] to-[#7c5dc8] rounded-[20px] p-8 text-left text-white group cursor-pointer"
          >
            <h3 className="text-xl font-semibold">Confiance et garantie</h3>
            <p className="mt-2 text-white/80 text-sm">
              Comment nous assurons la sécurité et la qualité sur Weekook.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium">
              <span>En savoir plus</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-4xl mx-auto bg-white rounded-[20px] p-8 md:p-12 text-center shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111125]">
            Rejoignez l'aventure Weekook
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Que vous soyez passionné de cuisine ou amateur de bons plats, il y a une
            place pour vous sur Weekook.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/devenir-kooker')}
              className="bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              Devenir Kooker
            </Button>
            <Button
              onClick={() => navigate('/recherche')}
              variant="outline"
              className="border-[#c1a0fd] text-[#c1a0fd] hover:bg-[#c1a0fd]/5 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              Découvrir les Kookers
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
