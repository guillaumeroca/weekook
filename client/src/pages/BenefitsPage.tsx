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
  Headphones,
  Lightbulb,
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
    icon: Headphones,
    title: 'Support réactif',
    description:
      'Notre équipe support est disponible par chat et email pour répondre à toutes vos questions rapidement.',
  },
  {
    icon: Lightbulb,
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
      <section className="pt-16 pb-12 px-4 md:px-8 lg:px-[96px] text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#c1a0fd]/15 text-[#c1a0fd] text-sm font-medium px-4 py-1.5 rounded-full">
            Pour les Kookers
          </span>
          <h1 className="mt-6 text-3xl md:text-5xl font-bold text-[#111125]">
            Les avantages Weekook pour les Kookers
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
            Weekook vous fournit tous les outils nécessaires pour développer votre
            activité culinaire et vous concentrer sur l'essentiel : la cuisine.
          </p>
        </div>
      </section>

      {/* ── Benefits Grid ──────────────────────────────────────────────── */}
      <section className="pb-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-white rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-[12px] bg-[#c1a0fd]/15 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#c1a0fd]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#111125]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Feature Highlight ──────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px] bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#111125]">
              Moins d'administration, plus de cuisine
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Notre plateforme automatise les tâches administratives pour que vous
              puissiez vous concentrer sur votre passion. Gestion des réservations,
              facturation, communication avec les clients : tout est centralisé
              dans votre tableau de bord.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Tableau de bord intuitif et complet',
                'Notifications en temps réel',
                'Facturation automatique',
                'Historique des réservations',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#c1a0fd] shrink-0" />
                  <span className="text-sm text-[#111125]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[20px] overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop"
              alt="Kooker en cuisine"
              className="w-full h-[300px] md:h-[380px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Support Section ────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#111125] text-center">
            Un accompagnement à chaque étape
          </h2>
          <p className="mt-4 text-gray-500 text-center max-w-2xl mx-auto">
            Nous sommes à vos côtés pour vous aider à réussir sur Weekook.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPPORT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-[20px] p-6 shadow-sm text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-[#c1a0fd]/15 flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6 text-[#c1a0fd]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#111125]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#c1a0fd] to-[#8b6fd1] rounded-[20px] p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Prêt à partager votre talent culinaire ?
          </h2>
          <p className="mt-3 text-white/80 text-base max-w-xl mx-auto">
            Inscrivez-vous gratuitement et commencez à recevoir des réservations
            dès aujourd'hui.
          </p>
          <Button
            onClick={() => navigate('/devenir-kooker')}
            className="mt-8 bg-white text-[#111125] hover:bg-gray-100 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
          >
            Devenir Kooker gratuitement
          </Button>
        </div>
      </section>
    </div>
  );
}
