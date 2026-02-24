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
      <section className="relative h-[500px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&h=500&fit=crop"
          alt="Cuisine conviviale"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center px-4 md:px-8 lg:px-[96px]">
          <div className="max-w-[600px]">
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              À PROPOS
            </p>
            <h1 className="font-semibold text-white text-[36px] md:text-[56px] tracking-[-1.12px] leading-[1.15] mb-6">
              L'histoire de Weekook
            </h1>
            <p className="text-white text-[18px] md:text-[20px] tracking-[-0.4px] leading-[1.5]">
              Une plateforme née de la passion pour la cuisine et le partage, créée pour reconnecter les gens autour de la table.
            </p>
          </div>
        </div>
      </section>

      {/* ── Story ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
          <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
            NOTRE HISTOIRE
          </p>
          <h2 className="text-[32px] md:text-[40px] font-semibold text-[#111125] tracking-[-0.8px] leading-[1.15] mb-6">
            Tout a commencé autour d'un repas...
          </h2>
          <div className="space-y-4 text-[18px] text-[#5c5c6f] leading-[1.6]">
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
          <div className="rounded-[20px] overflow-hidden shadow-lg">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=500&fit=crop"
              alt="Partage culinaire"
              className="w-full h-[400px] lg:h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Mission ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto bg-white rounded-[20px] p-8 md:p-12 shadow-sm">
          <div className="text-center max-w-[800px] mx-auto mb-12">
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              NOTRE MISSION
            </p>
            <h2 className="text-[32px] md:text-[40px] font-semibold text-[#111125] tracking-[-0.8px] leading-[1.15] mb-6">
              Reconnecter les gens autour de la cuisine
            </h2>
            <p className="text-[18px] text-[#5c5c6f] leading-[1.6]">
              Chez Weekook, nous croyons que la cuisine est bien plus qu'une simple préparation de repas. C'est un moment de partage, d'apprentissage et de convivialité.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {MISSION_VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="text-center"
                >
                  <div className="bg-[#f3ecff] w-[80px] h-[80px] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-10 h-10 text-[#c1a0fd]" />
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#111125] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-[14px] text-[#5c5c6f] leading-[1.5]">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Core Values ────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-[20px] overflow-hidden shadow-lg">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=500&fit=crop"
              alt="Cours de cuisine"
              className="w-full h-[400px] lg:h-[500px] object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              NOS VALEURS
            </p>
            <h2 className="text-[32px] md:text-[40px] font-semibold text-[#111125] tracking-[-0.8px] leading-[1.15] mb-8">
              Ce qui nous guide au quotidien
            </h2>
            <div className="space-y-8">
              {CORE_VALUES.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="flex gap-4">
                    <div className="bg-[#f3ecff] w-[56px] h-[56px] rounded-full flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#c1a0fd]" />
                    </div>
                    <div>
                      <h3 className="text-[22px] font-semibold text-[#111125] mb-2">
                        {value.title}
                      </h3>
                      <p className="text-[16px] text-[#5c5c6f] leading-[1.6]">
                        {value.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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
      <section className="bg-gradient-to-r from-[#c1a0fd] to-[#9b7dd4] py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-[96px] text-center">
          <h2 className="font-semibold text-white text-[32px] md:text-[40px] tracking-[-0.8px] leading-[1.15] mb-6">
            Prêt à rejoindre l'aventure Weekook ?
          </h2>
          <p className="text-[18px] md:text-[20px] text-white leading-[1.5] mb-8 max-w-[600px] mx-auto">
            Que vous soyez passionné de cuisine ou simplement amateur de bons repas, il y a une place pour vous dans notre communauté.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/devenir-kooker')}
              className="bg-white text-[#c1a0fd] hover:bg-gray-100 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              Devenir Kooker
            </Button>
            <Button
              onClick={() => navigate('/recherche')}
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              Découvrir les Kookers
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
