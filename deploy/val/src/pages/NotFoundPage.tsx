import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="text-center">
        <ChefHat size={64} className="text-primary mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page non trouvée</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;