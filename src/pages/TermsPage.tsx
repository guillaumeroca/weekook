import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Les présentes Conditions Générales d'Utilisation régissent l'utilisation de la plateforme WEEKOOK, accessible via le site web. En utilisant WEEKOOK, vous acceptez d'être lié par ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Définitions</h2>
            <div className="space-y-2 text-gray-600">
              <p>Dans les présentes conditions générales, les termes suivants sont définis comme suit :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"Plateforme"</strong> désigne le site web WEEKOOK</li>
                <li><strong>"Utilisateur"</strong> désigne toute personne utilisant la Plateforme</li>
                <li><strong>"Kooker"</strong> désigne un utilisateur proposant des services de cuisine</li>
                <li><strong>"Client"</strong> désigne un utilisateur réservant les services d'un Kooker</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Inscription et Compte</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Pour utiliser nos services, vous devez créer un compte. Vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fournir des informations exactes et complètes</li>
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Ne pas créer plusieurs comptes</li>
                <li>Ne pas utiliser le compte d'une autre personne</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Services</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                WEEKOOK est une plateforme de mise en relation entre des Kookers et des Clients pour des services de cuisine à domicile.
              </p>
              <h3 className="font-medium text-gray-800">4.1 Pour les Kookers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Obligation de respecter les normes d'hygiène et de sécurité</li>
                <li>Responsabilité de définir leurs tarifs et disponibilités</li>
                <li>Engagement à fournir un service professionnel</li>
              </ul>
              <h3 className="font-medium text-gray-800">4.2 Pour les Clients</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respect des conditions de réservation</li>
                <li>Paiement des services via la plateforme</li>
                <li>Respect des locaux et du matériel</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Paiements et Commissions</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Tous les paiements sont traités de manière sécurisée via notre plateforme.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Commission de 10% sur chaque transaction</li>
                <li>Paiement sécurisé lors de la réservation</li>
                <li>Versement aux Kookers après la prestation</li>
                <li>Politique de remboursement selon conditions d'annulation</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Responsabilités</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                WEEKOOK agit uniquement en tant qu'intermédiaire entre les Kookers et les Clients.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>WEEKOOK n'est pas responsable de la qualité des prestations</li>
                <li>Les Kookers sont responsables de leurs services</li>
                <li>Les Clients sont responsables de leurs locaux</li>
                <li>Obligation d'assurance pour les Kookers</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Propriété Intellectuelle</h2>
            <p className="text-gray-600">
              Tous les contenus présents sur la plateforme (logos, textes, images, etc.) sont la propriété exclusive de WEEKOOK ou de leurs propriétaires respectifs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Modification des Conditions</h2>
            <p className="text-gray-600">
              WEEKOOK se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés des modifications importantes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant ces conditions, vous pouvez nous contacter à l'adresse : <Link to="/contact" className="text-primary hover:text-primary/80">contact@weekook.fr</Link>
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>Dernière mise à jour : Mars 2024</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;