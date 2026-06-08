import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChefHat, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'Réinitialiser le mot de passe | Weekook';
    if (!token) {
      navigate('/connexion', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setStatus('loading');
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      if (res.success) {
        setStatus('success');
      } else {
        setErrorMsg((res as any).error || 'Une erreur est survenue.');
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMsg(err?.error || 'Ce lien est invalide ou a expiré.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4fc] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 bg-[#c1a0fd] rounded-[10px] flex items-center justify-center">
            <ChefHat size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[#111125]">Weekook</span>
        </div>

        <div className="bg-white rounded-[20px] p-8 shadow-sm">
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[#111125]">Mot de passe modifié</h1>
              <p className="text-sm text-gray-500">Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.</p>
              <button
                onClick={() => navigate('/connexion')}
                className="w-full h-[48px] bg-[#c1a0fd] text-white rounded-[12px] font-semibold text-sm hover:bg-[#b090ed] transition-colors"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#111125] mb-1">Nouveau mot de passe</h1>
              <p className="text-sm text-gray-500 mb-6">Choisissez un mot de passe d'au moins 6 caractères.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#303044]">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-[48px] px-4 pr-12 border border-[#e6e6f0] rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#828294] hover:text-[#303044] transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#303044]">Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-[48px] px-4 pr-12 border border-[#e6e6f0] rounded-[8px] text-[14px] text-[#111125] placeholder:text-[#828294] focus:outline-none focus:border-[#c1a0fd] focus:ring-2 focus:ring-[#c1a0fd]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#828294] hover:text-[#303044] transition-colors"
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-500">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-[48px] bg-[#c1a0fd] text-white rounded-[12px] font-semibold text-sm hover:bg-[#b090ed] transition-colors disabled:opacity-60"
                >
                  {status === 'loading' ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/connexion')}
                  className="w-full text-center text-sm text-gray-400 hover:text-[#111125] transition-colors"
                >
                  Retour à la connexion
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
