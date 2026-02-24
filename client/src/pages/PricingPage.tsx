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
        <h1 className="text-[32px] md:text-[48px] font-semibold text-[#111125] tracking-[-0.96px]">
          Tarification simple et transparente
        </h1>
        <p className="text-[16px] md:text-[20px] text-[#5c5c6f] mt-4 max-w-[700px] mx-auto">
          Choisissez l'offre qui correspond à vos besoins et développez votre activité de kooker en toute sérénité
        </p>

        {/* Launch offer badge */}
        <div className="mt-8 inline-flex items-center gap-2 bg-[#f3ecff] rounded-[12px] px-6 py-3">
          <span className="font-semibold text-[14px] text-[#c1a0fd]">
            🎉 Offre de lancement : 14 jours d'essai gratuit sur tous les plans
          </span>
        </div>
      </section>

      {/* ── Pricing Cards ──────────────────────────────────────────────── */}
      <section className="pb-16 px-4 md:px-8 lg:px-[96px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-[24px] p-8 shadow-sm flex flex-col ${
                plan.highlighted
                  ? 'ring-2 ring-[#c1a0fd] shadow-lg'
                  : ''
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#c1a0fd] text-[#111125] text-[12px] font-semibold px-6 py-2 rounded-[8px] whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-[28px] font-semibold text-[#111125]">{plan.name}</h3>
              <p className="text-[14px] text-[#5c5c6f] mt-1 min-h-[40px]">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-[48px] font-semibold text-[#111125]">{plan.price}€</span>
                <span className="text-[16px] text-[#828294]">/mois</span>
              </div>

              <Button
                onClick={() => navigate(plan.ctaRoute)}
                className={`mt-6 w-full rounded-[12px] font-medium py-3 text-sm cursor-pointer ${
                  plan.highlighted
                    ? 'bg-[#c1a0fd] hover:bg-[#b090ed] text-[#111125]'
                    : 'bg-white border-2 border-[#c1a0fd] text-[#c1a0fd] hover:bg-[#f3ecff]'
                }`}
              >
                {plan.cta}
              </Button>

              <ul className="mt-8 space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="bg-[#e8f5e9] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-[14px] text-[#5c5c6f]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="pb-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto bg-white rounded-[24px] p-8 shadow-sm">
          <h2 className="text-[32px] font-semibold text-[#111125] text-center mb-6">
            Questions fréquentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question}>
                <h3 className="text-[18px] font-semibold text-[#111125] mb-2">
                  {item.question}
                </h3>
                <p className="text-[14px] text-[#5c5c6f] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Gradient ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 md:px-8 lg:px-[96px]">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#c1a0fd] to-[#d4b8ff] rounded-[24px] p-8 md:p-12 text-center">
          <h2 className="text-[28px] md:text-[36px] font-semibold text-[#111125] mb-4">
            Prêt à commencer votre aventure culinaire ?
          </h2>
          <p className="text-[18px] text-[#303044] max-w-[600px] mx-auto mb-8">
            Rejoignez des centaines de kookers qui partagent leur passion de la cuisine avec Weekook
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/inscription')}
              className="bg-[#111125] hover:bg-[#303044] text-white font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              Créer mon compte kooker
            </Button>
            <Button
              onClick={() => navigate('/avantages')}
              variant="outline"
              className="bg-white border-2 border-[#111125] text-[#111125] hover:bg-gray-50 font-medium px-8 py-3 rounded-[12px] text-sm cursor-pointer"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
