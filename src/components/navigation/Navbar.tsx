import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Menu, X, Settings, ChefHat as KookerIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat size={28} className="text-primary" />
              <span className="text-xl font-bold text-primary">WEEKOOK</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link to="/settings" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                  <Settings size={18} />
                  Mon profil
                </Link>
                {user.isKooker && (
                  <Link to="/kooker-settings" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                    <KookerIcon size={18} />
                    Profil Kooker
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Se connecter
                </Link>
                <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            {user ? (
              <>
                <Link 
                  to="/settings" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={18} />
                  Mon profil
                </Link>
                {user.isKooker && (
                  <Link 
                    to="/kooker-settings" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <KookerIcon size={18} />
                    Profil Kooker
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;