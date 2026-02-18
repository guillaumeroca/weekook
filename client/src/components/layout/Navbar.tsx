import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Accueil', path: '/' },
  { label: 'Tarification', path: '/tarification' },
  { label: 'Confiance', path: '/confiance' },
  { label: 'A propos', path: '/a-propos' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Auto-close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[#f2f4fc] shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
      <nav className="h-[80px] px-6 lg:px-24 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-[44px] h-[44px] rounded-full bg-[#c1a0fd] flex items-center justify-center">
            <ChefHat className="w-[24px] h-[24px] text-white" />
          </div>
          <span className="font-bold text-[28px] text-[#303044] tracking-[-0.56px]">
            WEEKOOK
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-medium text-[16px] transition-colors ${
                location.pathname === link.path
                  ? 'text-[#c1a0fd]'
                  : 'text-[#303044] hover:text-[#c1a0fd]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth / Profile Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              {/* Kooker or Become Kooker button */}
              {user.kookerProfileId ? (
                <button
                  onClick={() => navigate('/kooker-dashboard')}
                  className="h-[48px] px-6 rounded-[8px] border-2 border-[#c1a0fd] text-[#c1a0fd] font-semibold text-[14px] transition-colors hover:bg-[#c1a0fd] hover:text-[#111125] cursor-pointer"
                >
                  Dashboard Kooker
                </button>
              ) : (
                <button
                  onClick={() => navigate('/devenir-kooker')}
                  className="h-[48px] px-6 rounded-[8px] bg-[#c1a0fd] text-[#111125] font-semibold text-[14px] transition-colors hover:bg-[#b090ed] cursor-pointer"
                >
                  Devenir Kooker
                </button>
              )}

              {/* Profile icon */}
              <button
                onClick={() => navigate('/tableau-de-bord')}
                className="w-[48px] h-[48px] rounded-full bg-[#c1a0fd] flex items-center justify-center transition-colors hover:bg-[#b090ed] cursor-pointer"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                    fill="white"
                  />
                  <path
                    d="M12 14C7.58172 14 4 16.0147 4 18.5V20H20V18.5C20 16.0147 16.4183 14 12 14Z"
                    fill="white"
                  />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/connexion')}
              className="h-[48px] px-6 rounded-[8px] bg-[#c1a0fd] text-[#111125] font-semibold text-[14px] transition-colors hover:bg-[#b090ed] cursor-pointer"
            >
              Se connecter / S'inscrire
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-[48px] h-[48px] rounded-full bg-[#c1a0fd] flex items-center justify-center transition-colors hover:bg-[#b090ed] cursor-pointer"
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileMenuOpen ? (
            <X className="w-[24px] h-[24px] text-white" />
          ) : (
            <Menu className="w-[24px] h-[24px] text-white" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[80px] z-40 bg-[#f2f4fc] overflow-y-auto">
          <div className="flex flex-col px-6 py-8 gap-2">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`p-4 rounded-lg text-[18px] font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#c1a0fd] bg-[#c1a0fd]/10'
                    : 'text-[#303044] hover:text-[#c1a0fd] hover:bg-[#c1a0fd]/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-4 border-t border-[#ece2fe]" />

            {/* Auth Actions */}
            {user ? (
              <>
                <button
                  onClick={() => navigate('/tableau-de-bord')}
                  className="p-4 rounded-lg text-[18px] font-medium text-[#303044] hover:text-[#c1a0fd] hover:bg-[#c1a0fd]/5 transition-colors text-left cursor-pointer"
                >
                  Mon Dashboard
                </button>
                {user.kookerProfileId ? (
                  <button
                    onClick={() => navigate('/kooker-dashboard')}
                    className="mt-2 h-[52px] w-full rounded-[8px] border-2 border-[#c1a0fd] text-[#c1a0fd] font-semibold text-[16px] transition-colors hover:bg-[#c1a0fd] hover:text-[#111125] cursor-pointer"
                  >
                    Dashboard Kooker
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/devenir-kooker')}
                    className="mt-2 h-[52px] w-full rounded-[8px] bg-[#c1a0fd] text-[#111125] font-semibold text-[16px] transition-colors hover:bg-[#b090ed] cursor-pointer"
                  >
                    Devenir Kooker
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate('/connexion')}
                className="mt-2 h-[52px] w-full rounded-[8px] bg-[#c1a0fd] text-[#111125] font-semibold text-[16px] transition-colors hover:bg-[#b090ed] cursor-pointer"
              >
                Se connecter / S'inscrire
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
