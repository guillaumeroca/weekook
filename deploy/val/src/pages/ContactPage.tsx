import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-600">
            Une question ? N'hésitez pas à nous contacter
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nos coordonnées</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">contact@weekook.fr</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Téléphone</h3>
                  <p className="text-gray-600">01 23 45 67 89</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Adresse</h3>
                  <p className="text-gray-600">
                    123 Avenue des Champs-Élysées<br />
                    75008 Paris<br />
                    France
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-4">Horaires d'ouverture</h3>
              <div className="space-y-2 text-gray-600">
                <p>Lundi - Vendredi : 9h00 - 18h00</p>
                <p>Samedi : 10h00 - 16h00</p>
                <p>Dimanche : Fermé</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="general">Question générale</option>
                  <option value="support">Support technique</option>
                  <option value="billing">Facturation</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Votre message..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Envoyer le message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Vous pouvez également consulter notre FAQ pour des réponses aux questions fréquentes
          </p>
          <a
            href="/faq"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Voir la FAQ
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;