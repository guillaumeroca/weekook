import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Menu, X, Settings, ChefHat as KookerIcon, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messagesAPI } from '../../api/messages';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer si on est dans l'espace Kooker (administration)
  const isKookerSpace = location.pathname.startsWith('/kooker-') || location.pathname === '/kooker';

  // Classes CSS conditionnelles
  const navClasses = isKookerSpace
    ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg'
    : 'bg-white shadow-sm';
  const logoClasses = isKookerSpace
    ? 'text-white'
    : 'text-primary';
  const linkClasses = isKookerSpace
    ? 'text-orange-100 hover:text-white'
    : 'text-gray-700 hover:text-primary';
  const buttonClasses = isKookerSpace
    ? 'text-orange-100 hover:text-white'
    : 'text-gray-700 hover:text-primary';

  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const response = await messagesAPI.getUnreadCount(user.id);
      if (response.success && response.count !== undefined) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className={`${navClasses} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ChefHat size={28} className={logoClasses} />
              <span className={`text-xl font-bold ${logoClasses}`}>WEEKOOK</span>
              {isKookerSpace && <span className="text-orange-200 text-sm ml-2">Espace Kooker</span>}
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link to="/messages" className={`${linkClasses} px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 relative`}>
                  <MessageCircle size={18} />
                  Messages
                  {unreadCount > 0 && (
                    <span className={`${isKookerSpace ? 'bg-white text-orange-500' : 'bg-primary text-white'} text-xs px-2 py-1 rounded-full absolute -top-1 -right-1`}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/user-dashboard" className={`${linkClasses} px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2`}>
                  <Settings size={18} />
                  Mon WeeKooK
                </Link>
                {user.isKooker && (
                  <Link to="/kooker-dashboard" className={`${linkClasses} px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2`}>
                    <KookerIcon size={18} />
                    Mon espace Kooker
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`${buttonClasses} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
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
              className={buttonClasses}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg ${isKookerSpace ? 'bg-gradient-to-b from-orange-500 to-orange-600' : 'bg-white'}`}>
            {user ? (
              <>
                <Link
                  to="/messages"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${linkClasses} transition-colors relative`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageCircle size={18} />
                  Messages
                  {unreadCount > 0 && (
                    <span className={`${isKookerSpace ? 'bg-white text-orange-500' : 'bg-primary text-white'} text-xs px-2 py-1 rounded-full ml-auto`}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/user-dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${linkClasses} transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={18} />
                  Mon WeeKooK
                </Link>
                {user.isKooker && (
                  <Link
                    to="/kooker-dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${linkClasses} transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <KookerIcon size={18} />
                    Mon espace Kooker
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${buttonClasses} transition-colors`}
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