import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Plan Data ──────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Essentiel',
    price: 19,
    description: 'Pour démarrer et tester la plateforme',
    highlighted: false,
    badge: null,
    cta: 'Commencer gratuitement',
    ctaRoute: '/inscription',
    features: [
      'Profil kooker personnalisé',
      'Jusqu\'à 5 offres actives',
      'Gestion des réservations',
      'Messagerie intégrée',
      'Statistiques de base',
      'Support par email',
    ],
  },
  {
    name: 'Professionnel',
    price: 39,
    description: 'Pour les kookers qui veulent se développer',
    highlighted: true,
    badge: 'Le plus populaire',
    cta: 'Essayer gratuitement 14 jours',
    ctaRoute: '/inscription',
    features: [
      'Profil kooker personnalisé',
      'Offres illimitées',
      'Gestion des réservations',
      'Messagerie intégrée',
      'Statistiques avancées',
      'Support prioritaire',
      'Mise en avant dans la recherche',
      'Badge "Kooker Pro"',
    ],
  },
  {
    name: 'Premium',
    price: 79,
    description: 'Pour les professionnels exigeants',
    highlighted: false,
    badge: null,
    cta: 'Nous contacter',
    ctaRoute: '/contact',
    features: [
      'Profil kooker personnalisé',
      'Offres illimitées',
      'Gestion des réservations',
      'Messagerie intégrée',
      'Statistiques détaillées & export',
      'Support dédié 7j/7',
      'Page profil premium',
      'Accompagnement personnalisé',
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer:
      'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement prend effet immédiatement et le montant est calculé au prorata.',
  },
  {
    question: 'Y a-t-il des frais cachés ?',
    answer:
      'Non, nos tarifs sont transparents. Le prix affiché est le prix que vous payez. Aucune commission supplémentaire sur vos réservations.',
  },
  {
    question: 'Comment fonctionne l\'essai gratuit ?',
    answer:
      'Vous bénéficiez de 14 jours d\'accès complet au plan choisi. Aucune carte bancaire n\'est requise pour démarrer l\'essai.',
  },
  {
    question: 'Puis-je annuler mon abonnement ?',
    answer:
      'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L\'accès reste actif jusqu\'à la fin de la période payée.',
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function PricingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Tarification | Weekook';
  }, []);

  return (
    <div className="bg-[#f2f4fc] min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-8 px-4 md:px-8 lg:px-[96px] text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-[#111125]">
          Tarification simple et transparente
        </h1>
        <p className="text-base md:text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
          Choisissez le plan qui correspond à vos besoins. Tous nos plans incluent
          les fonctionnalités essentielles pour gérer votre activité de kooker.
        </p>

        {/* Launch offer badge */}
        <div className="mt-8 inline-flex items-center gap-2 bg-white border border-[#c1a0fd]/30 rounded-full px-6 py-3 shadow-sm">
          <span className="text-sm md:text-base font-medium text-[#111125]">
            Offre de lancement : 14 jours d'essai gratuit sur tous les plans
          </span>
        </div>
      </section>

      {/* ── Pricing Cards ──────────────────────────────────────────────── */}
      <section className="pb-16 px-4 md:px-8 lg:px-[96px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-[20px] p-6 md:p-8 shadow-sm flex flex-col ${
                plan.highlighted
                  ? 'ring-2 ring-[#c1a0fd] shadow-md'
                  : ''
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#c1a0fd] text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold text-[#111125]">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#111125]">{plan.price}€</span>
                <span className="text-gray-500 text-sm">/mois</span>
              </div>

              <Button
                onClick={() => navigate(plan.ctaRoute)}
                className={`mt-6 w-full rounded-[12px] font-medium py-3 text-sm cursor-pointer ${
                  plan.highlighted
                    ? 'bg-[#c1a0fd] hover:bg-[#b090ed] text-white'
                    : 'bg-[#111125] hover:bg-[#111125]/90 text-white'
                }`}
              >
                {plan.cta}
              </Button>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-[#111125]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px] bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-[#111125] text-center">
          Questions fréquentes
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.question}
              className="bg-[#f2f4fc] rounded-[20px] p-6"
            >
              <h3 className="text-base font-semibold text-[#111125]">
                {item.question}
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Gradient ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#c1a0fd] to-[#8b6fd1] rounded-[20px] p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Prêt à lancer votre activité de kooker ?
          </h2>
          <p className="mt-3 text-white/80 text-base max-w-xl mx-auto">
            Rejoignez des centaines de kookers qui partagent leur passion culinaire
            sur Weekook.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/inscription')}
              className="bg-white text-[#111125] hover:bg-gray-100 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              Créer mon compte kooker
            </Button>
            <Button
              onClick={() => navigate('/avantages')}
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
