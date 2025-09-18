import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat size={24} className="text-primary" />
              <span className="text-xl font-bold text-white">WEEKOOK</span>
            </Link>
            <p className="mt-4 text-gray-300">
              La plateforme qui connecte les chefs à domicile et les amateurs de bonne cuisine.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-primary transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-300 hover:text-primary transition-colors">
                  S'inscrire
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Devenir Kooker</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                  Avantages
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                  Tarification
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-primary transition-colors">
                  Termes et conditions
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} WEEKOOK. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;