import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  MessageCircle,
  CreditCard,
  Sparkles,
  BarChart,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// ─── Data ───────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: Calendar,
    title: 'Gestion du planning',
    description:
      'Gérez vos disponibilités en quelques clics. Calendrier intuitif, créneaux personnalisables et synchronisation automatique.',
  },
  {
    icon: Users,
    title: 'Mise en relation',
    description:
      'Soyez visible auprès de milliers de clients potentiels. Notre algorithme de recherche met en avant votre profil selon vos spécialités.',
  },
  {
    icon: MessageCircle,
    title: 'Centralisation des demandes',
    description:
      'Recevez et gérez toutes vos demandes de réservation depuis un seul tableau de bord. Plus besoin de jongler entre les outils.',
  },
  {
    icon: CreditCard,
    title: 'Paiements sécurisés',
    description:
      'Encaissez vos paiements en toute sérénité. Transactions sécurisées, virements automatiques et suivi en temps réel.',
  },
  {
    icon: Sparkles,
    title: 'Visibilité accrue',
    description:
      'Profitez de notre référencement et de notre communauté pour développer votre clientèle. Avis vérifiés et profil optimisé.',
  },
  {
    icon: BarChart,
    title: 'Statistiques détaillées',
    description:
      'Suivez vos performances avec des statistiques claires : réservations, revenus, avis, taux de conversion et tendances.',
  },
];

const SUPPORT_ITEMS = [
  {
    icon: Shield,
    title: 'Protection juridique',
    description:
      'Conditions générales claires, assurance responsabilité civile incluse et accompagnement en cas de litige.',
  },
  {
    icon: MessageCircle,
    title: 'Support réactif',
    description:
      'Notre équipe support est disponible par chat et email pour répondre à toutes vos questions rapidement.',
  },
  {
    icon: TrendingUp,
    title: 'Conseils personnalisés',
    description:
      'Bénéficiez de conseils pour optimiser votre profil, fixer vos tarifs et développer votre activité de kooker.',
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function BenefitsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Avantages Kookers | Weekook';
  }, []);

  return (
    <div className="bg-[#f2f4fc] min-h-screen">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative h-[500px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1400&h=500&fit=crop"
          alt="Chef en cuisine"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center px-4 md:px-8 lg:px-[96px]">
          <div className="max-w-[700px]">
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              POURQUOI WEEKOOK
            </p>
            <h1 className="font-semibold text-white text-[36px] md:text-[56px] tracking-[-1.12px] leading-[1.15] mb-6">
              Les avantages Weekook pour les Kookers
            </h1>
            <p className="text-white text-[18px] md:text-[20px] tracking-[-0.4px] leading-[1.5]">
              Développez votre activité culinaire avec une plateforme complète qui vous simplifie la vie et vous met en relation avec des clients passionnés.
            </p>
          </div>
        </div>
      </section>

      {/* ── Benefits Grid ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-[800px] mx-auto mb-16">
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              TOUT CE DONT VOUS AVEZ BESOIN
            </p>
            <h2 className="font-semibold text-[#111125] text-[32px] md:text-[40px] tracking-[-0.8px] leading-[1.15] mb-6">
              Une plateforme pensée pour votre réussite
            </h2>
            <p className="text-[18px] text-[#5c5c6f] leading-[1.6]">
              Weekook centralise tous les outils dont vous avez besoin pour gérer et développer votre activité de kooker, sans les contraintes administratives.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-white rounded-[20px] p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-[#f3ecff] w-[70px] h-[70px] rounded-full flex items-center justify-center mb-4">
                    <Icon className="size-9 text-[#c1a0fd]" />
                  </div>
                  <h3 className="text-[22px] font-semibold text-[#111125] mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-[16px] text-[#5c5c6f] leading-[1.6]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Feature Highlight ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-[20px] overflow-hidden shadow-lg">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=450&fit=crop"
              alt="Kooker en cuisine"
              className="w-full h-[400px] lg:h-[450px] object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              CONCENTREZ-VOUS SUR L'ESSENTIEL
            </p>
            <h2 className="font-semibold text-[#111125] text-[32px] md:text-[40px] tracking-[-0.8px] leading-[1.15] mb-6">
              Moins d'administration, plus de cuisine
            </h2>
            <div className="space-y-4 text-[18px] text-[#5c5c6f] leading-[1.6]">
              <p>
                En tant que kooker, votre passion c'est la cuisine, pas la paperasse. Weekook s'occupe de toute la partie administrative pour que vous puissiez vous concentrer sur ce que vous faites de mieux.
              </p>
              <p>
                Gestion des réservations, paiements, communications clients, planification... Tout est automatisé et centralisé dans votre dashboard personnel.
              </p>
              <p>
                Vous gardez le contrôle total de vos offres, de vos tarifs et de vos disponibilités, mais sans le poids de la gestion quotidienne.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Support Section ────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto bg-white rounded-[20px] p-8 md:p-12 shadow-sm">
          <div className="text-center max-w-[800px] mx-auto mb-12">
            <p className="font-semibold text-[#cdb3fd] text-[16px] tracking-[2.56px] uppercase mb-4">
              ON VOUS ACCOMPAGNE
            </p>
            <h2 className="font-semibold text-[#111125] text-[32px] md:text-[40px] tracking-[-0.8px] leading-[1.15]">
              Un support dédié à votre succès
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUPPORT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="text-center"
                >
                  <div className="bg-[#f3ecff] w-[80px] h-[80px] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="size-10 text-[#c1a0fd]" />
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#111125] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-[#5c5c6f] leading-[1.5]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#c1a0fd] to-[#9b7dd4] py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8 lg:px-[96px] text-center">
          <h2 className="font-semibold text-white text-[32px] md:text-[40px] tracking-[-0.8px] leading-[1.15] mb-6">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-[18px] md:text-[20px] text-white leading-[1.5] mb-8 max-w-[600px] mx-auto">
            Rejoignez les centaines de kookers qui ont déjà choisi Weekook pour gérer et développer leur activité culinaire.
          </p>
          <Button
            onClick={() => navigate('/devenir-kooker')}
            className="bg-white text-[#c1a0fd] hover:bg-gray-100 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
          >
            Devenir Kooker gratuitement
          </Button>
        </div>
      </section>
    </div>
  );
}
