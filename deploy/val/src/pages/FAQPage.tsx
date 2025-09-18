import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Général",
    question: "Qu'est-ce que WEEKOOK ?",
    answer: "WEEKOOK est super et est vraiment cool une plateforme qui met en relation des passionnés de cuisine (Kookers) avec des personnes souhaitant apprendre ou profiter d'une expérience culinaire à domicile."
  },
  {
    category: "Général",
    question: "Comment fonctionne le service ?",
    answer: "Les Kookers proposent leurs services (cours de cuisine, ateliers, repas à domicile) et les utilisateurs peuvent les réserver en fonction de leurs disponibilités et de leurs préférences."
  },
  {
    category: "Réservations",
    question: "Comment réserver un Kooker ?",
    answer: "Vous pouvez rechercher un Kooker selon vos critères (lieu, spécialité, disponibilité), consulter son profil et ses avis, puis effectuer une réservation pour la date et l'horaire qui vous conviennent."
  },
  {
    category: "Réservations",
    question: "Puis-je annuler une réservation ?",
    answer: "Oui, vous pouvez annuler une réservation jusqu'à 48h avant la prestation. Les conditions de remboursement dépendent du délai d'annulation."
  },
  {
    category: "Devenir Kooker",
    question: "Comment devenir Kooker ?",
    answer: "Pour devenir Kooker, inscrivez-vous sur la plateforme, complétez votre profil avec vos spécialités et expériences, puis définissez vos disponibilités et tarifs."
  },
  {
    category: "Devenir Kooker",
    question: "Quels sont les prérequis pour être Kooker ?",
    answer: "Vous devez être passionné de cuisine, avoir une bonne maîtrise de vos spécialités, et respecter les normes d'hygiène et de sécurité alimentaire."
  },
  {
    category: "Paiements",
    question: "Comment fonctionne le paiement ?",
    answer: "Les paiements sont sécurisés et traités via notre plateforme. Le montant est débité au moment de la réservation et versé au Kooker après la prestation."
  },
  {
    category: "Paiements",
    question: "Quels sont les frais de service ?",
    answer: "WEEKOOK prélève une commission de 10% sur chaque transaction pour couvrir les frais de service et de maintenance de la plateforme."
  }
];

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h1>
          <p className="text-lg text-gray-600">
            Tout ce que vous devez savoir sur WEEKOOK
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {categories.map((category) => (
            <div key={category} className="border-b last:border-b-0">
              <h2 className="text-xl font-semibold p-6 bg-gray-50">{category}</h2>
              <div className="divide-y">
                {faqs
                  .filter(faq => faq.category === category)
                  .map((faq, index) => {
                    const absoluteIndex = faqs.findIndex(f => f === faq);
                    const isOpen = openItems.includes(absoluteIndex);

                    return (
                      <div key={index} className="hover:bg-gray-50/50">
                        <button
                          onClick={() => toggleItem(absoluteIndex)}
                          className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="flex-shrink-0 text-gray-400" size={20} />
                          ) : (
                            <ChevronDown className="flex-shrink-0 text-gray-400" size={20} />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 text-gray-600">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Vous n'avez pas trouvé la réponse à votre question ?</p>
          <button className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors">
            Contactez-nous
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;