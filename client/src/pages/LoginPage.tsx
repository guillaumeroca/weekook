import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
      await login(loginEmail, loginPassword);
      navigate('/tableau-de-bord');
    } catch (err: any) {
      setLoginError(err?.response?.data?.error || err?.message || 'Erreur de connexion. Vérifiez vos identifiants.');
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
      navigate('/tableau-de-bord');
    } catch (err: any) {
      setRegisterError(err?.response?.data?.error || err?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f2f4fc]">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 md:px-8 lg:px-16 py-8 lg:py-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-[480px]">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#111125]/60 hover:text-[#111125] transition-colors mb-8 group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[14px] font-medium">Retour</span>
          </button>

          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#111125]">
              week<span className="text-[#c1a0fd]">ook</span>
            </h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[24px] md:text-[28px] font-bold text-[#111125] mb-2">
              {activeTab === 'login' ? 'Content de vous revoir !' : 'Créez votre compte'}
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#111125]/60">
              {activeTab === 'login'
                ? 'Connectez-vous pour accéder à votre espace personnel.'
                : 'Rejoignez la communauté Weekook et découvrez des kookers près de chez vous.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#e8eaf5] rounded-[12px] p-1 mb-8">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-[#111125] shadow-sm'
                  : 'text-[#111125]/50 hover:text-[#111125]/70'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-3 text-[14px] font-semibold rounded-[10px] transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-[#111125] shadow-sm'
                  : 'text-[#111125]/50 hover:text-[#111125]/70'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] text-[13px]">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-[#111125] mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111125]/40">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H15C15.825 3 16.5 3.675 16.5 4.5V13.5C16.5 14.325 15.825 15 15 15H3C2.175 15 1.5 14.325 1.5 13.5V4.5C1.5 3.675 2.175 3 3 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.5 4.5L9 9.75L1.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full h-[48px] pl-11 pr-4 bg-white border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111125] mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111125]/40">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="8.25" width="12" height="8.25" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.25 8.25V5.25C5.25 3.17893 6.92893 1.5 9 1.5C11.0711 1.5 12.75 3.17893 12.75 5.25V8.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                    className="w-full h-[48px] pl-11 pr-12 bg-white border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#111125]/40 hover:text-[#111125]/60 transition-colors"
                  >
                    {showLoginPassword ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.25 2.25L15.75 15.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M7.05 7.05C6.39 7.71 6 8.61 6 9.6C6 11.26 7.34 12.6 9 12.6C9.99 12.6 10.89 12.21 11.55 11.55" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M3.27 5.04C1.97 6.24 1.05 7.78 0.75 9.6C1.65 13.5 5 16.35 9 16.35C10.59 16.35 12.07 15.9 13.35 15.12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M15.36 13.14C16.43 12.01 17.21 10.63 17.55 9.06C16.65 5.16 13.3 2.31 9.3 2.31C8.55 2.31 7.83 2.41 7.14 2.61" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 9C1.5 9 4.125 3.75 9 3.75C13.875 3.75 16.5 9 16.5 9C16.5 9 13.875 14.25 9 14.25C4.125 14.25 1.5 9 1.5 9Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="9" r="2.625" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#e0e2ef] text-[#c1a0fd] focus:ring-[#c1a0fd]/30"
                  />
                  <span className="text-[13px] text-[#111125]/60">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-[13px] text-[#c1a0fd] hover:text-[#b090ed] font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full h-[48px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-semibold text-[14px] rounded-[12px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e0e2ef]" />
                </div>
                <div className="relative flex justify-center text-[13px]">
                  <span className="px-4 bg-[#f2f4fc] text-[#111125]/40">ou continuer avec</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center h-[48px] bg-white border border-[#e0e2ef] rounded-[12px] hover:bg-[#f8f8fc] hover:border-[#c1a0fd]/30 transition-all duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.1713 8.36788H17.5V8.33329H10V11.6666H14.7096C14.0225 13.6071 12.1763 15 10 15C7.23875 15 5 12.7612 5 9.99996C5 7.23871 7.23875 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1858 2.52204 12.195 1.66663 10 1.66663C5.39792 1.66663 1.66667 5.39788 1.66667 9.99996C1.66667 14.602 5.39792 18.3333 10 18.3333C14.6021 18.3333 18.3333 14.602 18.3333 9.99996C18.3333 9.44121 18.2758 8.89579 18.1713 8.36788Z" fill="#FFC107"/>
                    <path d="M2.6275 6.12121L5.36542 8.12913C6.10625 6.29496 7.90042 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1858 2.52204 12.195 1.66663 10 1.66663C6.79917 1.66663 4.02333 3.47371 2.6275 6.12121Z" fill="#FF3D00"/>
                    <path d="M10 18.3334C12.1525 18.3334 14.1084 17.5096 15.5871 16.17L13.0079 13.9875C12.1432 14.6452 11.0865 15.0009 10 15C7.8325 15 5.99208 13.618 5.29875 11.6892L2.58125 13.783C3.96042 16.4817 6.76125 18.3334 10 18.3334Z" fill="#4CAF50"/>
                    <path d="M18.1713 8.36796H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.988L13.0079 13.9871L15.5871 16.1696C15.4046 16.3355 18.3333 14.1667 18.3333 10C18.3333 9.44129 18.2758 8.89587 18.1713 8.36796Z" fill="#1976D2"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center h-[48px] bg-white border border-[#e0e2ef] rounded-[12px] hover:bg-[#f8f8fc] hover:border-[#c1a0fd]/30 transition-all duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 14.9912 3.65684 19.1283 8.4375 19.8785V12.8906H5.89844V10H8.4375V7.79688C8.4375 5.29063 9.93047 3.90625 12.2146 3.90625C13.3084 3.90625 14.4531 4.10156 14.4531 4.10156V6.5625H13.1922C11.9499 6.5625 11.5625 7.3334 11.5625 8.125V10H14.3359L13.8926 12.8906H11.5625V19.8785C16.3432 19.1283 20 14.9912 20 10Z" fill="#1877F2"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center h-[48px] bg-white border border-[#e0e2ef] rounded-[12px] hover:bg-[#f8f8fc] hover:border-[#c1a0fd]/30 transition-all duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.0504 6.88C17.0504 6.74 17.0504 6.6 17.0404 6.46C15.7604 6.46 14.8204 5.58 14.6604 4.36H14.6504C14.4704 4.36 14.3004 4.44 14.1504 4.54C13.5004 5 12.7004 5.26 11.8404 5.26C10.9804 5.26 10.1904 5 9.54043 4.54C9.39043 4.44 9.22043 4.36 9.04043 4.36H9.03043C8.87043 5.58 7.93043 6.46 6.65043 6.46C6.64043 6.6 6.64043 6.74 6.64043 6.88C6.64043 10.64 8.86043 13.66 11.8404 13.66C14.8204 13.66 17.0504 10.64 17.0504 6.88Z" fill="#111125"/>
                    <path d="M14.6602 2C14.6602 2 14.2402 4.36 11.8402 4.36C9.44023 4.36 9.03023 2 9.03023 2" stroke="#111125" strokeWidth="1.2"/>
                    <path d="M11.8398 13.66V18" stroke="#111125" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M9.24023 16.08H14.4402" stroke="#111125" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Register link */}
              <p className="text-center text-[13px] text-[#111125]/60 mt-6">
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
            <form onSubmit={handleRegister} className="space-y-5">
              {registerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] text-[13px]">
                  {registerError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#111125] mb-1.5">
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111125]/40">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 15.75V14.25C15 13.4544 14.6839 12.6913 14.1213 12.1287C13.5587 11.5661 12.7956 11.25 12 11.25H6C5.20435 11.25 4.44129 11.5661 3.87868 12.1287C3.31607 12.6913 3 13.4544 3 14.25V15.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="5.25" r="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      placeholder="Jean"
                      required
                      className="w-full h-[48px] pl-11 pr-4 bg-white border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#111125] mb-1.5">
                    Nom
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111125]/40">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 15.75V14.25C15 13.4544 14.6839 12.6913 14.1213 12.1287C13.5587 11.5661 12.7956 11.25 12 11.25H6C5.20435 11.25 4.44129 11.5661 3.87868 12.1287C3.31607 12.6913 3 13.4544 3 14.25V15.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="5.25" r="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      placeholder="Dupont"
                      required
                      className="w-full h-[48px] pl-11 pr-4 bg-white border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111125] mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111125]/40">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H15C15.825 3 16.5 3.675 16.5 4.5V13.5C16.5 14.325 15.825 15 15 15H3C2.175 15 1.5 14.325 1.5 13.5V4.5C1.5 3.675 2.175 3 3 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.5 4.5L9 9.75L1.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full h-[48px] pl-11 pr-4 bg-white border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111125] mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111125]/40">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="8.25" width="12" height="8.25" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.25 8.25V5.25C5.25 3.17893 6.92893 1.5 9 1.5C11.0711 1.5 12.75 3.17893 12.75 5.25V8.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
                    className="w-full h-[48px] pl-11 pr-12 bg-white border border-[#e0e2ef] rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#111125]/40 hover:text-[#111125]/60 transition-colors"
                  >
                    {showRegisterPassword ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.25 2.25L15.75 15.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M7.05 7.05C6.39 7.71 6 8.61 6 9.6C6 11.26 7.34 12.6 9 12.6C9.99 12.6 10.89 12.21 11.55 11.55" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 9C1.5 9 4.125 3.75 9 3.75C13.875 3.75 16.5 9 16.5 9C16.5 9 13.875 14.25 9 14.25C4.125 14.25 1.5 9 1.5 9Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="9" r="2.625" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {/* Password strength indicator */}
                {registerPassword.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    <div className={`h-1 flex-1 rounded-full ${registerPassword.length >= 2 ? (registerPassword.length >= 8 ? 'bg-green-400' : 'bg-yellow-400') : 'bg-[#e0e2ef]'}`} />
                    <div className={`h-1 flex-1 rounded-full ${registerPassword.length >= 5 ? (registerPassword.length >= 8 ? 'bg-green-400' : 'bg-yellow-400') : 'bg-[#e0e2ef]'}`} />
                    <div className={`h-1 flex-1 rounded-full ${registerPassword.length >= 8 ? 'bg-green-400' : 'bg-[#e0e2ef]'}`} />
                    <div className={`h-1 flex-1 rounded-full ${registerPassword.length >= 12 ? 'bg-green-400' : 'bg-[#e0e2ef]'}`} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111125] mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111125]/40">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="8.25" width="12" height="8.25" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.25 8.25V5.25C5.25 3.17893 6.92893 1.5 9 1.5C11.0711 1.5 12.75 3.17893 12.75 5.25V8.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type={showRegisterConfirm ? 'text' : 'password'}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    required
                    className={`w-full h-[48px] pl-11 pr-12 bg-white border rounded-[12px] text-[14px] text-[#111125] placeholder:text-[#111125]/30 focus:outline-none focus:ring-2 transition-all ${
                      registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                        : 'border-[#e0e2ef] focus:border-[#c1a0fd] focus:ring-[#c1a0fd]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#111125]/40 hover:text-[#111125]/60 transition-colors"
                  >
                    {showRegisterConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.25 2.25L15.75 15.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M7.05 7.05C6.39 7.71 6 8.61 6 9.6C6 11.26 7.34 12.6 9 12.6C9.99 12.6 10.89 12.21 11.55 11.55" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 9C1.5 9 4.125 3.75 9 3.75C13.875 3.75 16.5 9 16.5 9C16.5 9 13.875 14.25 9 14.25C4.125 14.25 1.5 9 1.5 9Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="9" r="2.625" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {registerConfirmPassword.length > 0 && registerPassword !== registerConfirmPassword && (
                  <p className="text-[12px] text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#e0e2ef] text-[#c1a0fd] focus:ring-[#c1a0fd]/30"
                />
                <span className="text-[13px] text-[#111125]/60 leading-relaxed">
                  J'accepte les{' '}
                  <a href="/terms" className="text-[#c1a0fd] hover:text-[#b090ed] font-medium">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="/privacy" className="text-[#c1a0fd] hover:text-[#b090ed] font-medium">
                    politique de confidentialité
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={registerLoading || !acceptTerms}
                className="w-full h-[48px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white font-semibold text-[14px] rounded-[12px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e0e2ef]" />
                </div>
                <div className="relative flex justify-center text-[13px]">
                  <span className="px-4 bg-[#f2f4fc] text-[#111125]/40">ou continuer avec</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center h-[48px] bg-white border border-[#e0e2ef] rounded-[12px] hover:bg-[#f8f8fc] hover:border-[#c1a0fd]/30 transition-all duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.1713 8.36788H17.5V8.33329H10V11.6666H14.7096C14.0225 13.6071 12.1763 15 10 15C7.23875 15 5 12.7612 5 9.99996C5 7.23871 7.23875 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1858 2.52204 12.195 1.66663 10 1.66663C5.39792 1.66663 1.66667 5.39788 1.66667 9.99996C1.66667 14.602 5.39792 18.3333 10 18.3333C14.6021 18.3333 18.3333 14.602 18.3333 9.99996C18.3333 9.44121 18.2758 8.89579 18.1713 8.36788Z" fill="#FFC107"/>
                    <path d="M2.6275 6.12121L5.36542 8.12913C6.10625 6.29496 7.90042 4.99996 10 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1858 2.52204 12.195 1.66663 10 1.66663C6.79917 1.66663 4.02333 3.47371 2.6275 6.12121Z" fill="#FF3D00"/>
                    <path d="M10 18.3334C12.1525 18.3334 14.1084 17.5096 15.5871 16.17L13.0079 13.9875C12.1432 14.6452 11.0865 15.0009 10 15C7.8325 15 5.99208 13.618 5.29875 11.6892L2.58125 13.783C3.96042 16.4817 6.76125 18.3334 10 18.3334Z" fill="#4CAF50"/>
                    <path d="M18.1713 8.36796H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.988L13.0079 13.9871L15.5871 16.1696C15.4046 16.3355 18.3333 14.1667 18.3333 10C18.3333 9.44129 18.2758 8.89587 18.1713 8.36796Z" fill="#1976D2"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center h-[48px] bg-white border border-[#e0e2ef] rounded-[12px] hover:bg-[#f8f8fc] hover:border-[#c1a0fd]/30 transition-all duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 14.9912 3.65684 19.1283 8.4375 19.8785V12.8906H5.89844V10H8.4375V7.79688C8.4375 5.29063 9.93047 3.90625 12.2146 3.90625C13.3084 3.90625 14.4531 4.10156 14.4531 4.10156V6.5625H13.1922C11.9499 6.5625 11.5625 7.3334 11.5625 8.125V10H14.3359L13.8926 12.8906H11.5625V19.8785C16.3432 19.1283 20 14.9912 20 10Z" fill="#1877F2"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center h-[48px] bg-white border border-[#e0e2ef] rounded-[12px] hover:bg-[#f8f8fc] hover:border-[#c1a0fd]/30 transition-all duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.4277 10.5889C14.4176 8.88555 15.1152 7.63086 16.5254 6.69336C15.7334 5.56445 14.5342 4.94336 12.9551 4.82227C11.4609 4.70508 9.82422 5.70898 9.22656 5.70898C8.59375 5.70898 7.13672 4.86523 5.98828 4.86523C3.61328 4.90234 1.09375 6.73047 1.09375 10.7852C1.09375 11.9531 1.30469 13.1602 1.72656 14.4062C2.29297 16.0664 4.33984 19.8926 6.47656 19.8223C7.54688 19.7969 8.31641 19.0488 9.71484 19.0488C11.0742 19.0488 11.7832 19.8223 12.9746 19.8223C15.1289 19.793 16.9727 16.3184 17.5098 14.6543C14.3066 13.1367 14.4277 10.6816 14.4277 10.5889ZM12.0312 3.32422C13.1758 1.96484 13.0703 0.726562 13.0352 0.3125C12.0273 0.371094 10.8633 0.996094 10.2031 1.76953C9.47656 2.60156 9.05469 3.62891 9.14844 4.80078C10.2383 4.88672 11.2266 4.33203 12.0312 3.32422Z" fill="#111125"/>
                  </svg>
                </button>
              </div>

              {/* Login link */}
              <p className="text-center text-[13px] text-[#111125]/60 mt-6">
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

      {/* Right side - Image / Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#c1a0fd] to-[#9171d9] relative overflow-hidden items-center justify-center">
        {/* Decorative circles */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-150px] left-[-50px] w-[300px] h-[300px] rounded-full bg-white/5" />
        <div className="absolute top-[40%] left-[10%] w-[200px] h-[200px] rounded-full bg-white/5" />

        <div className="relative z-10 text-center px-12 max-w-[520px]">
          {/* Illustration */}
          <div className="mb-10">
            <div className="w-[200px] h-[200px] mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15C30 15 20 30 20 45C20 60 30 75 50 85C70 75 80 60 80 45C80 30 70 15 50 15Z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
                <circle cx="50" cy="42" r="12" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1.5"/>
                <path d="M35 68C35 58 42 52 50 52C58 52 65 58 65 68" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M38 35L42 38M62 35L58 38" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <h3 className="text-[28px] font-bold text-white mb-4 leading-tight">
            Des repas faits maison,{' '}
            <span className="text-white/80">livrés chez vous</span>
          </h3>
          <p className="text-[15px] text-white/70 leading-relaxed mb-8">
            Rejoignez une communauté de passionnés de cuisine. Trouvez un kooker près de chez vous et savourez des plats authentiques préparés avec amour.
          </p>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-6 text-left">
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1L10.163 5.27865L15 5.97368L11.5 9.32135L12.326 14L8 11.7787L3.674 14L4.5 9.32135L1 5.97368L5.837 5.27865L8 1Z"/>
                </svg>
              ))}
            </div>
            <p className="text-[14px] text-white/90 leading-relaxed mb-4">
              "Grace a Weekook, je decouvre chaque semaine de nouveaux plats faits maison. C'est comme avoir un chef personnel !"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[12px] font-bold">
                ML
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Marie L.</p>
                <p className="text-[11px] text-white/50">Marseille</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
