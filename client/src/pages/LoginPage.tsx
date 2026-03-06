import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, Eye, EyeOff, ChevronLeft } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, register } = useAuth();

  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setLoginError('');
    setRegisterError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const loggedUser = await login(loginEmail, loginPassword);
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.kookerProfileId) navigate('/tableau-de-bord');
      else navigate('/');
    } catch (err: any) {
      setLoginError(err?.error || err?.response?.data?.error || err?.message || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (registerPassword.length < 8) {
      setRegisterError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (!acceptTerms) {
      setRegisterError('Vous devez accepter les conditions d\'utilisation.');
      return;
    }

    setRegisterLoading(true);

    try {
      await register({ email: registerEmail, password: registerPassword, firstName: registerFirstName, lastName: registerLastName });
      navigate('/');
    } catch (err: any) {
      setRegisterError(err?.error || err?.response?.data?.error || err?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 lg:px-16 xl:px-20 py-6 bg-white relative overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-[#828294] hover:text-[#303044] transition-colors font-medium text-[14px]"
        >
          <ChevronLeft className="size-4" />
          Retour
        </button>

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3 h-[36px]">
            <div className="bg-[#c1a0fd] w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0">
              <ChefHat className="size-5 text-white" />
            </div>
            <p className="font-bold leading-[1.2] text-[#303044] text-[28px] text-center tracking-[-0.56px]">WEEKOOK</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[440px] w-full mx-auto">
          {/* Tabs */}
          <div className="bg-[#f3ecff] h-[48px] rounded-[12px] p-1 flex mb-6">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 h-full rounded-[8px] text-[14px] font-medium transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-[#303044] shadow-sm'
                  : 'text-[#828294] hover:text-[#5c5c6f]'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 h-full rounded-[8px] text-[14px] font-medium transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-[#303044] shadow-sm'
                  : 'text-[#828294] hover:text-[#5c5c6f]'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[8px] text-[13px]">
                  {loginError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="login-email" className="font-medium text-[14px] text-[#303044] block">
                  Adresse email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full h-[48px] px-4 border border-[#e6e6f0] rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="font-medium text-[14px] text-[#303044]">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    className="font-medium text-[13px] text-[#c1a0fd] hover:text-[#b090ed] transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-[48px] px-4 pr-12 border border-[#e6e6f0] rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#828294] hover:text-[#303044] transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full h-[52px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-semibold text-[16px] rounded-[12px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {loginLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Se connecter'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e6e6f0]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[13px] text-[#828294]">
                    Ou continuer avec
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-[48px] border-2 border-[#e6e6f0] rounded-[8px] hover:border-[#c1a0fd]/50 hover:bg-[#f3ecff]/30 transition-all font-medium text-[14px] text-[#303044]"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-[48px] border-2 border-[#e6e6f0] rounded-[8px] hover:border-[#c1a0fd]/50 hover:bg-[#f3ecff]/30 transition-all font-medium text-[14px] text-[#303044]"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Register link */}
              <p className="text-center text-[13px] text-[#828294] mt-6">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="text-[#c1a0fd] hover:text-[#b090ed] font-semibold transition-colors"
                >
                  Créer un compte
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {registerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[8px] text-[13px]">
                  {registerError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="signup-first" className="font-medium text-[14px] text-[#303044] block">
                    Prénom
                  </label>
                  <input
                    id="signup-first"
                    type="text"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    placeholder="Jean"
                    required
                    className="w-full h-[48px] px-4 border border-[#e6e6f0] rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-last" className="font-medium text-[14px] text-[#303044] block">
                    Nom
                  </label>
                  <input
                    id="signup-last"
                    type="text"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    placeholder="Dupont"
                    required
                    className="w-full h-[48px] px-4 border border-[#e6e6f0] rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-email" className="font-medium text-[14px] text-[#303044] block">
                  Adresse email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full h-[48px] px-4 border border-[#e6e6f0] rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-password" className="font-medium text-[14px] text-[#303044] block">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                    className="w-full h-[48px] px-4 pr-12 border border-[#e6e6f0] rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#828294] hover:text-[#303044] transition-colors"
                  >
                    {showRegisterPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {registerPassword.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    <div className={`h-1 flex-1 rounded-full ${registerPassword.length >= 2 ? (registerPassword.length >= 8 ? 'bg-green-400' : 'bg-yellow-400') : 'bg-[#e6e6f0]'}`} />
                    <div className={`h-1 flex-1 rounded-full ${registerPassword.length >= 5 ? (registerPassword.length >= 8 ? 'bg-green-400' : 'bg-yellow-400') : 'bg-[#e6e6f0]'}`} />
                    <div className={`h-1 flex-1 rounded-full ${registerPassword.length >= 8 ? 'bg-green-400' : 'bg-[#e6e6f0]'}`} />
                    <div className={`h-1 flex-1 rounded-full ${registerPassword.length >= 12 ? 'bg-green-400' : 'bg-[#e6e6f0]'}`} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-confirm" className="font-medium text-[14px] text-[#303044] block">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showRegisterConfirm ? 'text' : 'password'}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    required
                    className={`w-full h-[48px] px-4 pr-12 border rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:ring-2 transition-all ${
                      registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                        : 'border-[#e6e6f0] focus:border-[#c1a0fd] focus:ring-[#c1a0fd]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#828294] hover:text-[#303044] transition-colors"
                  >
                    {showRegisterConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword && (
                  <p className="text-[12px] text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#e6e6f0] text-[#c1a0fd] focus:ring-[#c1a0fd]"
                />
                <label htmlFor="terms" className="text-[12px] text-[#828294] leading-[1.4]">
                  J'accepte les{' '}
                  <a href="#" className="text-[#c1a0fd] hover:text-[#b090ed] transition-colors">
                    conditions générales
                  </a>
                  {' '}et la{' '}
                  <a href="#" className="text-[#c1a0fd] hover:text-[#b090ed] transition-colors">
                    politique de confidentialité
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={registerLoading || !acceptTerms}
                className="w-full h-[52px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-semibold text-[16px] rounded-[12px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {registerLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Créer mon compte'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e6e6f0]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[13px] text-[#828294]">
                    Ou continuer avec
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-[48px] border-2 border-[#e6e6f0] rounded-[8px] hover:border-[#c1a0fd]/50 hover:bg-[#f3ecff]/30 transition-all font-medium text-[14px] text-[#303044]"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-[48px] border-2 border-[#e6e6f0] rounded-[8px] hover:border-[#c1a0fd]/50 hover:bg-[#f3ecff]/30 transition-all font-medium text-[14px] text-[#303044]"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Login link */}
              <p className="text-center text-[13px] text-[#828294] mt-6">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="text-[#c1a0fd] hover:text-[#b090ed] font-semibold transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Image & Info */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://plus.unsplash.com/premium_photo-1683707120428-8893fe258de8?q=80&w=1171&auto=format&fit=crop"
            alt="Cooking community"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Black Overlay 60% */}
        <div className="absolute inset-0 bg-black opacity-60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center px-12 text-white w-full">
          <div className="max-w-[480px] w-full">
            {/* Logo centré */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3 h-[36px]">
                <div className="bg-[#c1a0fd] w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0">
                  <ChefHat className="size-5 text-white" />
                </div>
                <p className="font-bold leading-[1.2] text-white text-[28px] text-center tracking-[-0.56px]">WEEKOOK</p>
              </div>
            </div>

            <h3 className="font-semibold text-[28px] tracking-[-0.56px] mb-3 text-center">
              Rejoignez la communauté Weekook
            </h3>
            <p className="text-[16px] leading-[1.5] text-white/90 mb-6 text-center">
              Découvrez des kookers passionnés près de chez vous et vivez des expériences culinaires uniques.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-2 mt-0.5">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[16px] mb-0.5">
                    Des cours de cuisine authentiques
                  </p>
                  <p className="text-[14px] text-white/80 leading-[1.4]">
                    Apprenez auprès de passionnés dans votre région
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-2 mt-0.5">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[16px] mb-0.5">
                    Des repas préparés avec amour
                  </p>
                  <p className="text-[14px] text-white/80 leading-[1.4]">
                    Savourez des plats faits maison livrés chez vous
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full p-2 mt-0.5">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[16px] mb-0.5">
                    Une communauté bienveillante
                  </p>
                  <p className="text-[14px] text-white/80 leading-[1.4]">
                    Partagez votre passion avec des milliers de membres
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
